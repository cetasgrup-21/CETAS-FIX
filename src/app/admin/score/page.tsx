"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Material = {
  id: string;
  name: string;
  category: string;
  section: string;
};

type Criterion = {
  id: string;
  name: string;
  interval: number | null;
  sortOrder: number;
  material?: Material | null;
  subCategoryId?: string | null;
};

type SubCategory = {
  id: string;
  name: string;
  sortOrder: number;
  criteria: Criterion[];
};

type Category = {
  id: string;
  name: string;
  percentage: number;
  eventLevelId?: string | null;
  sortOrder: number;
  subCategories: SubCategory[];
  criteria: Criterion[];
};

type EventLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
  status: string;
  _count?: {
    categories: number;
    participants: number;
  };
};

type EventData = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  totalPoints: number;
  logo?: string | null;
  inputMode?: "DIGITAL" | "PAPER";
  status?: string;
  categories: Category[];
};

type EventSummary = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  totalPoints: number;
  logo?: string | null;
  inputMode?: "DIGITAL" | "PAPER";
  status: string;
};

export default function AdminPage() {
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // TINGKATAN
  const [levels, setLevels] = useState<EventLevel[]>([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  // CATEGORY
  const [categoryName, setCategoryName] = useState("");
  const [categoryWeight, setCategoryWeight] = useState("0");
  const [categoryLevelId, setCategoryLevelId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedLevelForEdit, setSelectedLevelForEdit] = useState("");

  // EDIT CATEGORY
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingCategoryWeight, setEditingCategoryWeight] = useState("0");
  const [editingCategoryLevelId, setEditingCategoryLevelId] = useState("");

  // DUPLICATE CATEGORY
  const [duplicatingCategory, setDuplicatingCategory] = useState<Category | null>(null);
  const [duplicateTargetLevelId, setDuplicateTargetLevelId] = useState<string>("");
  const [duplicateTargetName, setDuplicateTargetName] = useState<string>("");
  const [duplicatingLoading, setDuplicatingLoading] = useState(false);

  // SUBCATEGORY
  const [subName, setSubName] = useState("");

  // EDIT SUBCATEGORY
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(null);
  const [editingSubName, setEditingSubName] = useState("");

  // MATERIAL
  const [materialName, setMaterialName] = useState("");
  const [interval, setInterval] = useState("2");
  const [materialId, setMaterialId] = useState("");
  const [masterMaterials, setMasterMaterials] = useState<Material[]>([]);

  // EDIT MATERI
  const [editingCriterionId, setEditingCriterionId] = useState<string | null>(null);
  const [editingCriterionName, setEditingCriterionName] = useState("");
  const [editingCriterionInterval, setEditingCriterionInterval] = useState("2");

  // SUBCATEGORY YANG SEDANG DIBUKA UNTUK TAMBAH MATERI
  const [activeMaterialSubCategory, setActiveMaterialSubCategory] =
    useState<string | null>(null);

  // EVENT
  const router = useRouter();
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventPoints, setEventPoints] = useState("5000");
  const [eventLogo, setEventLogo] = useState<string | null>(null);
  const [eventInputMode, setEventInputMode] = useState<"DIGITAL" | "PAPER">("DIGITAL");
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editingEventName, setEditingEventName] = useState("");
  const [editingEventDate, setEditingEventDate] = useState("");
  const [editingEventLocation, setEditingEventLocation] = useState("");
  const [editingEventPoints, setEditingEventPoints] = useState("5000");
  const [editingEventLogo, setEditingEventLogo] = useState<string | null>(null);
  const [editingEventInputMode, setEditingEventInputMode] = useState<"DIGITAL" | "PAPER">("DIGITAL");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [showNewEventForm, setShowNewEventForm] = useState(false);

  const categoryWeightByLevel = useMemo(() => {
    const map = new Map<string, number>();

    for (const category of event?.categories || []) {
      const key = category.eventLevelId || "__NONE__";
      map.set(key, (map.get(key) || 0) + Number(category.percentage || 0));
    }

    return map;
  }, [event]);

  const activeLevels = useMemo(
    () =>
      levels
        .filter((level) => level.status === "ACTIVE")
        .sort((a, b) => a.sortOrder - b.sortOrder),
    [levels]
  );

  function intervalDifficulty(value: number | string | null | undefined) {
    switch (Number(value)) {
      case 2:
        return "Mudah";
      case 3:
        return "Cenderung mudah";
      case 4:
        return "Sedang";
      case 5:
        return "Sulit";
      case 6:
        return "Sangat sulit";
      default:
        return "Belum ditentukan";
    }
  }

  async function loadEvents() {
    setLoadingEvents(true);

    try {
      const res = await fetch("/api/event?all=true", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gagal memuat daftar event.");
      }

      setEvents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("LOAD EVENTS ERROR:", error);
      setEvents([]);
    } finally {
      setLoadingEvents(false);
    }
  }

  async function activateEvent(id: string) {
    try {
      await api("/api/event", "PUT", {
        id,
        action: "activate",
      });

      setMessage("Event aktif berhasil diganti.");
      setSelectedCategory("");
      setActiveMaterialSubCategory(null);
      cancelEditSubCategory();
      await loadEvents();
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal mengganti event aktif."
      );
    }
  }

  async function load() {
    setLoading(true);

    try {
      const res = await fetch("/api/event", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok || !data?.id) {
        setEvent(null);
        return;
      }

      setEvent(data);

      if (!selectedCategory && data?.categories?.[0]) {
        setSelectedCategory(data.categories[0].id);
      }

      // Kalau kategori yang sedang dipilih sudah tidak ada,
      // pindahkan otomatis ke kategori pertama.
      if (
        data?.categories?.length > 0 &&
        selectedCategory &&
        !data.categories.some(
          (category: Category) => category.id === selectedCategory
        )
      ) {
        setSelectedCategory(data.categories[0].id);
      }
    } catch (error) {
      console.error("LOAD EVENT ERROR:", error);
      setMessage("Gagal memuat event.");
    } finally {
      setLoading(false);
    }
  }

  async function loadLevels(eventId: string) {
    setLoadingLevels(true);

    try {
      const res = await fetch(
        `/api/event-levels?eventId=${encodeURIComponent(eventId)}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Gagal memuat tingkatan event.");
      }

      setLevels(Array.isArray(data?.levels) ? data.levels : []);
    } catch (error) {
      console.error("LOAD EVENT LEVELS ERROR:", error);
      setLevels([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Gagal memuat tingkatan event."
      );
    } finally {
      setLoadingLevels(false);
    }
  }

  async function toggleLevel(level: EventLevel) {
    const nextStatus = level.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await api("/api/event-levels", "PATCH", {
        id: level.id,
        status: nextStatus,
      });

      setLevels((current) =>
        current.map((item) =>
          item.id === level.id
            ? { ...item, status: nextStatus }
            : item
        )
      );

      setMessage(
        `Tingkatan "${level.name}" sekarang ${nextStatus === "ACTIVE" ? "aktif" : "nonaktif"}.`
      );
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal mengubah status tingkatan."
      );
    }
  }

  async function loadMaterials(category?: string, section?: string) {
    const qs = new URLSearchParams();

    if (category) qs.set("category", category);
    if (section) qs.set("section", section);

    try {
      const res = await fetch(
        `/api/master-materials?${qs.toString()}`,
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      let list = Array.isArray(data)
        ? data
        : Array.isArray(data?.materials)
          ? data.materials
          : [];

      // Jika filter kategori belum menemukan riwayat, muat seluruh master materi agar selalu ada di pilihan
      if (list.length === 0 && (category || section)) {
        const allRes = await fetch("/api/master-materials", { cache: "no-store" });
        const allData = await allRes.json();
        list = Array.isArray(allData)
          ? allData
          : Array.isArray(allData?.materials)
            ? allData.materials
            : [];
      }

      setMasterMaterials(list);
    } catch (error) {
      console.error("LOAD MASTER MATERIAL ERROR:", error);
      setMasterMaterials([]);
    }
  }

  useEffect(() => {
    void load();
    void loadEvents();
  }, []);

  useEffect(() => {
    if (!event?.id) {
      setLevels([]);
      return;
    }

    void loadLevels(event.id);
  }, [event?.id]);

  useEffect(() => {
    const category = event?.categories.find(
      (x) => x.id === selectedCategory
    );

    if (category) {
      void loadMaterials(category.name);
    }
  }, [selectedCategory, event]);

  async function api(
    path: string,
    method: string,
    body: unknown
  ) {
    const res = await fetch(path, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.error || "Permintaan gagal.");
    }

    return data;
  }

  async function fileToLogoDataUrl(file: File): Promise<string> {
    if (!file.type.startsWith("image/")) {
      throw new Error("File logo harus berupa gambar.");
    }
    if (file.size > 3 * 1024 * 1024) {
      throw new Error("Ukuran logo maksimal 3 MB.");
    }
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result !== "string") {
          reject(new Error("Logo tidak dapat dibaca."));
          return;
        }
        resolve(result);
      };
      reader.onerror = () => reject(new Error("Gagal membaca file logo."));
      reader.readAsDataURL(file);
    });
  }

  async function handleLogoChange(file: File | undefined, mode: "create" | "edit") {
    if (!file) return;
    try {
      const dataUrl = await fileToLogoDataUrl(file);
      if (mode === "create") setEventLogo(dataUrl);
      else setEditingEventLogo(dataUrl);
      setMessage("Logo event siap disimpan.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal membaca logo event.");
    }
  }

  function startEditEvent(item: EventSummary | EventData) {
    setEditingEventId(item.id);
    setEditingEventName(item.name);
    setEditingEventDate(item.date ? item.date.slice(0, 10) : "");
    setEditingEventLocation(item.location || "");
    setEditingEventPoints(String(item.totalPoints || 5000));
    setEditingEventLogo(item.logo || null);
    setEditingEventInputMode(item.inputMode === "PAPER" ? "PAPER" : "DIGITAL");
  }

  function cancelEditEvent() {
    setEditingEventId(null);
    setEditingEventName("");
    setEditingEventDate("");
    setEditingEventLocation("");
    setEditingEventPoints("5000");
    setEditingEventLogo(null);
    setEditingEventInputMode("DIGITAL");
  }

  async function saveEventEdit() {
    if (!editingEventId) return;
    const name = editingEventName.trim();
    const points = Number(editingEventPoints);
    if (!name) {
      setMessage("Nama event wajib diisi.");
      return;
    }
    if (!Number.isInteger(points) || points <= 0) {
      setMessage("Total nilai event harus berupa angka bulat lebih dari 0.");
      return;
    }
    try {
      await api("/api/event", "PUT", {
        id: editingEventId,
        name,
        date: editingEventDate || null,
        location: editingEventLocation,
        totalPoints: points,
        logo: editingEventLogo,
        inputMode: editingEventInputMode,
      });
      setMessage(`Event "${name}" berhasil diperbarui.`);
      cancelEditEvent();
      await loadEvents();
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal memperbarui event.");
    }
  }

  async function deleteEvent(id: string) {
    const target = events.find((item) => item.id === id);
    if (!target) return;
    if (target.status === "ACTIVE" && events.length > 1) {
      setMessage("Event aktif tidak dapat dihapus. Aktifkan event lain terlebih dahulu.");
      return;
    }
    if (!window.confirm(`Hapus event "${target.name}"?\n\nSemua kategori, subkategori, materi, peserta, dan nilai yang terikat pada event ini juga akan terhapus.`)) return;
    try {
      await api("/api/event", "DELETE", { id });
      setMessage(`Event "${target.name}" berhasil dihapus.`);
      if (editingEventId === id) cancelEditEvent();
      setSelectedCategory("");
      setActiveMaterialSubCategory(null);
      await loadEvents();
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal menghapus event.");
    }
  }

  async function createEvent() {
    try {
      const points = Number(eventPoints);

      if (!eventName.trim()) {
        throw new Error("Nama event wajib diisi.");
      }
      if (!Number.isInteger(points) || points <= 0) {
        throw new Error("Total nilai event harus berupa angka bulat lebih dari 0.");
      }

      await api("/api/event", "POST", {
        name: eventName.trim(),
        date: eventDate || null,
        location: eventLocation,
        totalPoints: points,
        logo: eventLogo,
        inputMode: eventInputMode,
      });

      setMessage(
        "Event berhasil dibuat dan sekarang menjadi event aktif. Event sebelumnya tetap tersimpan."
      );
      setEventName("");
      setEventDate("");
      setEventLocation("");
      setEventPoints("5000");
      setEventLogo(null);
      setEventInputMode("DIGITAL");
      setShowNewEventForm(false);
      setSelectedCategory("");

      await loadEvents();
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal membuat event."
      );
    }
  }

  async function addCategory() {
    try {
      const name = categoryName.trim();
      const percentage = Number(categoryWeight);

      if (!name) throw new Error("Nama kategori wajib diisi.");
      if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
        throw new Error("Bobot kategori harus antara 1 sampai 100.");
      }
      if (!categoryLevelId) {
        throw new Error("Pilih tingkatan kategori terlebih dahulu.");
      }

      const currentWeight = categoryWeightByLevel.get(categoryLevelId) || 0;

      if (currentWeight + percentage > 100.000001) {
        throw new Error(
          `Total bobot kategori untuk tingkatan ini tidak boleh lebih dari 100%. Saat ini ${currentWeight}%.`
        );
      }

      await api("/api/categories", "POST", {
        name,
        percentage,
        eventLevelId: categoryLevelId,
      });

      setCategoryName("");
      setCategoryWeight("0");
      setMessage("Kategori berhasil ditambahkan ke tingkatan.");
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Gagal menambahkan kategori."
      );
    }
  }

  function startEditCategory(category: Category) {
    setEditingCategoryId(category.id);
    setEditingCategoryName(category.name);
    setEditingCategoryWeight(String(category.percentage));
    setEditingCategoryLevelId(category.eventLevelId || "");
    setMessage(`Sedang mengedit kategori "${category.name}".`);
  }

  function cancelEditCategory() {
    setEditingCategoryId(null);
    setEditingCategoryName("");
    setEditingCategoryWeight("0");
    setEditingCategoryLevelId("");
  }

  function openDuplicateModal(c: Category) {
    setDuplicatingCategory(c);
    setDuplicateTargetLevelId(c.eventLevelId || activeLevels[0]?.id || "");
    setDuplicateTargetName(`${c.name} (Copy)`);
  }

  function cancelDuplicateCategory() {
    setDuplicatingCategory(null);
    setDuplicateTargetLevelId("");
    setDuplicateTargetName("");
  }

  async function handleDuplicateCategory() {
    if (!duplicatingCategory) return;
    setDuplicatingLoading(true);
    try {
      await api("/api/categories", "POST", {
        action: "duplicate",
        sourceCategoryId: duplicatingCategory.id,
        targetEventLevelId: duplicateTargetLevelId || null,
        targetName: duplicateTargetName.trim(),
      });
      setMessage(`Kategori "${duplicatingCategory.name}" berhasil diduplikat.`);
      cancelDuplicateCategory();
      await load();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal menduplikat kategori.");
    } finally {
      setDuplicatingLoading(false);
    }
  }

  async function saveCategoryEdit() {
    if (!editingCategoryId) return;

    const name = editingCategoryName.trim();
    const percentage = Number(editingCategoryWeight);

    if (!name) {
      setMessage("Nama kategori wajib diisi.");
      return;
    }

    if (!Number.isFinite(percentage) || percentage <= 0 || percentage > 100) {
      setMessage("Bobot kategori harus antara 1 sampai 100.");
      return;
    }

    if (!editingCategoryLevelId) {
      setMessage("Pilih tingkatan kategori terlebih dahulu.");
      return;
    }

    const otherPercentage = (event?.categories || [])
      .filter(
        (category) =>
          category.id !== editingCategoryId &&
          (category.eventLevelId || "") === editingCategoryLevelId
      )
      .reduce(
        (total, category) => total + Number(category.percentage || 0),
        0
      );

    if (otherPercentage + percentage > 100.000001) {
      setMessage(
        `Total bobot kategori untuk tingkatan ini tidak boleh lebih dari 100%. Bobot kategori lain saat ini ${otherPercentage}%.`
      );
      return;
    }

    try {
      await api("/api/categories", "PATCH", {
        id: editingCategoryId,
        name,
        percentage,
        eventLevelId: editingCategoryLevelId,
      });

      const wasSelected = selectedCategory === editingCategoryId;

      setMessage(`Kategori "${name}" berhasil diubah.`);
      cancelEditCategory();
      await load();

      if (wasSelected) {
        setSelectedCategory(editingCategoryId);
      }
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Gagal mengubah kategori."
      );
    }
  }

  async function addSubCategory() {
    try {
      if (!selectedCategory) {
        throw new Error("Pilih kategori terlebih dahulu.");
      }

      if (!subName.trim()) {
        throw new Error("Nama subkategori wajib diisi.");
      }

      await api("/api/subcategories", "POST", {
        categoryId: selectedCategory,
        name: subName.trim(),
        // Subkategori tidak memiliki bobot sendiri.
        // 100 hanya untuk kompatibilitas backend lama; mesin nilai mengabaikannya.
        percentage: 100,
      });

      setSubName("");
      setMessage("Subkategori berhasil ditambahkan. Nilai mengikuti bobot kategori.");

      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menambahkan subkategori."
      );
    }
  }

  function startEditSubCategory(subCategory: SubCategory) {
    setEditingSubCategoryId(subCategory.id);
    setEditingSubName(subCategory.name);
    setMessage(`Sedang mengedit subkategori "${subCategory.name}".`);
  }

  function cancelEditSubCategory() {
    setEditingSubCategoryId(null);
    setEditingSubName("");
  }

  async function saveSubCategoryEdit() {
    if (!editingSubCategoryId) return;

    const name = editingSubName.trim();
    if (!name) {
      setMessage("Nama subkategori wajib diisi.");
      return;
    }

    const category = event?.categories.find(
      (item) => item.id === selectedCategory
    );

    if (!category) {
      setMessage("Kategori tidak ditemukan.");
      return;
    }

    try {
      await api("/api/subcategories", "PATCH", {
        id: editingSubCategoryId,
        name,
      });

      setMessage(`Subkategori "${name}" berhasil diubah.`);
      cancelEditSubCategory();
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error ? e.message : "Gagal mengubah subkategori."
      );
    }
  }

  function keepSubCategoryInView(subCategoryId: string) {
    window.setTimeout(() => {
      const elements = Array.from(
        document.querySelectorAll<HTMLElement>("[data-subcategory-id]")
      );
      const target = elements.find(
        (element) => element.dataset.subcategoryId === subCategoryId
      );
      target?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 120);
  }

  function startEditCriterion(criterion: Criterion) {
    setEditingCriterionId(criterion.id);
    setEditingCriterionName(criterion.name);
    setEditingCriterionInterval(String(criterion.interval ?? 2));
    setActiveMaterialSubCategory(null);
    setMaterialName("");
    setMaterialId("");
    setInterval("2");
  }

  function cancelEditCriterion() {
    setEditingCriterionId(null);
    setEditingCriterionName("");
    setEditingCriterionInterval("2");
  }

  async function saveCriterionEdit(criterion: Criterion, section: SubCategory) {
    if (!editingCriterionId) return;
    const name = editingCriterionName.trim();
    if (!name) {
      setMessage("Nama materi wajib diisi.");
      return;
    }
    try {
      await api("/api/criteria", "PATCH", {
        id: criterion.id,
        categoryId: selectedCategory,
        name,
        section: section.name,
        interval: Number(editingCriterionInterval),
      });
      cancelEditCriterion();
      setMessage(`Materi "${name}" berhasil diperbarui.`);
      await load();
      keepSubCategoryInView(section.id);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Gagal mengubah materi.");
    }
  }

  /**
   * TAMBAH MATERI KE SUBKATEGORI TERTENTU
   *
   * Sebelumnya:
   * const sub = category?.subCategories[0];
   *
   * Itu menyebabkan SEMUA materi masuk ke subkategori pertama.
   *
   * Sekarang subCategoryId dikirim langsung dari kartu
   * subkategori yang tombolnya ditekan.
   */
  async function addMaterial(subCategoryId: string) {
    try {
      const category = event?.categories.find(
        (x) => x.id === selectedCategory
      );

      const subCategory = category?.subCategories.find(
        (x) => x.id === subCategoryId
      );

      if (!category) {
        throw new Error("Kategori tidak ditemukan.");
      }

      if (!subCategory) {
        throw new Error("Subkategori tidak ditemukan.");
      }

      if (!materialId && !materialName.trim()) {
        throw new Error("Nama materi wajib diisi.");
      }

      const result = await api("/api/criteria", "POST", {
        categoryId: selectedCategory,
        subCategoryId: subCategory.id,
        materialId: materialId || null,
        name: materialId ? "" : materialName.trim(),
        categoryName: category.name,
        section: subCategory.name,
        interval: Number(interval),
      });

      const createdCriterion = result?.criterion as Criterion | undefined;

      if (!createdCriterion?.id) {
        throw new Error("Materi berhasil disimpan, tetapi data hasilnya tidak diterima.");
      }

      // Jangan reload seluruh event setelah setiap materi.
      // API sudah mengembalikan criterion lengkap beserta options-nya,
      // jadi cukup masukkan hasil tersebut langsung ke state lokal.
      setEvent((currentEvent) => {
        if (!currentEvent) return currentEvent;

        return {
          ...currentEvent,
          categories: currentEvent.categories.map((currentCategory) => {
            if (currentCategory.id !== selectedCategory) {
              return currentCategory;
            }

            return {
              ...currentCategory,
              subCategories: currentCategory.subCategories.map((currentSubCategory) => {
                if (currentSubCategory.id !== subCategory.id) {
                  return currentSubCategory;
                }

                return {
                  ...currentSubCategory,
                  criteria: [...currentSubCategory.criteria, createdCriterion].sort(
                    (a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0)
                  ),
                };
              }),
            };
          }),
        };
      });

      setMaterialName("");
      setMaterialId("");
      setInterval("2");

      // Segera sinkronkan daftar master materi agar materi baru langsung muncul di dropdown riwayat
      void loadMaterials(category.name);

      // Tetap buka form di subkategori yang sama agar bisa input materi berikutnya.
      setActiveMaterialSubCategory(subCategoryId);

      setMessage(
        `Materi berhasil ditambahkan ke "${subCategory.name}". Pengulangan materi diperbolehkan.`
      );

      keepSubCategoryInView(subCategoryId);
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menambahkan materi."
      );
    }
  }

  async function deleteCategory(id: string) {
    if (!confirm("Hapus kategori ini?")) return;

    try {
      await api("/api/categories", "DELETE", { id });

      if (editingCategoryId === id) {
        cancelEditCategory();
      }

      setMessage("Kategori dihapus.");

      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menghapus kategori."
      );
    }
  }

  async function deleteSubCategory(id: string) {
    if (!confirm("Hapus subkategori ini?")) return;

    try {
      await api("/api/subcategories", "DELETE", { id });

      if (activeMaterialSubCategory === id) {
        setActiveMaterialSubCategory(null);
      }

      if (editingSubCategoryId === id) {
        cancelEditSubCategory();
      }

      setMessage("Subkategori dihapus.");

      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menghapus subkategori."
      );
    }
  }

  async function deleteCriterion(id: string) {
    if (!confirm("Hapus materi ini?")) return;

    try {
      await api("/api/criteria", "DELETE", { id });

      setMessage("Materi dihapus.");

      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menghapus materi."
      );
    }
  }

  /**
   * Urutkan subkategori naik/turun.
   * Backend sudah menyediakan action=reorder.
   */
  async function moveSubCategory(
    categoryId: string,
    subCategories: SubCategory[],
    index: number,
    direction: -1 | 1
  ) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= subCategories.length) {
      return;
    }

    const orderedIds = subCategories.map((item) => item.id);
    [orderedIds[index], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[index],
    ];

    try {
      await api("/api/subcategories", "PATCH", {
        action: "reorder",
        categoryId,
        orderedIds,
      });

      setMessage("Urutan subkategori berhasil diperbarui.");
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal mengubah urutan subkategori."
      );
    }
  }

  /**
   * Urutkan materi naik/turun dalam subkategori.
   */
  async function moveCriterion(
    categoryId: string,
    subCategoryId: string,
    criteria: Criterion[],
    index: number,
    direction: -1 | 1
  ) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= criteria.length) {
      return;
    }

    const orderedIds = criteria.map((item) => item.id);
    [orderedIds[index], orderedIds[targetIndex]] = [
      orderedIds[targetIndex],
      orderedIds[index],
    ];

    try {
      await api("/api/criteria", "PATCH", {
        action: "reorder",
        categoryId,
        subCategoryId,
        orderedIds,
      });

      setMessage("Urutan materi berhasil diperbarui.");
      await load();
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal mengubah urutan materi."
      );
    }
  }

  /**
   * Hapus materi dari history/master material.
   * Backend hanya mengubah status menjadi INACTIVE,
   * sehingga criterion yang sudah memakai materi tetap aman.
   */
  async function deleteMasterMaterial(id: string) {
    const material = masterMaterials.find((item) => item.id === id);

    if (!material) return;

    if (
      !confirm(
        `Hapus "${material.name}" dari pilihan history?\n\nMateri yang sudah dipakai dalam event tetap aman.`
      )
    ) {
      return;
    }

    try {
      await api("/api/master-materials", "DELETE", { id });

      if (materialId === id) {
        setMaterialId("");
      }

      const category = event?.categories.find(
        (item) => item.id === selectedCategory
      );

      await loadMaterials(category?.name);
      setMessage(`"${material.name}" dihapus dari history pilihan.`);
    } catch (e) {
      setMessage(
        e instanceof Error
          ? e.message
          : "Gagal menghapus history materi."
      );
    }
  }

  /**
   * Simpan & Lanjutkan
   *
   * Semua perubahan kategori/subkategori/materi memang sudah langsung
   * tersimpan ke database. Tombol ini memvalidasi kategori aktif, berpindah
   * ke kategori berikutnya, atau membuka halaman review jika ini kategori terakhir.
   *
   * Sebelumnya fungsi ini memvalidasi SEMUA kategori sekaligus dan tidak
   * pernah mengubah selectedCategory. Akibatnya saat PBB selesai tetapi
   * KOMANDAN belum diisi, tombol terlihat seperti tidak melakukan apa-apa.
   */
  async function saveAndContinue() {
    try {
      if (!event) {
        throw new Error("Event belum dibuat.");
      }

      if (!selectedCategory) {
        throw new Error("Pilih kategori terlebih dahulu.");
      }

      const currentCategory = event.categories.find(
        (category) => category.id === selectedCategory
      );

      if (!currentCategory) {
        throw new Error("Kategori yang sedang dibuka tidak ditemukan.");
      }

      const currentLevelId = currentCategory.eventLevelId || "__NONE__";

      const levelCategories = event.categories
        .filter(
          (category) =>
            (category.eventLevelId || "__NONE__") === currentLevelId
        )
        .slice()
        .sort((a, b) => a.sortOrder - b.sortOrder);

      const levelCategoryTotal = levelCategories.reduce(
        (sum, category) => sum + Number(category.percentage || 0),
        0
      );

      if (Math.abs(levelCategoryTotal - 100) > 0.0001) {
        const currentLevel = levels.find(
          (level) => level.id === currentCategory.eventLevelId
        );

        throw new Error(
          `Total bobot kategori untuk ${currentLevel?.name || "tingkatan ini"} harus 100%. Saat ini ${levelCategoryTotal}%.`
        );
      }

      const subCategories = currentCategory.subCategories || [];

      if (subCategories.length === 0) {
        throw new Error(
          `Kategori "${currentCategory.name}" belum memiliki subkategori.`
        );
      }

      const materialCount = subCategories.reduce(
        (sum, subCategory) => sum + subCategory.criteria.length,
        0
      ) + currentCategory.criteria.length;

      if (materialCount === 0) {
        throw new Error(
          `Kategori "${currentCategory.name}" belum memiliki materi.`
        );
      }

      const currentIndex = levelCategories.findIndex(
        (category) => category.id === currentCategory.id
      );

      const nextCategory =
        currentIndex >= 0 ? levelCategories[currentIndex + 1] : null;

      if (nextCategory) {
        setSelectedLevelForEdit(currentLevelId === "__NONE__" ? "" : currentLevelId);
        setSelectedCategory(nextCategory.id);
        setActiveMaterialSubCategory(null);
        cancelEditSubCategory();
        cancelEditCriterion();
        setMaterialName("");
        setMaterialId("");
        setInterval("2");

        setMessage(
          `"${currentCategory.name}" berhasil disimpan. Sekarang melanjutkan ke "${nextCategory.name}".`
        );

        window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);

        return;
      }

      const orderedActiveLevels = activeLevels.slice().sort(
        (a, b) => a.sortOrder - b.sortOrder
      );

      const currentLevelIndex = orderedActiveLevels.findIndex(
        (level) => level.id === currentCategory.eventLevelId
      );

      let nextLevelCategory: Category | null = null;
      let nextLevel: EventLevel | null = null;

      for (let i = currentLevelIndex + 1; i < orderedActiveLevels.length; i += 1) {
        const candidateLevel = orderedActiveLevels[i];
        const candidateCategory = event.categories
          .filter((category) => category.eventLevelId === candidateLevel.id)
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)[0];

        if (candidateCategory) {
          nextLevel = candidateLevel;
          nextLevelCategory = candidateCategory;
          break;
        }
      }

      if (nextLevelCategory && nextLevel) {
        setSelectedLevelForEdit(nextLevel.id);
        setSelectedCategory(nextLevelCategory.id);
        setActiveMaterialSubCategory(null);
        cancelEditSubCategory();
        cancelEditCriterion();
        setMaterialName("");
        setMaterialId("");
        setInterval("2");

        setMessage(
          `"${currentCategory.name}" berhasil disimpan. Sekarang masuk ke tingkatan "${nextLevel.name}" dan kategori "${nextLevelCategory.name}".`
        );

        window.setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);

        return;
      }

      setMessage(
        `"${currentCategory.name}" berhasil disimpan. Semua kategori pada seluruh tingkatan sudah selesai dikonfigurasi.`
      );

      window.setTimeout(() => {
        router.push("/admin/review");
      }, 300);
    } catch (e) {
      console.error("SAVE & CONTINUE ERROR:", e);

      setMessage(
        e instanceof Error
          ? e.message
          : "Konfigurasi belum dapat dilanjutkan."
      );
    }
  }

  const selectedCategoryData = event?.categories.find(
    (c) => c.id === selectedCategory
  );

  useEffect(() => {
    if (!event) return;

    const selected = event.categories.find(
      (category) => category.id === selectedCategory
    );

    if (selected?.eventLevelId && selected.eventLevelId !== selectedLevelForEdit) {
      setSelectedLevelForEdit(selected.eventLevelId);
      return;
    }

    if (
      !selectedLevelForEdit ||
      !activeLevels.some((level) => level.id === selectedLevelForEdit)
    ) {
      setSelectedLevelForEdit(selected?.eventLevelId || activeLevels[0]?.id || "");
    }
  }, [event, selectedCategory, selectedLevelForEdit, activeLevels]);

  const categoriesForSelectedLevel = useMemo(() => {
    if (!event || !selectedLevelForEdit) return [];

    return event.categories
      .filter((category) => category.eventLevelId === selectedLevelForEdit)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [event, selectedLevelForEdit]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-2xl border bg-white px-8 py-6 shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            Memuat CETAS SCORE...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-4 md:p-6">
      <div className="mx-auto max-w-[1450px] space-y-4">

        {/* HEADER */}
        <header className="rounded-2xl bg-[#071a3d] p-6 text-white">
          <p className="text-xs font-bold tracking-[.25em] text-blue-300">
            CETAS SCORE • ADMIN
          </p>

          <h1 className="mt-1 text-3xl font-black">
            {event?.name || "Belum ada event"}
          </h1>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mt-1 text-sm text-white/60">
                Konfigurasi event, kategori, subkategori,
                master materi, dan penilaian.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  router.push("/admin/dashboard");
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-bold text-white/80 hover:bg-white/10"
              >
                ← Dashboard
              </button>

              <button
                type="button"
                onClick={async () => {
                  await fetch("/api/auth/logout", {
                    method: "POST",
                  });

                  router.replace("/");
                  router.refresh();
                }}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Keluar
              </button>
            </div>
          </div>
        </header>

        {/* MESSAGE */}
        {message && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900">
            {message}
          </div>
        )}

        {/* =========================================================
            LANGKAH 01 — EVENT
        ========================================================== */}
        <section className="card p-5">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black tracking-[.2em] text-blue-500">LANGKAH 01</p>
              <h2 className="mt-1 text-2xl font-black">Event</h2>
              <p className="mt-1 text-sm text-slate-500">Event otomatis tersinkronisasi mengikuti data resmi dari Portal Master Event Cetas.</p>
            </div>
            <button type="button" onClick={() => router.push("/admin")} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-[#071a3d] transition hover:bg-slate-50">
              ← Kelola Event di Portal Master
            </button>
          </div>

          {event ? (
            <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-4">
                  {event.logo ? <img src={event.logo} alt={`Logo ${event.name}`} className="h-16 w-16 shrink-0 rounded-xl border border-white bg-white object-contain p-1 shadow-sm" /> : <div className="grid h-16 w-16 shrink-0 place-items-center rounded-xl border border-blue-100 bg-white text-[10px] font-black text-slate-400">NO LOGO</div>}
                  <div className="min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">Event Aktif</p>
                    <p className="mt-1 truncate text-lg font-black text-[#071a3d]">{event.name}</p>
                    <p className="text-xs text-slate-500">{event.location || "Lokasi belum diatur"} • {event.totalPoints.toLocaleString("id-ID")} poin • {event.inputMode === "PAPER" ? "MODE KERTAS" : "DIGITAL / MANUAL"}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select value={event.id} onChange={(e) => { if (e.target.value && e.target.value !== event.id) void activateEvent(e.target.value); }} disabled={loadingEvents} className="min-w-[240px] rounded-xl border border-blue-200 bg-white px-3 py-2.5 text-sm font-bold text-[#071a3d] outline-none focus:border-blue-500 disabled:opacity-50">
                    {events.length === 0 ? <option value={event.id}>{event.name}</option> : events.map((item) => <option key={item.id} value={item.id}>{item.name}{item.status === "ACTIVE" ? " • AKTIF" : ""}</option>)}
                  </select>
                  <button type="button" onClick={() => startEditEvent(event)} className="rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700">Edit Event</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">Belum ada event. Buat event pertama untuk memulai.</div>
          )}



          {editingEventId && (
            <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-sm font-black text-[#071a3d]">Edit Event</p><p className="text-xs text-slate-500">Perubahan hanya mengubah informasi event, bukan kategori/materi yang sudah tersimpan.</p></div>
                <button type="button" onClick={cancelEditEvent} className="text-sm font-bold text-slate-500">Batal</button>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-[1.4fr_180px_1fr_180px_180px]">
                <input value={editingEventName} onChange={(e) => setEditingEventName(e.target.value)} placeholder="Nama event" className="rounded-xl border bg-white px-4 py-3" />
                <input value={editingEventDate} onChange={(e) => setEditingEventDate(e.target.value)} type="date" className="rounded-xl border bg-white px-4 py-3" />
                <input value={editingEventLocation} onChange={(e) => setEditingEventLocation(e.target.value)} placeholder="Lokasi" className="rounded-xl border bg-white px-4 py-3" />
                <select value={editingEventInputMode} onChange={(e) => setEditingEventInputMode(e.target.value === "PAPER" ? "PAPER" : "DIGITAL")} className="rounded-xl border bg-white px-4 py-3">
                  <option value="DIGITAL">Digital / Manual</option>
                  <option value="PAPER">Kertas</option>
                </select>
                <input value={editingEventPoints} onChange={(e) => setEditingEventPoints(e.target.value)} type="number" min="1" step="1" placeholder="Total poin" className="rounded-xl border bg-white px-4 py-3" />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="cursor-pointer rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-bold text-blue-700 hover:bg-blue-50">
                  Ganti Logo Event
                  <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" className="hidden" onChange={(e) => void handleLogoChange(e.target.files?.[0], "edit")} />
                </label>
                {editingEventLogo ? <div className="flex items-center gap-2"><img src={editingEventLogo} alt="Preview logo event" className="h-12 w-12 rounded-lg border bg-white object-contain p-1" /><button type="button" onClick={() => setEditingEventLogo(null)} className="text-xs font-bold text-red-500">Hapus logo</button></div> : <span className="text-xs text-slate-500">Logo akan dikosongkan.</span>}
                <button type="button" onClick={() => void saveEventEdit()} className="ml-auto rounded-xl bg-[#1769e0] px-5 py-3 font-bold text-white">Simpan Perubahan</button>
              </div>
            </div>
          )}

          <div className="mt-5">
            <div className="mb-3"><p className="text-sm font-black text-[#071a3d]">Daftar Event</p><p className="text-xs text-slate-400">Event lama tetap tersimpan sampai kamu menghapusnya.</p></div>
            {events.length === 0 ? <div className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-400">Belum ada event.</div> : <div className="space-y-2">
              {events.map((item) => (
                <div key={item.id} className="flex flex-wrap items-center gap-3 rounded-xl border bg-white p-3">
                  {item.logo ? <img src={item.logo} alt={`Logo ${item.name}`} className="h-12 w-12 rounded-lg border bg-white object-contain p-1" /> : <div className="grid h-12 w-12 place-items-center rounded-lg bg-slate-50 text-[9px] font-black text-slate-400">NO LOGO</div>}
                  <div className="min-w-[220px] flex-1">
                    <div className="flex flex-wrap items-center gap-2"><b className="text-sm text-[#071a3d]">{item.name}</b>{item.status === "ACTIVE" && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-700">AKTIF</span>}</div>
                    <p className="mt-1 text-xs text-slate-400">{item.location || "Lokasi belum diatur"} • {item.totalPoints.toLocaleString("id-ID")} poin • {item.inputMode === "PAPER" ? "KERTAS" : "DIGITAL"}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.status !== "ACTIVE" && <button type="button" onClick={() => void activateEvent(item.id)} className="rounded-lg bg-[#071a3d] px-3 py-2 text-xs font-bold text-white">Aktifkan</button>}
                    <button type="button" onClick={() => startEditEvent(item)} className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700">Edit</button>
                    <button type="button" onClick={() => void deleteEvent(item.id)} disabled={item.status === "ACTIVE" && events.length > 1} className="rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-500 disabled:cursor-not-allowed disabled:opacity-30" title={item.status === "ACTIVE" && events.length > 1 ? "Aktifkan event lain terlebih dahulu" : "Hapus event"}>Hapus</button>
                  </div>
                </div>
              ))}
            </div>}
          </div>
        </section>

        {event ? (
          <>
            {/* =====================================================
                LANGKAH 02 — TINGKATAN
            ====================================================== */}
            <section className="card p-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[.2em] text-blue-500">
                    LANGKAH 02
                  </p>
                  <h2 className="mt-1 text-2xl font-black">
                    Tingkatan
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Tingkatan hanya menjadi pembeda peserta dan hasil antar jenjang.
                    Tidak mengubah total nilai event atau bobot penilaian.
                  </p>
                </div>

                <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700">
                  {levels.filter((level) => level.status === "ACTIVE").length} tingkatan aktif
                </span>
              </div>

              {loadingLevels ? (
                <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-5 text-center text-sm font-bold text-blue-700">
                  Memuat tingkatan...
                </div>
              ) : levels.length === 0 ? (
                <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50 px-4 py-5 text-center text-sm font-bold text-amber-700">
                  Belum ada tingkatan untuk event ini.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {levels
                    .slice()
                    .sort((a, b) => a.sortOrder - b.sortOrder)
                    .map((level, index) => {
                      const active = level.status === "ACTIVE";

                      return (
                        <div
                          key={level.id}
                          className={
                            active
                              ? "rounded-xl border border-blue-200 bg-blue-50 p-4"
                              : "rounded-xl border border-slate-200 bg-slate-50 p-4 opacity-70"
                          }
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                              <span
                                className={
                                  active
                                    ? "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#071a3d] text-sm font-black text-white"
                                    : "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-300 text-sm font-black text-white"
                                }
                              >
                                {index + 1}
                              </span>

                              <div className="min-w-0">
                                <b className="block truncate text-sm text-[#071a3d]">
                                  {level.name}
                                </b>
                                <span className="text-[11px] font-bold text-slate-400">
                                  {level.code}
                                </span>
                              </div>
                            </div>

                            <span
                              className={
                                active
                                  ? "rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-black text-emerald-700"
                                  : "rounded-full bg-slate-200 px-2 py-1 text-[10px] font-black text-slate-500"
                              }
                            >
                              {active ? "AKTIF" : "NONAKTIF"}
                            </span>
                          </div>

                          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                            <div className="rounded-lg bg-white px-3 py-2">
                              <span className="block text-slate-400">Peserta</span>
                              <b className="text-[#071a3d]">
                                {level._count?.participants ?? 0}
                              </b>
                            </div>
                            <div className="rounded-lg bg-white px-3 py-2">
                              <span className="block text-slate-400">Kategori</span>
                              <b className="text-[#071a3d]">
                                {level._count?.categories ?? 0}
                              </b>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => void toggleLevel(level)}
                            className={
                              active
                                ? "mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50"
                                : "mt-3 w-full rounded-lg bg-[#1769e0] px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
                            }
                          >
                            {active ? "Nonaktifkan Tingkatan" : "Aktifkan Tingkatan"}
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}

              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                <b className="text-[#071a3d]">Catatan:</b> Tingkatan tidak mempunyai
                bobot nilai. Total nilai tetap mengikuti konfigurasi event dan
                bobot kategori yang sudah ada.
              </div>
            </section>
            {/* =====================================================
                LANGKAH 03 — KATEGORI
            ====================================================== */}
            <section className="card p-5">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-bold tracking-[.2em] text-blue-500">
                    LANGKAH 03
                  </p>
                  <h2 className="text-2xl font-black">Kategori</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Setiap kategori wajib ditempatkan pada satu tingkatan.
                    Bobot dihitung terpisah untuk masing-masing tingkatan.
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-500">
                  {activeLevels.length} tingkatan aktif
                </div>
              </div>

              <div className="space-y-5">
                {activeLevels.map((level) => {
                  const levelCategories = event.categories
                    .filter((category) => category.eventLevelId === level.id)
                    .sort((a, b) => a.sortOrder - b.sortOrder);

                  const levelWeight =
                    categoryWeightByLevel.get(level.id) || 0;

                  return (
                    <div
                      key={level.id}
                      className="overflow-hidden rounded-2xl border border-blue-100 bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-100 bg-blue-50 px-4 py-3">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-[.18em] text-blue-600">
                            TINGKATAN
                          </p>
                          <h3 className="text-lg font-black text-[#071a3d]">
                            {level.name}
                          </h3>
                        </div>

                        <span
                          className={
                            levelWeight === 100
                              ? "rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700"
                              : "rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700"
                          }
                        >
                          {levelWeight}% / 100%
                        </span>
                      </div>

                      <div className="divide-y bg-white">
                        {levelCategories.length === 0 ? (
                          <div className="px-4 py-5 text-sm text-slate-400">
                            Belum ada kategori untuk tingkatan ini.
                          </div>
                        ) : (
                          levelCategories.map((c, i) => (
                            <div
                              key={c.id}
                              className="grid gap-3 px-4 py-4 md:grid-cols-[42px_1fr_100px_auto] md:items-center"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#071a3d] font-bold text-white">
                                {i + 1}
                              </span>

                              {editingCategoryId === c.id ? (
                                <div className="grid gap-2 md:grid-cols-[1fr_180px]">
                                  <input
                                    value={editingCategoryName}
                                    onChange={(e) =>
                                      setEditingCategoryName(e.target.value)
                                    }
                                    className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                                    placeholder="Nama kategori"
                                  />

                                  <select
                                    value={editingCategoryLevelId}
                                    onChange={(e) =>
                                      setEditingCategoryLevelId(e.target.value)
                                    }
                                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                                  >
                                    <option value="">Pilih tingkatan</option>
                                    {activeLevels.map((item) => (
                                      <option key={item.id} value={item.id}>
                                        {item.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <div>
                                  <b className="text-lg">{c.name}</b>
                                  <div className="text-xs text-slate-400">
                                    {c.criteria.length +
                                      c.subCategories.reduce(
                                        (n, s) => n + s.criteria.length,
                                        0
                                      )}{" "}
                                    materi
                                  </div>
                                </div>
                              )}

                              {editingCategoryId === c.id ? (
                                <input
                                  value={editingCategoryWeight}
                                  onChange={(e) =>
                                    setEditingCategoryWeight(e.target.value)
                                  }
                                  type="number"
                                  min="1"
                                  max="100"
                                  className="rounded-lg border border-blue-200 px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                                  placeholder="Bobot %"
                                />
                              ) : (
                                <b className="text-blue-600">{c.percentage}%</b>
                              )}

                              {editingCategoryId === c.id ? (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={saveCategoryEdit}
                                    className="rounded-lg bg-[#1769e0] px-3 py-2 text-sm font-bold text-white"
                                  >
                                    Simpan
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelEditCategory}
                                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => openDuplicateModal(c)}
                                    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-bold text-purple-700 transition active:scale-95 hover:bg-purple-100"
                                    title="Duplikat kategori beserta seluruh subkategori & materinya"
                                  >
                                    📑 Duplikat
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => startEditCategory(c)}
                                    className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700 transition active:scale-95 hover:bg-blue-100"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => deleteCategory(c.id)}
                                    className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-500 transition active:scale-95 hover:bg-red-50"
                                  >
                                    Hapus
                                  </button>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeLevels.length === 0 && (
                <div className="mt-4 rounded-xl border border-dashed border-amber-200 bg-amber-50 p-4 text-sm font-bold text-amber-800">
                  Aktifkan minimal satu tingkatan terlebih dahulu.
                </div>
              )}

              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-black text-[#071a3d]">
                    Tambah Kategori
                  </p>
                  <div className="flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-bold text-slate-500">Pilihan Cepat:</span>
                    {["PBB", "VARIASI & FORMASI", "KOMANDAN / DANTON", "KOSTUM", "PASUKAN TERFAVORIT"].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setCategoryName(tag)}
                        className="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 transition active:scale-95 hover:bg-blue-100 shadow-xs"
                      >
                        + {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2 md:grid-cols-[1fr_190px_150px_130px]">
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Nama kategori"
                    className="rounded-lg border bg-white px-3 py-2 text-sm"
                  />

                  <select
                    value={categoryLevelId}
                    onChange={(e) => setCategoryLevelId(e.target.value)}
                    className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold"
                  >
                    <option value="">Pilih tingkatan</option>
                    {activeLevels.map((level) => (
                      <option key={level.id} value={level.id}>
                        {level.name}
                      </option>
                    ))}
                  </select>

                  <input
                    value={categoryWeight}
                    onChange={(e) => setCategoryWeight(e.target.value)}
                    type="number"
                    min="1"
                    max="100"
                    placeholder="Bobot %"
                    className="rounded-lg border bg-white px-3 py-2 text-sm"
                  />

                  <button
                    type="button"
                    onClick={() => void addCategory()}
                    disabled={!categoryLevelId}
                    className="rounded-lg bg-[#1769e0] px-4 py-2 font-bold text-white transition active:scale-95 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    + Tambah
                  </button>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs text-slate-500">
                <b className="text-[#071a3d]">Catatan:</b> Bobot kategori
                dihitung <b>per tingkatan</b>. Contoh: SMP 100% dan SMA 100%
                adalah valid karena keduanya memiliki konfigurasi penilaian
                masing-masing.
              </div>
            </section>



        {/* =========================================================
            LANGKAH 04 — SUBKATEGORI + MATERI
        ========================================================== */}
          <section className="card p-5">
            <div className="mb-4">
              <p className="text-xs font-bold tracking-[.2em] text-blue-500">
                LANGKAH 04
              </p>

              <h2 className="text-2xl font-black">
                Kategori → Subkategori → Materi
              </h2>
            </div>

            {/* PILIH TINGKATAN */}
            <div className="mb-3 grid gap-2 md:grid-cols-[220px_1fr] md:items-center">
              <label className="text-sm font-black text-[#071a3d]">
                Tingkatan yang sedang diedit
              </label>
              <select
                value={selectedLevelForEdit}
                onChange={(e) => {
                  const levelId = e.target.value;
                  setSelectedLevelForEdit(levelId);

                  const firstCategory = event.categories
                    .filter((category) => category.eventLevelId === levelId)
                    .sort((a, b) => a.sortOrder - b.sortOrder)[0];

                  setSelectedCategory(firstCategory?.id || "");
                  setActiveMaterialSubCategory(null);
                  cancelEditSubCategory();
                  cancelEditCriterion();
                  setMaterialName("");
                  setMaterialId("");
                  setInterval("2");
                }}
                disabled={activeLevels.length === 0}
                className="w-full rounded-lg border border-blue-200 bg-white px-3 py-2 font-bold text-[#071a3d]"
              >
                <option value="">Pilih tingkatan</option>
                {activeLevels.map((level) => (
                  <option key={level.id} value={level.id}>
                    {level.name}
                  </option>
                ))}
              </select>
            </div>

            {/* PILIH KATEGORI DALAM TINGKATAN TERPILIH */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                const categoryId = e.target.value;
                const category = categoriesForSelectedLevel.find(
                  (item) => item.id === categoryId
                );

                setSelectedCategory(categoryId);
                if (category?.eventLevelId) {
                  setSelectedLevelForEdit(category.eventLevelId);
                }
                setActiveMaterialSubCategory(null);
                cancelEditSubCategory();
                cancelEditCriterion();
                setMaterialName("");
                setMaterialId("");
                setInterval("2");
              }}
              className="mb-4 w-full rounded-lg border px-3 py-2"
              disabled={!selectedLevelForEdit}
            >
              <option value="">
                {selectedLevelForEdit
                  ? "Pilih kategori"
                  : "Pilih tingkatan terlebih dahulu"}
              </option>

              {categoriesForSelectedLevel.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} — {c.percentage}%
                </option>
              ))}
            </select>

            {/* SUBKATEGORI */}
            <div className="space-y-4">
              {selectedCategoryData?.subCategories.map(
                (s) => {
                  const isAdding =
                    activeMaterialSubCategory === s.id;

                  return (
                    <div
                      key={s.id}
                      data-subcategory-id={s.id}
                      className="rounded-xl border bg-slate-50 p-4"
                    >
                      {/* HEADER SUBKATEGORI */}
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <b className="text-base">
                            {s.name}
                          </b>

                          <span className="ml-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            Mengikuti bobot {selectedCategoryData?.percentage || 0}% kategori
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              moveSubCategory(
                                selectedCategory,
                                selectedCategoryData?.subCategories || [],
                                selectedCategoryData?.subCategories.findIndex(
                                  (item) => item.id === s.id
                                ) ?? -1,
                                -1
                              )
                            }
                            disabled={
                              (selectedCategoryData?.subCategories.findIndex(
                                (item) => item.id === s.id
                              ) ?? 0) === 0
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-bold text-[#071a3d] disabled:cursor-not-allowed disabled:opacity-30"
                            title="Naikkan subkategori"
                          >
                            ↑
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              moveSubCategory(
                                selectedCategory,
                                selectedCategoryData?.subCategories || [],
                                selectedCategoryData?.subCategories.findIndex(
                                  (item) => item.id === s.id
                                ) ?? -1,
                                1
                              )
                            }
                            disabled={
                              (selectedCategoryData?.subCategories.findIndex(
                                (item) => item.id === s.id
                              ) ?? -1) ===
                              (selectedCategoryData?.subCategories.length ?? 1) - 1
                            }
                            className="rounded-lg border px-3 py-1.5 text-sm font-bold text-[#071a3d] disabled:cursor-not-allowed disabled:opacity-30"
                            title="Turunkan subkategori"
                          >
                            ↓
                          </button>

                          <button
                            type="button"
                            onClick={() => startEditSubCategory(s)}
                            className="ml-2 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteSubCategory(s.id)
                            }
                            className="ml-1 text-sm text-red-500"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {editingSubCategoryId === s.id && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-3">
                          <div className="grid gap-2 md:grid-cols-[1fr_auto_auto]">
                            <input
                              value={editingSubName}
                              onChange={(e) =>
                                setEditingSubName(e.target.value)
                              }
                              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
                              placeholder="Nama subkategori"
                            />
                            <button
                              type="button"
                              onClick={saveSubCategoryEdit}
                              className="rounded-lg bg-[#1769e0] px-4 py-2 text-sm font-bold text-white"
                            >
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditSubCategory}
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600"
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}

                      {/* DAFTAR MATERI */}
                      <div className="mt-3 space-y-2">
                        {s.criteria.length === 0 ? (
                          <div className="rounded-lg border border-dashed bg-white px-4 py-4 text-center text-sm text-slate-400">
                            Belum ada materi
                          </div>
                        ) : (
                          s.criteria.map((m, i) => (
                            <div key={m.id} className="space-y-2">
                              <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2">
                                <div className="min-w-0">
                                  <span className="mr-2 text-xs font-bold text-slate-400">{i + 1}</span>
                                  <b>{m.name}</b>
                                  <span className="ml-2 rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">
                                    Interval {m.interval ?? 2} — {intervalDifficulty(m.interval)}
                                  </span>
                                </div>
                                <div className="flex shrink-0 items-center gap-1">
                                  <button type="button" onClick={() => moveCriterion(selectedCategory, s.id, s.criteria, i, -1)} disabled={i === 0 || editingCriterionId === m.id} className="rounded-lg border px-2.5 py-1 text-sm font-bold text-[#071a3d] disabled:cursor-not-allowed disabled:opacity-30" title="Naikkan materi">↑</button>
                                  <button type="button" onClick={() => moveCriterion(selectedCategory, s.id, s.criteria, i, 1)} disabled={i === s.criteria.length - 1 || editingCriterionId === m.id} className="rounded-lg border px-2.5 py-1 text-sm font-bold text-[#071a3d] disabled:cursor-not-allowed disabled:opacity-30" title="Turunkan materi">↓</button>
                                  <button type="button" onClick={() => startEditCriterion(m)} className="ml-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">Edit</button>
                                  <button type="button" onClick={() => deleteCriterion(m.id)} disabled={editingCriterionId === m.id} className="ml-1 text-sm text-red-500 disabled:opacity-30">Hapus</button>
                                </div>
                              </div>

                              {editingCriterionId === m.id && (
                                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                                  <div className="mb-3">
                                    <p className="text-sm font-black text-[#071a3d]">Edit Materi</p>
                                    <p className="mt-1 text-xs text-slate-500">Ubah nama materi dan interval nilai. Bobot tetap mengikuti kategori.</p>
                                  </div>
                                  <div className="grid gap-2 md:grid-cols-[1fr_240px_auto_auto]">
                                    <input value={editingCriterionName} onChange={(e) => setEditingCriterionName(e.target.value)} placeholder="Nama materi" className="rounded-lg border border-blue-200 bg-white px-3 py-2 font-semibold outline-none focus:border-blue-500" />
                                    <select value={editingCriterionInterval} onChange={(e) => setEditingCriterionInterval(e.target.value)} className="rounded-lg border border-blue-200 bg-white px-3 py-2 font-semibold outline-none focus:border-blue-500">
                                      <option value="2">2 — Mudah</option>
                                      <option value="3">3 — Cenderung mudah</option>
                                      <option value="4">4 — Sedang</option>
                                      <option value="5">5 — Sulit</option>
                                      <option value="6">6 — Sangat sulit</option>
                                    </select>
                                    <button type="button" onClick={() => saveCriterionEdit(m, s)} className="rounded-lg bg-[#1769e0] px-4 py-2 font-bold text-white">Simpan</button>
                                    <button type="button" onClick={cancelEditCriterion} className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-bold text-slate-600">Batal</button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* =================================================
                          BUTTON TAMBAH MATERI
                      ================================================== */}
                      <button
                        onClick={() => {
                          if (isAdding) {
                            setActiveMaterialSubCategory(null);
                            setMaterialName("");
                            setMaterialId("");
                            setInterval("2");
                          } else {
                            setActiveMaterialSubCategory(s.id);
                            setMaterialName("");
                            setMaterialId("");
                            setInterval("2");
                          }
                        }}
                        className="mt-3 rounded-lg bg-[#071a3d] px-4 py-2 text-sm font-bold text-white"
                      >
                        {isAdding
                          ? "Tutup"
                          : "+ Tambah Materi"}
                      </button>

                      {/* =================================================
                          FORM MATERI — HANYA UNTUK SUBKATEGORI INI
                      ================================================== */}
                      {isAdding && (
                        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
                          <div className="mb-3">
                            <p className="text-sm font-black text-[#071a3d]">
                              Tambah Materi
                            </p>

                            <p className="text-xs text-slate-500">
                              Materi akan masuk ke subkategori:
                            </p>

                            <p className="mt-1 text-sm font-bold text-blue-700">
                              {s.name} — mengikuti {selectedCategoryData?.percentage || 0}% kategori
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Materi master dapat digunakan
                              berulang kali.
                            </p>
                          </div>

                          <div className="grid gap-2 md:grid-cols-3">
                            {/* MASTER MATERIAL */}
                            <div className="flex gap-2 md:col-span-2">
                              <select
                                value={materialId}
                                onChange={(e) => {
                                  const mId = e.target.value;
                                  setMaterialId(mId);
                                  const found = masterMaterials.find((m) => m.id === mId);
                                  if (found) {
                                    setMaterialName(found.name);
                                    if ((found as any).defaultInterval) {
                                      setInterval(String((found as any).defaultInterval));
                                    }
                                  } else {
                                    setMaterialName("");
                                  }
                                }}
                                className="min-w-0 flex-1 rounded-lg border px-3 py-2 text-sm font-semibold"
                              >
                                <option value="">
                                  + Materi baru (atau pilih dari riwayat...)
                                </option>

                                {masterMaterials.map((m) => (
                                  <option
                                    key={m.id}
                                    value={m.id}
                                  >
                                    {m.name} — Interval {(m as any).defaultInterval || 2} ({m.section})
                                  </option>
                                ))}
                              </select>

                              {materialId && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteMasterMaterial(materialId)
                                  }
                                  className="shrink-0 rounded-lg border border-red-200 px-3 py-2 text-xs font-bold text-red-600 transition active:scale-95 hover:bg-red-50"
                                  title="Hapus materi dari history pilihan"
                                >
                                  Hapus history
                                </button>
                              )}
                            </div>

                            {/* MATERI BARU */}
                            {!materialId && (
                              <input
                                value={materialName}
                                onChange={(e) =>
                                  setMaterialName(
                                    e.target.value
                                  )
                                }
                                placeholder="Nama materi baru"
                                className="rounded-lg border px-3 py-2 text-sm"
                              />
                            )}

                            {/* INTERVAL MATERI */}
                            <div className="md:col-span-1">
                              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-slate-500">
                                Interval Nilai
                              </label>
                              <select
                                value={interval}
                                onChange={(e) => setInterval(e.target.value)}
                                className="w-full rounded-lg border px-3 py-2"
                              >
                                <option value="2">2 — Mudah</option>
                                <option value="3">3 — Cenderung mudah</option>
                                <option value="4">4 — Sedang</option>
                                <option value="5">5 — Sulit</option>
                                <option value="6">6 — Sangat sulit</option>
                              </select>
                              <p className="mt-1 text-[11px] text-slate-500">
                                Komputer menentukan puncak nilai otomatis dari interval.
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              addMaterial(s.id)
                            }
                            className="mt-3 rounded-lg bg-[#1769e0] px-5 py-2 font-bold text-white transition active:scale-95 hover:bg-blue-600 shadow-xs"
                          >
                            + Tambahkan ke {s.name}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>

            {/* =====================================================
                TAMBAH SUBKATEGORI
            ====================================================== */}
            <div className="mt-5 border-t pt-5">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-bold text-[#071a3d]">
                  Tambah Subkategori
                </p>
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="font-bold text-slate-500">Pilihan Cepat:</span>
                  {["GERAKAN DASAR", "GERAKAN BERJALAN", "GERAKAN DI TEMPAT", "ABA-ABA TAMBAHAN", "TATA TERTIB"].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSubName(tag)}
                      className="rounded-full bg-white border border-blue-200 px-2.5 py-0.5 text-xs font-bold text-blue-700 transition active:scale-95 hover:bg-blue-100 shadow-xs"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2 md:grid-cols-[1fr_180px]">
                <input
                  value={subName}
                  onChange={(e) => setSubName(e.target.value)}
                  placeholder="Nama subkategori"
                  className="rounded-lg border px-3 py-2 text-sm"
                />

                <button
                  onClick={addSubCategory}
                  className="rounded-lg bg-[#1769e0] px-4 py-2 font-bold text-white transition active:scale-95 hover:bg-blue-600 shadow-xs"
                >
                  + Subkategori
                </button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                Subkategori tidak memiliki bobot. Seluruh nilai mengikuti bobot kategori <b>{selectedCategoryData?.percentage || 0}%</b>.
              </p>
            </div>

            {/* NAVIGASI KATEGORI + SIMPAN & LANJUTKAN */}
            {(() => {
              const currentIndex = categoriesForSelectedLevel.findIndex(
                (category) => category.id === selectedCategory
              );

              const previousCategory =
                currentIndex > 0
                  ? categoriesForSelectedLevel[currentIndex - 1]
                  : null;

              const nextCategory =
                currentIndex >= 0
                  ? categoriesForSelectedLevel[currentIndex + 1]
                  : null;

              return (
                <div className="mt-6 rounded-2xl border border-blue-200 bg-blue-50 p-5">
                  <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
                    {categoriesForSelectedLevel.map((category, index) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(category.id);
                          setActiveMaterialSubCategory(null);
                          cancelEditSubCategory();
                          cancelEditCriterion();
                          setMaterialName("");
                          setMaterialId("");
                          setInterval("2");
                        }}
                        className={
                          category.id === selectedCategory
                            ? "rounded-full bg-[#071a3d] px-4 py-2 text-xs font-black text-white"
                            : "rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:bg-blue-100"
                        }
                      >
                        {index + 1}. {category.name}
                      </button>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs font-black tracking-[.2em] text-blue-600">
                        {selectedLevelForEdit
                          ? `TINGKATAN: ${activeLevels.find((level) => level.id === selectedLevelForEdit)?.name || "-"}`
                          : "TINGKATAN BELUM DIPILIH"}
                      </p>
                      <p className="text-xs font-black tracking-[.2em] text-blue-600">
                        KATEGORI {currentIndex >= 0 ? currentIndex + 1 : 0} / {categoriesForSelectedLevel.length}
                      </p>
                      <h3 className="mt-1 text-lg font-black text-[#071a3d]">
                        {selectedCategoryData?.name || "Pilih kategori"}
                      </h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Semua perubahan tersimpan otomatis. Tombol berikutnya hanya berpindah di dalam tingkatan yang sedang diedit. Setelah kategori terakhir pada tingkatan ini selesai, sistem akan masuk ke tingkatan aktif berikutnya.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={!previousCategory}
                        onClick={() => {
                          if (!previousCategory) return;
                          setSelectedCategory(previousCategory.id);
                          setActiveMaterialSubCategory(null);
                          cancelEditSubCategory();
                          cancelEditCriterion();
                          setMaterialName("");
                          setMaterialId("");
                          setInterval("2");
                          setMessage(`Kembali ke kategori "${previousCategory.name}".`);
                        }}
                        className="rounded-xl border border-[#071a3d] bg-white px-5 py-3 font-bold text-[#071a3d] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        ← Sebelumnya
                      </button>

                      <button
                        type="button"
                        onClick={() => void saveAndContinue()}
                        disabled={!selectedCategory || categoriesForSelectedLevel.length === 0}
                        className="rounded-xl bg-[#1769e0] px-6 py-3 font-black text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {nextCategory
                          ? `Simpan & Lanjutkan ke ${nextCategory.name} →`
                          : "Simpan & Lanjutkan"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
          </>
        ) : null}

        {/* =========================================================
            MODAL DUPLIKAT KATEGORI
        ========================================================== */}
        {duplicatingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-[#071a3d] flex items-center gap-2">
                  📑 Duplikat Kategori
                </h3>
                <button
                  type="button"
                  onClick={cancelDuplicateCategory}
                  className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Kategori Asal
                  </label>
                  <p className="mt-1 rounded-xl bg-slate-50 p-3 text-sm font-black text-[#071a3d]">
                    {duplicatingCategory.name} ({duplicatingCategory.percentage}% • {duplicatingCategory.subCategories?.length || 0} Subkategori)
                  </p>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Nama Kategori Baru
                  </label>
                  <input
                    value={duplicateTargetName}
                    onChange={(e) => setDuplicateTargetName(e.target.value)}
                    placeholder="Nama kategori hasil duplikat"
                    className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm font-bold text-[#071a3d] outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Duplikat ke Tingkatan
                  </label>
                  <select
                    value={duplicateTargetLevelId}
                    onChange={(e) => setDuplicateTargetLevelId(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-[#071a3d] outline-none focus:border-blue-500"
                  >
                    {activeLevels.map((lvl) => (
                      <option key={lvl.id} value={lvl.id}>
                        {lvl.name} {lvl.id === duplicatingCategory.eventLevelId ? "(Tingkatan yang sama)" : ""}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Seluruh subkategori dan materi penilaian akan otomatis disalin secara lengkap.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={cancelDuplicateCategory}
                    className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition active:scale-95 hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    disabled={duplicatingLoading || !duplicateTargetName.trim()}
                    onClick={() => void handleDuplicateCategory()}
                    className="rounded-xl bg-[#1769e0] px-5 py-2.5 text-sm font-bold text-white transition active:scale-95 hover:bg-blue-600 disabled:opacity-50"
                  >
                    {duplicatingLoading ? "Menduplikasi..." : "🚀 Duplikat Sekarang"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}