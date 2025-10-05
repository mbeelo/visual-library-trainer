export interface TrainingList {
  id: string;
  name: string;
  description?: string;
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
  description?: string;
  creator: string;
  socialLink?: string;
  rawItems: string;
}

export type Phase = 'welcome' | 'dashboard' | 'session-setup' | 'drawing' | 'reference' | 'complete';
export type Rating = 'easy' | 'got-it' | 'struggled' | 'failed';
export type ItemRatings = Record<string, Rating>;

// Image Collection Types
export interface ImageCollection {
  id: string;
  user_id: string;
  drawing_subject: string;
  image_url: string;
  position: number;
  notes?: string;
  created_at: string;
}

export interface ImageCollectionInput {
  drawing_subject: string;
  image_url: string;
  notes?: string;
}

// Subscription Types
export type SubscriptionTier = 'free' | 'pro';

export interface User {
  id: string;
  email: string;
  subscription_tier: SubscriptionTier;
  created_at: string;
}

// Enhanced History Entry with image usage
export interface EnhancedHistoryEntry extends HistoryEntry {
  images_used?: number;
}

// Streak and Progress Tracking Types
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // ISO date string
}

export interface ProgressStats {
  totalSessions: number;
  totalPracticeTime: number; // in seconds
  subjectsMastered: number;
  averageSessionTime: number;
  practiceSessionsThisWeek: number;
  practiceSessionsThisMonth: number;
  weeklyGoal: number; // sessions per week
}