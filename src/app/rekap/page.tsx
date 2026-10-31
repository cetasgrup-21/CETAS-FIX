"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";

type Judge = {
  judgeId: string;
  judgeName: string;
  value?: number;
  total?: number;
  scored?: number;
  expected?: number;
};

type Criterion = {
  id: string;
  name: string;
  sortOrder?: number;
  subCategoryId: string | null;
  subCategoryName: string | null;
  judges: Judge[];
  total: number;
  scored: number;
  expected: number;
};

type Category = {
  categoryId: string;
  categoryName: string;
  percentage: number;
  maximum: number;
  score: number;
  complete: boolean;
  scored: number;
  expected: number;
  judgeCount: number;
  judges: Judge[];
  criteria: Criterion[];
};

type Participant = {
  id: string;
  number: number;
  displayOrder?: number;
  name: string;
  school?: string | null;
  level?: string | null;
  eventLevelId?: string | null;
};

type Row = {
  participant: Participant;
  categories: Category[];
  rawScore: number;
  bonus: number;
  penalty: number;
  finalScore: number;
  complete: boolean;
  rank: number | null;
  timerSeconds: number;
  timerText: string;
  timerRecords: Array<{
    id: string;
    timerGroupId?: string | null;
    mode: string;
    status: string;
    startedAt?: string | null;
    stoppedAt?: string | null;
    durationSec?: number | null;
  }>;
};

type Level = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

type ApiResponse = {
  success: boolean;
  error?: string;

  event?: {
    id: string;
    name: string;
    date?: string | null;
    location?: string | null;
    logo?: string | null;
    totalPoints: number;
  };

  levels?: Level[];

  rows?: Row[];
};

type Group = {
  id: string;
  name: string;
  categoryIds: string[];
  bonus: number;
  penalty: number;
};

type SheetConfig = {
  id: string;
  categoryIds: string[];
};

const STORAGE_PREFIX =
  "cetas-rekap-groups:";

const SHEET_STORAGE_PREFIX =
  "cetas-rekap-sheets:";

function moneyNumber(value: unknown) {
  const n = Number(value ?? 0);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.floor(n);
}

function formatNumber(value: unknown) {
  return moneyNumber(value).toLocaleString(
    "id-ID"
  );
}

