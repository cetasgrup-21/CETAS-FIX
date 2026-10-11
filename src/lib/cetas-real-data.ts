/**
 * CETAS REAL TOURNAMENT DATA (CLEAN INITIAL STATE)
 */

export interface RealOption {
  id: string;
  label: string;
  score: number;
  sortOrder: number;
}

export interface RealCriterion {
  id: string;
  name: string;
  section: string;
  interval: number;
  difficulty: "MUDAH" | "SULIT";
  sortOrder: number;
  options: RealOption[];
}

export interface RealSubCategory {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  criteria: RealCriterion[];
}

export interface RealCategory {
  id: string;
  name: string;
  percentage: number;
  sortOrder: number;
  eventId: string;
  eventLevelId: string;
  levelName: string;
  subCategories: RealSubCategory[];
}

export interface RealParticipant {
  id: string;
  eventId: string;
  eventLevelId?: string | null;
  categoryId?: string | null;
  displayOrder?: number | null;
  number: number;
  name: string;
  school?: string | null;
  level?: string | null;
  photo?: string | null;
  logo?: string | null;
  status?: string;
  createdAt?: number | string;
  updatedAt?: number | string;
  [key: string]: unknown;
}

export interface RealJudge {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  pin: string;
}

export const REAL_EVENT = null;
export const REAL_LEVELS: unknown[] = [];
export const REAL_JUDGES: RealJudge[] = [];
export const REAL_PARTICIPANTS: RealParticipant[] = [];
export const REAL_CATEGORIES: RealCategory[] = [];
export const REAL_JUDGE_ASSIGNMENTS: unknown[] = [];
