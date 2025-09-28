export interface TrainingList {
  id: string;
  name: string;
  creator: string;
  categories: Record<string, string[]>;
  createdAt?: Date;
  isCustom?: boolean;
}


export interface HistoryEntry {
  item: string;
  category: string;
  time: number;
  rating: 'easy' | 'got-it' | 'struggled' | 'failed';
  date: Date;
}

export interface TimerPreset {
  id: string;
  name: string;
  duration: number; // in seconds
  description?: string;
}

export interface PracticeMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  suggestedDuration: number; // in seconds
}

export interface TrainingAlgorithm {
  id: string;
  name: string;
  description: string;
  icon: string;
  strugglingWeight: number;
  recentWeight: number;
  categoryBalance: boolean;
  spacedRepetition: boolean;
}

export interface AppSettings {
  algorithmMode: boolean;
  activeListId: string;
  defaultTimerDuration: number;
  selectedAlgorithm: string;
  soundEnabled: boolean;
  autoAdvance: boolean;
}

export interface CustomListData {
  name: string;
  creator: string;
  socialLink?: string;
  rawItems: string;
}

export type Phase = 'welcome' | 'dashboard' | 'session-setup' | 'drawing' | 'reference' | 'complete';
export type Rating = 'easy' | 'got-it' | 'struggled' | 'failed';
export type ItemRatings = Record<string, Rating>;