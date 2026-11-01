export type TournamentLevel = {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
};

export type TournamentCategoryScore = {
  categoryId: string;
  categoryName: string;
  percentage: number;
  maximum: number;
  score: number;
  complete: boolean;
  scored: number;
  expected: number;
  judgeCount: number;
  judges?: {
    judgeId: string;
    judgeName: string;
    total: number;
    scored: number;
    expected: number;
  }[];
};

export type TournamentTeam = {
  id: string;
  number: number;
  name: string;
  school: string;
  level: string;
  eventLevelId: string | null;
  displayOrder: number;
  rawScore: number;
  bonus: number;
  penalty: number;
  finalScore: number;
  complete: boolean;
  rank: number | null;
  previousRank?: number | null;
  rankChange?: number; // >0: naik (▲), <0: turun (▼), 0: tetap (—)
  isRecentlyUpdated?: boolean;
  timerSeconds?: number;
  timerText?: string;
  categories: TournamentCategoryScore[];
};

export type TournamentEvent = {
  id: string;
  name: string;
  date?: string | null;
  location?: string | null;
  logo?: string | null;
  totalPoints: number;
};

export type StagePerformance = {
  currentTeam: {
    number: number;
    name: string;
    school: string;
    category: string;
    level: string;
    durationSeconds: number;
    maxDurationSeconds: number;
    status: "ON_STAGE" | "EVALUATING" | "FINISHED";
  } | null;
  nextTeams: {
    number: number;
    name: string;
    school: string;
    level: string;
    callOrder: number;
    standbyArea: string;
  }[];
  activeJudgesCount: number;
  totalJudgesCount: number;
};

export type HubTab = "leaderboard" | "podium" | "stage" | "vote" | "dispute";