function makeGroupId() {
  return `group-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function makeDefaultGroups(
  categories: Category[]
): Group[] {
  if (!categories.length) {
    return [];
  }

  /*
   * Jangan otomatis memasukkan semua kategori ke Bagian.
   * User memang mengatur grouping dari halaman Rekap.
   */
  return [
    {
      id: makeGroupId(),
      name: "BAGIAN 1",
      categoryIds: [],
      bonus: 0,
      penalty: 0,
    },
  ];
}

function normalizeGroups(
  raw: unknown,
  categories: Category[]
): Group[] {
  if (!Array.isArray(raw)) {
    return makeDefaultGroups(categories);
  }

  const validIds = new Set(
    categories.map(
      (category) =>
        category.categoryId
    )
  );

  const seen = new Set<string>();

  const cleaned: Group[] = raw
    .filter(
      (item): item is Record<string, unknown> =>
        Boolean(
          item &&
          typeof item === "object"
        )
    )
    .map((item, index) => {
      const categoryIds = Array.isArray(
        item.categoryIds
      )
        ? item.categoryIds.filter(
            (id): id is string =>
              typeof id === "string" &&
              validIds.has(id) &&
              !seen.has(id)
          )
        : [];

      categoryIds.forEach((id) =>
        seen.add(id)
      );

      return {
        id:
          typeof item.id === "string" &&
          item.id
            ? item.id
            : makeGroupId(),
        name:
          typeof item.name === "string" &&
          item.name.trim()
            ? item.name.trim()
            : `BAGIAN ${index + 1}`,
        categoryIds,
        bonus: moneyNumber(
          item.bonus
        ),
        penalty: moneyNumber(
          item.penalty
        ),
      };
    });

  return cleaned.length
    ? cleaned
    : makeDefaultGroups(categories);
}

function makeDefaultSheets(
  categories: Category[]
): SheetConfig[] {
  if (!categories.length) {
    return [];
  }

  return [
    {
      id: "sheet-1",
      categoryIds: categories.map(
        (category) => category.categoryId
      ),
    },
  ];
}

function normalizeSheets(
  raw: unknown,
  categories: Category[]
): SheetConfig[] {
  if (!Array.isArray(raw)) {
    return makeDefaultSheets(categories);
  }

  const validIds = new Set(
    categories.map(
      (category) => category.categoryId
    )
  );

  const seen = new Set<string>();
  const cleaned: SheetConfig[] = [];

  raw.forEach((item, index) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const source = item as Record<string, unknown>;
    const categoryIds =
      Array.isArray(source.categoryIds)
        ? source.categoryIds.filter(
            (id): id is string =>
              typeof id === "string" &&
              validIds.has(id) &&
              !seen.has(id)
          )
        : [];

    categoryIds.forEach((id) =>
      seen.add(id)
    );

    if (categoryIds.length) {
      cleaned.push({
        id:
          typeof source.id === "string" &&
          source.id
            ? source.id
            : `sheet-${index + 1}`,
        categoryIds,
      });
    }
  });

  for (const category of categories) {
    if (!seen.has(category.categoryId)) {
      cleaned.push({
        id: `sheet-${cleaned.length + 1}`,
        categoryIds: [category.categoryId],
      });
    }
  }

  return cleaned.length
    ? cleaned.map((sheet, index) => ({
        ...sheet,
        id: `sheet-${index + 1}`,
      }))
    : makeDefaultSheets(categories);
}

function unique<T>(
  items: T[]
) {
  return Array.from(
    new Set(items)
  );
}

export default function RekapPage() {
  const [data, setData] =
    useState<ApiResponse | null>(
      null
    );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [levelId, setLevelId] =
    useState("");

  const [
    selectedParticipantId,
    setSelectedParticipantId,
  ] = useState("");

  const [groups, setGroups] =
    useState<Group[]>([]);

  const groupsHydratedKey =
    useRef("");

  const [
    selectedGroupId,
    setSelectedGroupId,
  ] = useState("");

  const [
    newGroupName,
    setNewGroupName,
  ] = useState("");

  const [sheets, setSheets] =
    useState<SheetConfig[]>([]);

  const [
    showSheetSettings,
    setShowSheetSettings,
  ] = useState(false);

  const sheetsHydratedKey =
    useRef("");

  const fetchData = useCallback(
    async (
      selectedLevelId = ""
    ) => {
      try {
        setLoading(true);
        setError("");

        const query =
          selectedLevelId
            ? `?eventLevelId=${encodeURIComponent(
                selectedLevelId
              )}`
            : "";

        const response =
          await fetch(
            `/api/rekap${query}`,
            {
              cache: "no-store",
            }
          );

        const json =
          (await response.json()) as ApiResponse;

        if (!response.ok) {
          throw new Error(
            json.error ||
              "Gagal mengambil data rekap."
          );
        }

        setData(json);

        const rows =
          json.rows || [];

        setSelectedParticipantId(
          (current) =>
            rows.some(
              (row) =>
                row.participant.id ===
                current
            )
              ? current
              : rows[0]?.participant.id ||
                ""
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Gagal mengambil data."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchData(levelId);
  }, [levelId, fetchData]);

  const rows =
    data?.rows || [];

  const levels =
    data?.levels || [];

  const selectedParticipant =
    rows.find(
      (row) =>
        row.participant.id ===
        selectedParticipantId
    ) || rows[0];

  const categories =
    useMemo(() => {
      const map =
        new Map<
          string,
          Category
        >();

      for (const row of rows) {
        for (const category of row.categories) {
          if (
            !map.has(
              category.categoryId
            )
          ) {
            map.set(
              category.categoryId,
              category
            );
          }
        }
      }

      return Array.from(
        map.values()
      );
    }, [rows]);

  /*
   * Load grouping berdasarkan event level.
   */
  useEffect(() => {
    if (!data?.event?.id) {
      return;
    }

    const key =
      `${STORAGE_PREFIX}${data.event.id}:${levelId || "all"}`;

    groupsHydratedKey.current = key;

    const saved =
      window.localStorage.getItem(
        key
      );

    if (saved) {
      try {
        const parsed =
          JSON.parse(saved);

        if (
          Array.isArray(parsed)
        ) {
          setGroups(
            normalizeGroups(
              parsed,
              categories
            )
          );
          return;
        }
      } catch {
        // ignore
      }
    }

    setGroups(
      makeDefaultGroups(
        categories
      )
    );
  }, [
    data?.event?.id,
    levelId,
    categories,
  ]);

  useEffect(() => {
    if (!data?.event?.id) {
      return;
    }

    const key =
      `${STORAGE_PREFIX}${data.event.id}:${levelId || "all"}`;

    if (groupsHydratedKey.current !== key) {
      return;
    }

    window.localStorage.setItem(
      key,
      JSON.stringify(groups)
    );
  }, [
    data?.event?.id,
    levelId,
    groups,
  ]);

  /*
   * Atur Lembar hanya mengatur pembagian kategori
   * pada dokumen cetak. Tidak mengubah data nilai,
   * kategori, atau konfigurasi penilaian.
   */
  useEffect(() => {
    if (!data?.event?.id) {
      return;
    }

    const key =
      `${SHEET_STORAGE_PREFIX}${data.event.id}:${levelId || "all"}`;

    sheetsHydratedKey.current = key;

    const saved =
      window.localStorage.getItem(key);

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          setSheets(
            normalizeSheets(
              parsed,
              categories
            )
          );
          return;
        }
      } catch {
        // ignore data lama yang rusak
      }
    }

    setSheets(
      makeDefaultSheets(categories)
    );
  }, [
    data?.event?.id,
    levelId,
    categories,
  ]);

  useEffect(() => {
    if (!data?.event?.id) {
      return;
    }

    const key =
      `${SHEET_STORAGE_PREFIX}${data.event.id}:${levelId || "all"}`;

    if (sheetsHydratedKey.current !== key) {
      return;
    }

    window.localStorage.setItem(
      key,
      JSON.stringify(sheets)
    );
  }, [
    data?.event?.id,
    levelId,
    sheets,
  ]);

  const allAssignedCategoryIds =
    useMemo(
      () =>
        unique(
          groups.flatMap(
            (group) =>
              group.categoryIds
          )
        ),
      [groups]
    );

  const unassignedCategories =
    categories.filter(
      (category) =>
        !allAssignedCategoryIds.includes(
          category.categoryId
        )
    );

  function createGroup() {
    const name =
      newGroupName.trim() ||
      `BAGIAN ${
        groups.length + 1
      }`;

    const group: Group = {
      id: makeGroupId(),
      name,
      categoryIds: [],
      bonus: 0,
      penalty: 0,
    };

    setGroups((current) => [
      ...current,
      group,
    ]);

    setSelectedGroupId(
      group.id
    );

    setNewGroupName("");
  }

  function updateGroupPoint(
    groupId: string,
    field: "bonus" | "penalty",
    value: string
  ) {
    const amount = Math.max(
      0,
      moneyNumber(value)
    );

    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
              ...group,
              [field]: amount,
            }
          : group
      )
    );
  }

  function renameGroup(
    groupId: string
  ) {
    const group =
      groups.find(
        (item) =>
          item.id === groupId
      );

    if (!group) {
      return;
    }

    const name =
      window.prompt(
        "Nama Bagian",
        group.name
      );

    if (!name?.trim()) {
      return;
    }

    setGroups((current) =>
      current.map(
        (item) =>
          item.id === groupId
            ? {
                ...item,
                name:
                  name.trim(),
              }
            : item
      )
    );
  }

  function deleteGroup(
    groupId: string
  ) {
    const group =
      groups.find(
        (item) =>
          item.id === groupId
      );

    if (!group) {
      return;
    }

    if (
      group.categoryIds.length >
      0
    ) {
      const confirmed =
        window.confirm(
          `Bagian "${group.name}" memiliki ${group.categoryIds.length} kategori. Hapus Bagian dan keluarkan kategorinya dari grouping?`
        );

      if (!confirmed) {
        return;
      }
    }

    setGroups((current) =>
      current.filter(
        (item) =>
          item.id !== groupId
      )
    );
  }

  function addCategoryToGroup(
    categoryId: string,
    groupId: string
  ) {
    setGroups((current) =>
      current.map(
        (group) => {
          const without =
            group.categoryIds.filter(
              (id) =>
                id !== categoryId
            );

          if (
            group.id === groupId
          ) {
            return {
              ...group,
              categoryIds: [
                ...without,
                categoryId,
              ],
            };
          }

          return {
            ...group,
            categoryIds:
              without,
          };
        }
      )
    );
  }

  function removeCategoryFromGroup(
    categoryId: string,
    groupId: string
  ) {
    setGroups((current) =>
      current.map(
        (group) =>
          group.id === groupId
            ? {
                ...group,
                categoryIds:
                  group.categoryIds.filter(
                    (id) =>
                      id !==
                      categoryId
                  ),
              }
            : group
      )
    );
  }

  function moveCategory(
    groupId: string,
    index: number,
    direction: -1 | 1
  ) {
    setGroups((current) =>
      current.map(
        (group) => {
          if (
            group.id !== groupId
          ) {
            return group;
          }

          const nextIndex =
            index + direction;

          if (
            nextIndex < 0 ||
            nextIndex >=
              group.categoryIds
                .length
          ) {
            return group;
          }

          const next = [
            ...group.categoryIds,
          ];

          const temp =
            next[index];

          next[index] =
            next[nextIndex];

          next[nextIndex] =
            temp;

          return {
            ...group,
            categoryIds: next,
          };
        }
      )
    );
  }

  function moveGroup(
    index: number,
    direction: -1 | 1
  ) {
    const nextIndex =
      index + direction;

    if (
      nextIndex < 0 ||
      nextIndex >= groups.length
    ) {
      return;
    }

    setGroups((current) => {
      const next = [
        ...current,
      ];

      const temp =
        next[index];

      next[index] =
        next[nextIndex];

      next[nextIndex] =
        temp;

      return next;
    });
  }

  function resetGrouping() {
    if (
      !window.confirm(
        "Reset grouping ke urutan kategori dari Admin?"
      )
    ) {
      return;
    }

    setGroups(
      makeDefaultGroups(
        categories
      )
    );
  }

  function updateSheetAssignment(
    categoryId: string,
    targetSheetIndex: number
  ) {
    setSheets((current) => {
      const next = current.map((sheet) => ({
        ...sheet,
        categoryIds:
          sheet.categoryIds.filter(
            (id) => id !== categoryId
          ),
      }));

      if (!next[targetSheetIndex]) {
        return current;
      }

      next[targetSheetIndex].categoryIds.push(
        categoryId
      );

      return next
        .filter(
          (sheet) =>
            sheet.categoryIds.length > 0
        )
        .map((sheet, index) => ({
          ...sheet,
          id: `sheet-${index + 1}`,
        }));
    });
  }

  function addSheet() {
    setSheets((current) => [
      ...current,
      {
        id: `sheet-${current.length + 1}`,
        categoryIds: [],
      },
    ]);
  }

  function removeSheet(index: number) {
    if (sheets.length <= 1) {
      return;
    }

    setSheets((current) => {
      const target = current[index];
      const next = current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );

      if (
        target?.categoryIds.length &&
        next.length
      ) {
        const fallbackIndex =
          index === 0 ? 0 : Math.min(index - 1, next.length - 1);

        next[fallbackIndex].categoryIds.push(
          ...target.categoryIds
        );
      }

      return next.map((sheet, itemIndex) => ({
        ...sheet,
        id: `sheet-${itemIndex + 1}`,
      }));
    });
  }

  function getCategoryById(
    row: Row,
    categoryId: string
  ) {
    return row.categories.find(
      (category) =>
        category.categoryId ===
        categoryId
    );
  }

  function getGroupForCategory(
    categoryId: string
  ) {
    return groups.find(
      (group) =>
        group.categoryIds.includes(
          categoryId
        )
    );
  }

  function calculateGroupTotals(
    row: Row,
    group: Group
  ) {
    const groupCategories =
      group.categoryIds
        .map((id) =>
          getCategoryById(
            row,
            id
          )
        )
        .filter(
          (
            category
          ): category is Category =>
            Boolean(category)
        );

    const judgeMap =
      new Map<
        string,
        {
          judgeId: string;
          judgeName: string;
          total: number;
        }
      >();

    for (const category of groupCategories) {
      for (const judge of category.judges) {
        const existing =
          judgeMap.get(
            judge.judgeId
          );

        if (existing) {
          existing.total +=
            moneyNumber(
              judge.total
            );
        } else {
          judgeMap.set(
            judge.judgeId,
            {
              judgeId:
                judge.judgeId,
              judgeName:
                judge.judgeName,
              total: moneyNumber(
                judge.total
              ),
            }
          );
        }
      }
    }

    const total =
      groupCategories.reduce(
        (sum, category) =>
          sum +
          moneyNumber(
            category.score
          ),
        0
      );

    /*
     * Bonus / penalty adalah data participant-level
     * dari struktur database yang sekarang.
     *
     * Karena grouping dibuat hanya di Rekap,
     * nilai P+ dan P- tetap ditempatkan di
     * footer Bagian yang sedang dicetak.
     *
     * Untuk menghindari penggandaan bonus/penalty
     * ketika satu peserta punya beberapa Bagian,
     * default diberikan hanya pada Bagian terakhir.
     */
    return {
      categories:
        groupCategories,

      judges:
        Array.from(
          judgeMap.values()
        ),

      total,
      bonus: moneyNumber(
        group.bonus
      ),
      penalty: moneyNumber(
        group.penalty
      ),
      totalPoint:
        total +
        moneyNumber(group.bonus) -
        moneyNumber(group.penalty),
    };
  }

  function buildPrintHtml(row: Row) {
    const timer = row.timerText || "00:00:00";

    // Header tetap menampilkan identitas juri, tetapi kolom penilaian
    // sengaja hanya menggunakan JURI 1, JURI 2, dst.
    const judgeList = Array.from(
      new Map(
        row.categories.flatMap((category) =>
          category.judges.map((judge) => [
            judge.judgeId,
            {
              judgeId: judge.judgeId,
              judgeName: judge.judgeName,
            },
          ])
        )
      ).values()
    );

    const judgeCount = judgeList.length;

    const categoryLookup = new Map(
      row.categories.map((category) => [
        category.categoryId,
        category,
      ])
    );

    const effectiveSheets = sheets.length
      ? sheets
          .map((sheet) => ({
            ...sheet,
            categoryIds:
              sheet.categoryIds.filter((id) =>
                categoryLookup.has(id)
              ),
          }))
          .filter(
            (sheet) =>
              sheet.categoryIds.length > 0
          )
      : [];

    const assignedSheetIds = unique(
      effectiveSheets.flatMap(
        (sheet) => sheet.categoryIds
      )
    );

    const missingSheetIds = row.categories
      .map(
        (category) => category.categoryId
      )
      .filter(
        (id) =>
          !assignedSheetIds.includes(id)
      );

    if (missingSheetIds.length) {
      if (effectiveSheets.length) {
        effectiveSheets[
          effectiveSheets.length - 1
        ].categoryIds.push(
          ...missingSheetIds
        );
      } else {
        effectiveSheets.push({
          id: "sheet-1",
          categoryIds: missingSheetIds,
        });
      }
    }

    // Grouping hanya menentukan urutan kategori. Tulisan BAGIAN tidak
    // pernah dicetak.
    const effectiveGroups = groups.length
      ? groups.map((group) => ({
          ...group,
          categoryIds: group.categoryIds.filter((id) =>
            categoryLookup.has(id)
          ),
        }))
      : [];

    const assignedIds = unique(
      effectiveGroups.flatMap((group) => group.categoryIds)
    );

    const missingIds = row.categories
      .map((category) => category.categoryId)
      .filter((id) => !assignedIds.includes(id));

    if (missingIds.length) {
      if (effectiveGroups.length) {
        effectiveGroups[effectiveGroups.length - 1].categoryIds.push(
          ...missingIds
        );
      } else {
        effectiveGroups.push({
          id: "auto",
          name: "",
          categoryIds: missingIds,
          bonus: 0,
          penalty: 0,
        });
      }
    }

    const allCategories = effectiveGroups.flatMap((group) =>
      group.categoryIds
        .map((id) => categoryLookup.get(id))
        .filter((category): category is Category => Boolean(category))
        .map((category) => ({ category, group }))
    );

    const grandJudgeTotals = new Map<string, number>();
    for (const judge of judgeList) {
      grandJudgeTotals.set(judge.judgeId, 0);
    }

    let grandTotal = 0;
    let grandBonus = 0;
    let grandPenalty = 0;

    for (const { category, group } of allCategories) {
      grandTotal += moneyNumber(category.score);
      for (const judge of category.judges) {
        grandJudgeTotals.set(
          judge.judgeId,
          moneyNumber(grandJudgeTotals.get(judge.judgeId)) +
            moneyNumber(judge.total)
        );
      }
      // P+ / P- masih dikonfigurasi per grouping di halaman Rekap.
      // Agar tidak menggandakan nilai, hanya kategori TERAKHIR dalam
      // grouping yang membawa P+ / P- tersebut ke footer kategori.
      const isLastCategoryInGroup =
        group.categoryIds[group.categoryIds.length - 1] ===
        category.categoryId;

      if (isLastCategoryInGroup) {
        grandBonus += moneyNumber(group.bonus);
        grandPenalty += moneyNumber(group.penalty);
      }
    }

    const grandPoint = grandTotal + grandBonus - grandPenalty;

    function renderCategorySummary(
      category: Category,
      group: Group
    ) {
      const categoryJudgeTotals = judgeList.map((assignedJudge) => {
        const judge = category.judges.find(
          (item) => item.judgeId === assignedJudge.judgeId
        );
        return moneyNumber(judge?.total);
      });

      const isLastCategoryInGroup =
        group.categoryIds[group.categoryIds.length - 1] ===
        category.categoryId;

      const bonus = isLastCategoryInGroup
        ? moneyNumber(group.bonus)
        : 0;
      const penalty = isLastCategoryInGroup
        ? moneyNumber(group.penalty)
        : 0;
      const categoryPoint =
        moneyNumber(category.score) + bonus - penalty;

      const totalJudgeCells = categoryJudgeTotals
        .map(
          (value) =>
            `<td class="num strong">${formatNumber(value)}</td>`
        )
        .join("");

      const judgeSpan = judgeCount + 2;

      return `
        <table class="summary category-summary">
          <tbody>
            <tr>
              <td class="summary-label" colspan="2">TOTAL NILAI</td>
              ${totalJudgeCells}
              <td class="num strong">${formatNumber(category.score)}</td>
            </tr>
            <tr>
              <td class="summary-label" colspan="${judgeSpan}">PENAMBAHAN POINT</td>
              <td class="num strong">${bonus ? `+${formatNumber(bonus)}` : "0"}</td>
            </tr>
            <tr>
              <td class="summary-label" colspan="${judgeSpan}">PENGURANGAN POINT</td>
              <td class="num strong">${penalty ? `-${formatNumber(penalty)}` : "0"}</td>
            </tr>
            <tr class="final-row">
              <td class="summary-label" colspan="${judgeSpan}">TOTAL POINT</td>
              <td class="num strong">${formatNumber(categoryPoint)}</td>
            </tr>
          </tbody>
        </table>
      `;
    }

    function renderCategory(category: Category, group: Group) {
      const subMap = new Map<
        string,
        { name: string; criteria: Criterion[] }
      >();

      const directCriteria = category.criteria.filter(
        (criterion) => !criterion.subCategoryId
      );

      if (directCriteria.length) {
        subMap.set("__DIRECT__", {
          name: "",
          criteria: directCriteria,
        });
      }

      for (const criterion of category.criteria) {
        if (!criterion.subCategoryId) continue;

        const id = criterion.subCategoryId;
        const existing = subMap.get(id);

        if (existing) {
          existing.criteria.push(criterion);
        } else {
          subMap.set(id, {
            name: criterion.subCategoryName || "Sub Kategori",
            criteria: [criterion],
          });
        }
      }

      const criterionNumber = new Map(
        category.criteria.map((criterion, index) => [
          criterion.id,
          index + 1,
        ])
      );

      const subEntries = Array.from(subMap.values());

      const subBlocks = subEntries
        .map((sub, subIndex) => {
          const rowsHtml = sub.criteria
            .map((criterion) => {
              const judgeCells = judgeList
                .map((assignedJudge) => {
                  const judge = criterion.judges.find(
                    (item) => item.judgeId === assignedJudge.judgeId
                  );
                  return `<td class="num">${
                    judge ? formatNumber(judge.value) : ""
                  }</td>`;
                })
                .join("");

              return `
                <tr>
                  <td class="no">${criterionNumber.get(criterion.id) ?? ""}</td>
                  <td>${escapeHtml(criterion.name)}</td>
                  ${judgeCells}
                  <td class="num total-cell">${formatNumber(criterion.total)}</td>
                </tr>
              `;
            })
            .join("");

          const subBlock = `
            <div class="subcategory-block">
              ${
                sub.name
                  ? `<div class="subcategory"><span>${escapeHtml(sub.name)}</span></div>`
                  : ""
              }
              <table class="score-table">
                <thead>
                  <tr>
                    <th class="no">NO</th>
                    <th>MATERI PENILAIAN</th>
                    ${judgeList
                      .map(
                        (_, index) =>
                          `<th class="num">JURI ${index + 1}</th>`
                      )
                      .join("")}
                    <th class="num">NILAI</th>
                  </tr>
                </thead>
                <tbody>${rowsHtml}</tbody>
              </table>
            </div>
          `;

          /*
           * ATURAN CETAK:
           * Kotak total kategori HARUS menempel dengan subkategori terakhir.
           *
           * Jadi sub terakhir + TOTAL NILAI + PENAMBAHAN POINT +
           * PENGURANGAN POINT + TOTAL POINT diperlakukan sebagai satu
           * blok saat browser melakukan pagination.
           */
          if (subIndex === subEntries.length - 1) {
            return `
              <div class="last-subcategory-with-summary">
                ${subBlock}
                ${renderCategorySummary(category, group)}
              </div>
            `;
          }

          return subBlock;
        })
        .join("");

      /*
       * Jika kategori tidak memiliki subkategori, total tetap dibuat
       * sebagai blok tersendiri. Kasus normal (ada subkategori) memakai
       * wrapper last-subcategory-with-summary di atas.
       */
      const summaryWithoutSubcategory =
        subEntries.length === 0
          ? renderCategorySummary(category, group)
          : "";

      return `
        <section class="category-section">
          <div class="category-heading">
            <span class="category-marker"></span>
            <span>${escapeHtml(category.categoryName)}</span>
          </div>
          ${subBlocks}
          ${summaryWithoutSubcategory}
        </section>
      `;
    }

    const cetasLogoUrl = "/cetas-score-logo.png";
    const cetasLogo = `<img class="cetas-logo-image" src="${cetasLogoUrl}" alt="CETAS.SCORE" />`;

    const eventLogo = data?.event?.logo
      ? `<img class="event-logo" src="${escapeHtml(data.event.logo)}" alt="Logo Event" />`
      : `<div class="event-logo placeholder-logo">LOGO EVENT</div>`;

    const watermark = `
      <div class="watermark" aria-hidden="true">
        <img src="${cetasLogoUrl}" alt="" />
      </div>
    `;

    const printHeader = `
      <header class="print-header">
        <div class="brand-row">
          <div class="brand-logo-slot">${cetasLogo}</div>
          <div class="event-center">
            <div class="event-name">${escapeHtml(data?.event?.name || "PENILAIAN JURI")}</div>
            <div class="event-meta">
              ${escapeHtml(data?.event?.location || "")}
              ${data?.event?.date ? ` • ${escapeHtml(new Date(data.event.date).toLocaleDateString("id-ID"))}` : ""}
            </div>
          </div>
          <div class="brand-logo-slot">${eventLogo}</div>
        </div>

        <div class="info">
          <div class="label">NO. URUT</div>
          <div>${escapeHtml(String(row.participant.number ?? ""))}</div>
          <div class="label">WAKTU TAMPIL</div>
          <div>${escapeHtml(timer)}</div>

          <div class="label">NAMA PASUKAN</div>
          <div>${escapeHtml(row.participant.name)}</div>
          <div class="label">TINGKATAN</div>
          <div>${escapeHtml(row.participant.level || "")}</div>

          <div class="label">JURI</div>
          <div class="judge-list">
            ${
              judgeList.length
                ? judgeList
                    .map(
                      (judge, index) =>
                        `${index + 1}. ${escapeHtml(judge.judgeName)} (JURI ${index + 1})`
                    )
                    .join("<br>")
                : "—"
            }
          </div>
          <div class="label">SEKOLAH</div>
          <div>${escapeHtml(row.participant.school || "—")}</div>
        </div>
      </header>
    `;

    const htmlCategories = effectiveSheets
      .map((sheet, sheetIndex) => {
        const sheetCategories = sheet.categoryIds
          .map((id) => {
            const category = categoryLookup.get(id);

            if (!category) {
              return null;
            }

            const group =
              effectiveGroups.find(
                (item) =>
                  item.categoryIds.includes(id)
              ) || {
                id: `auto-group-${id}`,
                name: "",
                categoryIds: [id],
                bonus: 0,
                penalty: 0,
              };

            return renderCategory(
              category,
              group
            );
          })
          .filter(Boolean)
          .join("");

        return `
          <section class="print-sheet ${
            sheetIndex > 0
              ? "print-sheet-break"
              : ""
          }">
            ${printHeader}
            ${sheetCategories}
            <div class="sheet-number">
              LEMBAR ${sheetIndex + 1} / ${
                effectiveSheets.length
              }
            </div>
          </section>
        `;
      })
      .join("");

    const grandJudgeCells = judgeList
      .map(
        (judge) =>
          `<td class="num strong">${formatNumber(
            grandJudgeTotals.get(judge.judgeId) || 0
          )}</td>`
      )
      .join("");

    return `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Penilaian Juri - ${escapeHtml(row.participant.name)}</title>
          <style>
            @page { size: F4 portrait; margin: 8mm; }
            * { box-sizing: border-box; }
            body {
              margin: 0;
              color: #0f172a;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 10px;
              line-height: 1.3;
              background: #fff;
            }
            .page-shell { position: relative; }

            .print-sheet {
              position: relative;
              break-inside: auto;
              page-break-inside: auto;
              min-height: 1px;
            }

            .print-sheet-break {
              break-before: page !important;
              page-break-before: always !important;
            }

            .sheet-number {
              margin: 8px 0 12px;
              color: #64748b;
              font-size: 7px;
              font-weight: 800;
              text-align: right;
              letter-spacing: .5px;
            }

            .print-header {
              position: relative;
              border-bottom: 2px solid #0b1f44;
              padding-bottom: 8px;
              margin-bottom: 12px;
            }
            .brand-row {
              display: grid;
              grid-template-columns: 1fr 2fr 1fr;
              gap: 12px;
              align-items: center;
              min-height: 62px;
              margin-bottom: 8px;
            }
            .brand-logo-slot {
              width: 92px;
              height: 62px;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto;
            }
            .cetas-logo-image {
              width: 82px;
              height: 56px;
              object-fit: contain;
              object-position: center;
            }
            .event-center { text-align: center; }
            .event-name {
              font-size: 17px;
              line-height: 1.15;
              font-weight: 900;
              color: #0b1f44;
              text-transform: uppercase;
            }
            .event-meta {
              margin-top: 3px;
              font-size: 8px;
              color: #64748b;
            }
            .event-logo {
              width: 82px;
              height: 56px;
              object-fit: contain;
              object-position: center;
              display: block;
            }
            .placeholder-logo {
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1px dashed #cbd5e1;
              color: #94a3b8;
              font-size: 7px;
            }
            .info {
              display: grid;
              grid-template-columns: 105px 1fr 105px 1fr;
              border: 1px solid #94a3b8;
            }
            .info div {
              min-height: 24px;
              padding: 5px 7px;
              border-right: 1px solid #cbd5e1;
              border-bottom: 1px solid #cbd5e1;
            }
            .info .label {
              background: #f1f5f9;
              color: #0b1f44;
              font-weight: 800;
              text-transform: uppercase;
              font-size: 8px;
            }
            .judge-list { line-height: 1.35; }

            .category-section {
              margin: 0 0 18px;
              break-inside: auto;
              page-break-inside: auto;
            }
            .category-section + .category-section {
              margin-top: 18px;
            }
            .category-heading {
              display: flex;
              align-items: center;
              gap: 7px;
              margin: 0 0 7px;
              padding: 6px 9px;
              border-left: 5px solid #0b1f44;
              border-bottom: 1px solid #cbd5e1;
              background: linear-gradient(90deg, #eef4ff 0%, #ffffff 75%);
              color: #0b1f44;
              font-size: 13px;
              font-weight: 900;
              text-transform: uppercase;
              letter-spacing: .3px;
              break-after: avoid;
              page-break-after: avoid;
            }
            .category-marker {
              width: 7px;
              height: 7px;
              border-radius: 50%;
              background: #d39a17;
              flex: 0 0 auto;
            }
            .subcategory-block {
              margin: 0 0 10px;
              break-inside: avoid;
              page-break-inside: avoid;
              -webkit-column-break-inside: avoid;
            }
            /*
             * TOTAL KATEGORI WAJIB MENYATU DENGAN SUB TERAKHIR.
             * Wrapper ini menjaga subkategori terakhir dan kotak total
             * sebagai satu unit ketika browser melakukan pagination.
             */
            .last-subcategory-with-summary {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
              -webkit-column-break-inside: avoid !important;
            }
            .subcategory {
              margin: 9px 0 4px;
              color: #0b1f44;
              font-size: 9px;
              font-weight: 900;
              text-transform: uppercase;
              break-after: avoid;
              page-break-after: avoid;
            }
            .subcategory span {
              display: inline-block;
              padding: 3px 7px;
              border-left: 3px solid #d39a17;
              background: #f8fafc;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            .score-table {
              margin-bottom: 6px;
              break-inside: auto;
              page-break-inside: auto;
            }
            .score-table thead { display: table-header-group; }
            .score-table tr { break-inside: avoid; page-break-inside: avoid; }
            @media print {
              .print-sheet {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }

              .print-sheet-break {
                break-before: page !important;
                page-break-before: always !important;
              }

              /*
               * Jangan mengunci seluruh kategori sebagai satu blok.
               * Kalau kategori lebih tinggi dari sisa halaman, Chrome
               * akan meninggalkan halaman kosong. Kategori boleh mengalir
               * ke halaman berikutnya, tetapi setiap baris tabel tetap
               * dijaga agar tidak terpotong.
               */
              .category-section {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }

              .subcategory-block {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }

              /*
               * SUB TERAKHIR + KOTAK TOTAL HARUS TETAP BERSAMA.
               * Jangan izinkan Chrome memisahkan TOTAL KATEGORI dari
               * subkategori terakhir saat mencetak.
               */
              .last-subcategory-with-summary {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
                -webkit-column-break-inside: avoid !important;
              }

              .category-summary {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }

              .score-table {
                break-inside: auto !important;
                page-break-inside: auto !important;
              }

              .score-table thead {
                display: table-header-group;
              }

              .score-table tr {
                break-inside: avoid !important;
                page-break-inside: avoid !important;
              }
            }
            th, td {
              border: 1px solid #94a3b8;
              padding: 4px 5px;
              vertical-align: middle;
            }
            th {
              background: #eef2f7;
              color: #0b1f44;
              font-size: 8px;
              text-align: center;
              font-weight: 900;
              text-transform: uppercase;
            }
            td { font-size: 8.5px; }
            td.no, th.no { width: 32px; text-align: center; }
            td.num, th.num { width: 62px; text-align: center; }
            .total-cell { font-weight: 900; }

            .summary {
              margin-top: 5px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .summary td { padding: 5px 7px; }
            .summary-label {
              background: #f8fafc;
              color: #0b1f44;
              font-weight: 900;
              text-transform: uppercase;
            }
            .strong { font-weight: 900; }
            .final-row td {
              background: #0b1f44;
              color: #fff;
              font-weight: 900;
              border-top: 2px solid #0b1f44;
            }
            .category-summary {
              margin-top: 10px;
              margin-bottom: 20px;
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }

            .grand-total {
              margin-top: 20px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .grand-title {
              padding: 7px 9px;
              background: #0b1f44;
              color: white;
              font-size: 12px;
              font-weight: 900;
              text-align: center;
              letter-spacing: .6px;
            }
            .grand-total .summary { margin-top: 0; }
            .grand-total .summary-label { background: #e9eef7; }

            .signatures {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 40px;
              margin-top: 28px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .signature { text-align: center; min-height: 95px; }
            .signature-space { height: 58px; }
            .signature-line {
              border-bottom: 1px solid #0f172a;
              display: inline-block;
              min-width: 170px;
              padding-bottom: 3px;
            }
            .watermark {
              position: fixed;
              left: 50%;
              top: 50%;
              transform: translate(-50%, -50%);
              width: 390px;
              opacity: .10;
              z-index: -1;
              pointer-events: none;
            }
            .watermark img {
              width: 100%;
              height: auto;
              display: block;
            }
            .footer-note {
              margin-top: 12px;
              font-size: 8px;
              color: #94a3b8;
              text-align: center;
            }
            @media print {
              body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          ${watermark}
          ${htmlCategories}

          <section class="grand-total">
            <div class="grand-title">GRAND TOTAL</div>
            <table class="summary">
              <tbody>
                <tr>
                  <td class="summary-label" colspan="2">TOTAL NILAI</td>
                  ${grandJudgeCells}
                  <td class="num strong">${formatNumber(grandTotal)}</td>
                </tr>
                <tr>
                  <td class="summary-label" colspan="${judgeCount + 2}">PENAMBAHAN POINT</td>
                  <td class="num strong">${grandBonus ? `+${formatNumber(grandBonus)}` : "0"}</td>
                </tr>
                <tr>
                  <td class="summary-label" colspan="${judgeCount + 2}">PENGURANGAN POINT</td>
                  <td class="num strong">${grandPenalty ? `-${formatNumber(grandPenalty)}` : "0"}</td>
                </tr>
                <tr class="final-row">
                  <td class="summary-label" colspan="${judgeCount + 2}">TOTAL POINT</td>
                  <td class="num strong">${formatNumber(grandPoint)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <div class="signatures">
            <div class="signature">
              <strong>TIM REKAP</strong>
              <div class="signature-space"></div>
              <div class="signature-line">TTD / NAMA</div>
            </div>
            <div class="signature">
              <strong>PELATIH / OFFICIAL</strong>
              <div class="signature-space"></div>
              <div class="signature-line">TTD / NAMA</div>
            </div>
          </div>

          <div class="footer-note">
            Dokumen Penilaian Juri — ${escapeHtml(row.participant.name)}
          </div>
        </body>
      </html>
    `;
  }

  function escapeHtml(
    value: string
  ) {
    return value
      .replaceAll("&", "&amp;")
      .replaceAll(
        "<",
        "&lt;"
      )
      .replaceAll(
        ">",
        "&gt;"
      )
      .replaceAll(
        '"',
        "&quot;"
      )
      .replaceAll(
        "'",
        "&#039;"
      );
  }

  function printParticipant(
    row: Row
  ) {
    const html =
      buildPrintHtml(row);

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=1100,height=800"
      );

    if (!printWindow) {
      window.alert(
        "Popup diblokir browser. Izinkan popup untuk mencetak."
      );

      return;
    }

    printWindow.document.open();
    printWindow.document.write(
      html
    );
    printWindow.document.close();

    const printWhenReady = () => {
      const images = Array.from(
        printWindow.document.images
      );

      if (!images.length) {
        printWindow.focus();
        printWindow.print();
        return;
      }

      let remaining = images.length;
      let printed = false;

      const doPrint = () => {
        if (printed) return;
        printed = true;
        printWindow.focus();
        printWindow.print();
      };

      const done = () => {
        remaining -= 1;
        if (remaining <= 0) {
          setTimeout(doPrint, 150);
        }
      };

      images.forEach((image) => {
        if (image.complete) {
          done();
        } else {
          image.addEventListener("load", done, {
            once: true,
          });
          image.addEventListener("error", done, {
            once: true,
          });
        }
      });

      // Jangan biarkan gambar eksternal membuat print menggantung.
      setTimeout(doPrint, 2000);
    };

    setTimeout(printWhenReady, 100);
  }

  const selectedGroups =
    selectedParticipant
      ? groups
          .map((group) => ({
            ...group,
            categoryIds:
              group.categoryIds.filter(
                (categoryId) =>
                  selectedParticipant.categories.some(
                    (category) =>
                      category.categoryId ===
                      categoryId
                  )
              ),
          }))
          .filter(
            (group) =>
              group.categoryIds
                .length > 0
          )
      : [];

  const configuredBonus =
    selectedGroups.reduce(
      (sum, group) =>
        sum + moneyNumber(group.bonus),
      0
    );

  const configuredPenalty =
    selectedGroups.reduce(
      (sum, group) =>
        sum + moneyNumber(group.penalty),
      0
    );

  const configuredTotalPoint =
    selectedParticipant
      ? selectedParticipant.rawScore +
        configuredBonus -
        configuredPenalty
      : 0;

  return (
    <main className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                CETAS.ID
              </p>

              <h1 className="mt-1 text-2xl font-black text-slate-900">
                Rekap Penilaian
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Pengelompokan bagian dan
                print penilaian juri.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  window.location.assign(
                    "/admin/dashboard"
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                ← Dashboard Admin
              </button>

              <button
                onClick={() =>
                  setShowSheetSettings(
                    (value) => !value
                  )
                }
                className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
              >
                ⚙ Atur Lembar
              </button>

              <button
                onClick={() =>
                  fetchData(levelId)
                }
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </section>

        {/* ATUR LEMBAR */}
        {showSheetSettings && (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-blue-600">
                  Pengaturan Cetak
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-900">
                  Susunan Lembar Rekap
                </h2>

                <p className="mt-1 max-w-3xl text-sm text-slate-500">
                  Tentukan kategori masuk ke lembar berapa.
                  Pembagian ini hanya mengatur layout cetak dan
                  tidak mengubah nilai, bobot, atau data penilaian.
                </p>
              </div>

              <button
                onClick={addSheet}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
              >
                + Lembar
              </button>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {categories.map((category) => {
                const currentSheet =
                  sheets.findIndex((sheet) =>
                    sheet.categoryIds.includes(
                      category.categoryId
                    )
                  );

                return (
                  <div
                    key={category.categoryId}
                    className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {category.categoryName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatNumber(category.score)} nilai
                      </p>
                    </div>

                    <select
                      value={
                        currentSheet < 0
                          ? 0
                          : currentSheet
                      }
                      onChange={(event) =>
                        updateSheetAssignment(
                          category.categoryId,
                          Number(
                            event.target.value
                          )
                        )
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-slate-900"
                    >
                      {sheets.map(
                        (sheet, index) => (
                          <option
                            key={sheet.id}
                            value={index}
                          >
                            Lembar {index + 1}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {sheets.map((sheet, index) => (
                <div
                  key={sheet.id}
                  className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-2 text-xs font-bold text-slate-800"
                >
                  <span className="text-blue-700">
                    Lembar {index + 1}
                  </span>

                  <span className="text-slate-500">
                    {sheet.categoryIds
                      .map(
                        (id) =>
                          categories.find(
                            (category) =>
                              category.categoryId ===
                              id
                          )?.categoryName
                      )
                      .filter(Boolean)
                      .join(" + ") || "Kosong"}
                  </span>

                  {sheets.length > 1 && (
                    <button
                      onClick={() =>
                        removeSheet(index)
                      }
                      className="ml-1 text-base leading-none text-red-500 hover:text-red-700"
                      title="Hapus lembar"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FILTER */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Tingkatan
            </label>

            <select
              value={levelId}
              onChange={(event) => {
                setLevelId(
                  event.target.value
                );
                setSelectedParticipantId(
                  ""
                );
              }}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-900"
            >
              <option value="">
                Semua Tingkatan
              </option>

              {levels.map(
                (level) => (
                  <option
                    key={level.id}
                    value={level.id}
                  >
                    {level.name}
                  </option>
                )
              )}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Peserta
            </label>

            <select
              value={
                selectedParticipantId ||
                ""
              }
              onChange={(event) =>
                setSelectedParticipantId(
                  event.target.value
                )
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold outline-none focus:border-slate-900"
            >
              {rows.map(
                (row) => (
                  <option
                    key={
                      row.participant
                        .id
                    }
                    value={
                      row.participant
                        .id
                    }
                  >
                    {
                      row.participant
                        .number
                    }{" "}
                    —{" "}
                    {
                      row.participant
                        .name
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">
              Timer
            </label>

            <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm font-black text-slate-900">
              {selectedParticipant?.timerText || "00:00:00"}
            </div>
          </div>
        </section>

        {loading && (
          <section className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500">
            Mengambil data rekap...
          </section>
        )}

        {error && (
          <section className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700">
            {error}
          </section>
        )}

        {!loading &&
          !error &&
          selectedParticipant && (
            <>
              {/* PARTICIPANT */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Peserta Terpilih
                    </p>

                    <div className="mt-2 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-lg font-black text-white">
                        {
                          selectedParticipant
                            .participant
                            .number
                        }
                      </div>

                      <div>
                        <h2 className="text-xl font-black text-slate-900">
                          {
                            selectedParticipant
                              .participant
                              .name
                          }
                        </h2>

                        <p className="text-sm text-slate-500">
                          {
                            selectedParticipant
                              .participant
                              .school ||
                            "—"
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="rounded-xl bg-slate-100 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        Akumulasi
                      </p>

                      <p className="text-lg font-black text-slate-900">
                        {formatNumber(
                          selectedParticipant.rawScore
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        P+
                      </p>

                      <p className="text-lg font-black text-slate-900">
                        +
                        {formatNumber(
                          configuredBonus
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-100 px-4 py-3">
                      <p className="text-[10px] font-bold uppercase text-slate-500">
                        P-
                      </p>

                      <p className="text-lg font-black text-slate-900">
                        -
                        {formatNumber(
                          configuredPenalty
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-900 px-4 py-3 text-white">
                      <p className="text-[10px] font-bold uppercase text-slate-300">
                        Total Point
                      </p>

                      <p className="text-lg font-black">
                        {formatNumber(
                          configuredTotalPoint
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* GROUPING */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Pengaturan Rekap
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Bagian Penilaian
                    </h2>

                    <p className="mt-1 max-w-2xl text-sm text-slate-500">
                      Atur kategori ke dalam
                      Bagian. Footer akan
                      muncul setelah seluruh
                      kategori dalam Bagian
                      tersebut selesai.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <input
                      value={newGroupName}
                      onChange={(event) =>
                        setNewGroupName(
                          event.target.value
                        )
                      }
                      placeholder="Nama Bagian"
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-slate-900"
                    />

                    <button
                      onClick={
                        createGroup
                      }
                      className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-bold text-white"
                    >
                      + Bagian
                    </button>

                    <button
                      onClick={
                        resetGrouping
                      }
                      className="rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="mt-6 grid gap-4">
                  {groups.map(
                    (
                      group,
                      groupIndex
                    ) => (
                      <div
                        key={group.id}
                        className={`rounded-2xl border p-4 ${
                          selectedGroupId ===
                          group.id
                            ? "border-slate-900 bg-slate-50"
                            : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-black text-white">
                              {groupIndex +
                                1}
                            </div>

                            <div>
                              <h3 className="font-black text-slate-900">
                                {
                                  group.name
                                }
                              </h3>

                              <p className="text-xs text-slate-500">
                                {
                                  group
                                    .categoryIds
                                    .length
                                }{" "}
                                kategori
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() =>
                                setSelectedGroupId(
                                  group.id
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                            >
                              Pilih
                            </button>

                            <button
                              onClick={() =>
                                renameGroup(
                                  group.id
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold"
                            >
                              Rename
                            </button>

                            <button
                              disabled={
                                groupIndex ===
                                0
                              }
                              onClick={() =>
                                moveGroup(
                                  groupIndex,
                                  -1
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold disabled:opacity-30"
                            >
                              ↑
                            </button>

                            <button
                              disabled={
                                groupIndex ===
                                groups.length -
                                  1
                              }
                              onClick={() =>
                                moveGroup(
                                  groupIndex,
                                  1
                                )
                              }
                              className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold disabled:opacity-30"
                            >
                              ↓
                            </button>

                            <button
                              onClick={() =>
                                deleteGroup(
                                  group.id
                                )
                              }
                              className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600"
                            >
                              Hapus
                            </button>
                          </div>
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {group.categoryIds.map(
                            (
                              categoryId,
                              categoryIndex
                            ) => {
                              const category =
                                categories.find(
                                  (
                                    item
                                  ) =>
                                    item.categoryId ===
                                    categoryId
                                );

                              if (
                                !category
                              ) {
                                return null;
                              }

                              return (
                                <div
                                  key={
                                    categoryId
                                  }
                                  className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                                >
                                  <span>
                                    {
                                      category.categoryName
                                    }
                                  </span>

                                  <button
                                    onClick={() =>
                                      moveCategory(
                                        group.id,
                                        categoryIndex,
                                        -1
                                      )
                                    }
                                    disabled={
                                      categoryIndex ===
                                      0
                                    }
                                    className="ml-1 rounded px-1 disabled:opacity-30"
                                  >
                                    ←
                                  </button>

                                  <button
                                    onClick={() =>
                                      moveCategory(
                                        group.id,
                                        categoryIndex,
                                        1
                                      )
                                    }
                                    disabled={
                                      categoryIndex ===
                                      group
                                        .categoryIds
                                        .length -
                                        1
                                    }
                                    className="rounded px-1 disabled:opacity-30"
                                  >
                                    →
                                  </button>

                                  <button
                                    onClick={() =>
                                      removeCategoryFromGroup(
                                        categoryId,
                                        group.id
                                      )
                                    }
                                    className="ml-1 rounded px-1 text-red-300 hover:text-white"
                                  >
                                    ×
                                  </button>
                                </div>
                              );
                            }
                          )}

                          {!group.categoryIds
                            .length && (
                            <span className="text-sm text-slate-400">
                              Belum ada kategori.
                            </span>
                          )}
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                          <label className="block">
                            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                              Penambahan Point
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={group.bonus}
                              onChange={(event) =>
                                updateGroupPoint(
                                  group.id,
                                  "bonus",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-slate-900"
                              placeholder="0"
                            />
                          </label>

                          <label className="block">
                            <span className="mb-1 block text-[11px] font-black uppercase tracking-wider text-slate-500">
                              Pengurangan Point
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={group.penalty}
                              onChange={(event) =>
                                updateGroupPoint(
                                  group.id,
                                  "penalty",
                                  event.target.value
                                )
                              }
                              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-bold outline-none focus:border-slate-900"
                              placeholder="0"
                            />
                          </label>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* ADD CATEGORY */}
                <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-bold text-slate-900">
                        Tambahkan kategori
                      </p>

                      <p className="text-xs text-slate-500">
                        Pilih Bagian terlebih
                        dahulu.
                      </p>
                    </div>

                    <select
                      value={
                        selectedGroupId
                      }
                      onChange={(event) =>
                        setSelectedGroupId(
                          event.target.value
                        )
                      }
                      className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
                    >
                      <option value="">
                        Pilih Bagian
                      </option>

                      {groups.map(
                        (group) => (
                          <option
                            key={
                              group.id
                            }
                            value={
                              group.id
                            }
                          >
                            {
                              group.name
                            }
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {unassignedCategories.map(
                      (category) => (
                        <button
                          key={
                            category.categoryId
                          }
                          disabled={
                            !selectedGroupId
                          }
                          onClick={() =>
                            addCategoryToGroup(
                              category.categoryId,
                              selectedGroupId
                            )
                          }
                          className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +{" "}
                          {
                            category.categoryName
                          }
                        </button>
                      )
                    )}

                    {!unassignedCategories.length && (
                      <p className="text-sm font-semibold text-emerald-600">
                        Semua kategori sudah
                        masuk Bagian.
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* PREVIEW */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                      Preview
                    </p>

                    <h2 className="mt-1 text-xl font-black text-slate-900">
                      Struktur Penilaian
                    </h2>
                  </div>

                  <button
                    onClick={() =>
                      printParticipant(
                        selectedParticipant
                      )
                    }
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-slate-800"
                  >
                    Print Penilaian Juri
                  </button>
                </div>

                <div className="mt-6 space-y-8">
                  {selectedGroups.map(
                    (group) => {
                      const totals =
                        calculateGroupTotals(
                          selectedParticipant,
                          group
                        );

                      return (
                        <div
                          key={group.id}
                          className="overflow-hidden rounded-2xl border border-slate-200"
                        >
                          <div className="bg-slate-900 px-5 py-4 text-white">
                            <h3 className="font-black">
                              {
                                group.name
                              }
                            </h3>
                          </div>

                          <div className="divide-y divide-slate-200">
                            {group.categoryIds.map(
                              (
                                categoryId
                              ) => {
                                const category =
                                  selectedParticipant.categories.find(
                                    (
                                      item
                                    ) =>
                                      item.categoryId ===
                                      categoryId
                                  );

                                if (
                                  !category
                                ) {
                                  return null;
                                }

                                const subCategories =
                                  unique(
                                    category.criteria
                                      .map(
                                        (
                                          criterion
                                        ) =>
                                          criterion.subCategoryName ||
                                          "__DIRECT__"
                                      )
                                  );

                                return (
                                  <div
                                    key={
                                      categoryId
                                    }
                                    className="p-5"
                                  >
                                    <h4 className="text-lg font-black text-slate-900">
                                      {
                                        category.categoryName
                                      }
                                    </h4>

                                    <p className="mt-1 text-xs text-slate-500">
                                      {
                                        category.scored
                                      }{" "}
                                      nilai /
                                      {
                                        category.expected
                                      }{" "}
                                      nilai
                                    </p>

                                    <div className="mt-4 space-y-4">
                                      {unique(
                                        category.criteria.map(
                                          (criterion) =>
                                            criterion.subCategoryName ||
                                            "__DIRECT__"
                                        )
                                      ).map(
                                        (subName) => {
                                          const criteria =
                                            category.criteria.filter(
                                              (criterion) =>
                                                (criterion.subCategoryName ||
                                                  "__DIRECT__") ===
                                                subName
                                            );

                                          return (
                                            <div key={subName}>
                                              {subName !== "__DIRECT__" && (
                                                <div className="mb-2 text-sm font-black uppercase tracking-wide text-slate-700">
                                                  {subName}
                                                </div>
                                              )}

                                              <div className="overflow-x-auto">
                                                <table className="w-full min-w-[700px] border-collapse text-sm">
                                        <thead>
                                          <tr className="bg-slate-100">
                                            <th className="border border-slate-200 px-3 py-2 text-center">
                                              NO
                                            </th>

                                            <th className="border border-slate-200 px-3 py-2 text-left">
                                              MATERI PENILAIAN
                                            </th>

                                            {category.judges.map(
                                              (
                                                judge,
                                                judgeIndex
                                              ) => (
                                                <th
                                                  key={
                                                    judge.judgeId
                                                  }
                                                  className="border border-slate-200 px-3 py-2 text-center"
                                                >
                                                  JURI {judgeIndex + 1}
                                                </th>
                                              )
                                            )}

                                            <th className="border border-slate-200 px-3 py-2 text-center">
                                              NILAI
                                            </th>
                                          </tr>
                                        </thead>

                                        <tbody>
                                          {category.criteria.map(
                                            (
                                              criterion,
                                              index
                                            ) => (
                                              <tr
                                                key={
                                                  criterion.id
                                                }
                                              >
                                                <td className="border border-slate-200 px-3 py-2 text-center">
                                                  {index +
                                                    1}
                                                </td>

                                                <td className="border border-slate-200 px-3 py-2">
                                                  {
                                                    criterion.name
                                                  }
                                                </td>

                                                {criterion.judges.map(
                                                  (
                                                    judge
                                                  ) => (
                                                    <td
                                                      key={
                                                        judge.judgeId
                                                      }
                                                      className="border border-slate-200 px-3 py-2 text-center font-semibold"
                                                    >
                                                      {formatNumber(
                                                        judge.value
                                                      )}
                                                    </td>
                                                  )
                                                )}

                                                <td className="border border-slate-200 px-3 py-2 text-center font-black">
                                                  {formatNumber(
                                                    criterion.total
                                                  )}
                                                </td>
                                              </tr>
                                            )
                                          )}
                                        </tbody>
                                                </table>
                                              </div>
                                            </div>
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                );
                              }
                            )}
                          </div>

                          {/* FOOTER BAGIAN */}
                          <div className="border-t-2 border-slate-900 bg-slate-50">
                            <div className="overflow-x-auto">
                              <table className="w-full min-w-[700px] border-collapse text-sm">
                                <tbody>
                                  <tr>
                                    <td
                                      colSpan={
                                        2
                                      }
                                      className="border border-slate-300 px-4 py-3 font-black"
                                    >
                                      TOTAL NILAI
                                    </td>

                                    {totals.judges.map(
                                      (
                                        judge
                                      ) => (
                                        <td
                                          key={
                                            judge.judgeId
                                          }
                                          className="border border-slate-300 px-4 py-3 text-center font-black"
                                        >
                                          {formatNumber(
                                            judge.total
                                          )}
                                        </td>
                                      )
                                    )}

                                    <td className="border border-slate-300 px-4 py-3 text-center font-black">
                                      {formatNumber(
                                        totals.total
                                      )}
                                    </td>
                                  </tr>

                                  <tr>
                                    <td
                                      colSpan={
                                        totals.judges
                                          .length +
                                        2
                                      }
                                      className="border border-slate-300 px-4 py-3 font-black"
                                    >
                                      PENAMBAHAN POINT
                                    </td>

                                    <td className="border border-slate-300 px-4 py-3 text-center font-black">
                                      {formatNumber(
                                        group.bonus
                                      )}
                                    </td>
                                  </tr>

                                  <tr>
                                    <td
                                      colSpan={
                                        totals.judges
                                          .length +
                                        2
                                      }
                                      className="border border-slate-300 px-4 py-3 font-black"
                                    >
                                      PENGURANGAN POINT
                                    </td>

                                    <td className="border border-slate-300 px-4 py-3 text-center font-black">
                                      {formatNumber(
                                        group.penalty
                                      )}
                                    </td>
                                  </tr>

                                  <tr className="bg-slate-900 text-white">
                                    <td
                                      colSpan={
                                        totals.judges
                                          .length +
                                        2
                                      }
                                      className="border border-slate-900 px-4 py-3 font-black"
                                    >
                                      TOTAL POINT
                                    </td>

                                    <td className="border border-slate-900 px-4 py-3 text-center text-lg font-black">
                                      {formatNumber(
                                        totals.totalPoint
                                      )}
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}
                </div>
              </section>

              {/* PARTICIPANT LIST */}
              <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Daftar Peserta
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900">
                    Print Penilaian
                  </h2>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-xs uppercase">
                        <th className="border border-slate-200 px-4 py-3 text-center">
                          NO
                        </th>

                        <th className="border border-slate-200 px-4 py-3 text-left">
                          NAMA PASUKAN
                        </th>

                        <th className="border border-slate-200 px-4 py-3 text-left">
                          SEKOLAH
                        </th>

                        <th className="border border-slate-200 px-4 py-3 text-center">
                          AKUMULASI
                        </th>

                        <th className="border border-slate-200 px-4 py-3 text-center">
                          TOTAL POINT
                        </th>

                        <th className="border border-slate-200 px-4 py-3 text-center">
                          AKSI
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {rows.map(
                        (row) => (
                          <tr
                            key={
                              row.participant
                                .id
                            }
                            className={
                              selectedParticipantId ===
                              row.participant
                                .id
                                ? "bg-slate-50"
                                : ""
                            }
                          >
                            <td className="border border-slate-200 px-4 py-3 text-center font-bold">
                              {
                                row
                                  .participant
                                  .number
                              }
                            </td>

                            <td className="border border-slate-200 px-4 py-3 font-bold">
                              {
                                row
                                  .participant
                                  .name
                              }
                            </td>

                            <td className="border border-slate-200 px-4 py-3 text-sm text-slate-500">
                              {
                                row
                                  .participant
                                  .school ||
                                "—"
                              }
                            </td>

                            <td className="border border-slate-200 px-4 py-3 text-center font-bold">
                              {formatNumber(
                                row.rawScore
                              )}
                            </td>

                            <td className="border border-slate-200 px-4 py-3 text-center font-black">
                              {formatNumber(
                                row.finalScore
                              )}
                            </td>

                            <td className="border border-slate-200 px-4 py-3 text-center">
                              <button
                                onClick={() => {
                                  setSelectedParticipantId(
                                    row
                                      .participant
                                      .id
                                  );

                                  setTimeout(
                                    () =>
                                      printParticipant(
                                        row
                                      ),
                                    50
                                  );
                                }}
                                className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-white"
                              >
                                Print
                              </button>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

        {!loading &&
          !error &&
          !selectedParticipant && (
            <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <h2 className="text-lg font-black text-slate-900">
                Belum ada peserta
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Peserta aktif akan muncul
                di sini setelah tersedia.
              </p>
            </section>
          )}
      </div>
    </main>
  );
}