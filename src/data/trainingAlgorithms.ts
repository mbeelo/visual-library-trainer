export interface TrainingAlgorithm {
  id: string;
  name: string;
  description: string;
  icon: string;
  strugglingWeight: number; // 0-1, how much to favor struggling items
  recentWeight: number; // 0-1, how much to favor recently practiced items
  categoryBalance: boolean; // whether to balance across categories
  spacedRepetition: boolean; // whether to use spaced repetition timing
}

export const trainingAlgorithms: TrainingAlgorithm[] = [
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Smart mix with gentle focus on improvement areas',
    icon: '⚖️',
    strugglingWeight: 0.4,
    recentWeight: 0.3,
    categoryBalance: true,
    spacedRepetition: false
  },
  {
    id: 'struggling-focus',
    name: 'Focused Practice',
    description: 'Prioritizes subjects you want to get better at',
    icon: '🎯',
    strugglingWeight: 0.7,
    recentWeight: 0.2,
    categoryBalance: false,
    spacedRepetition: true
  },
  {
    id: 'fresh-exploration',
    name: 'Discovery Mode',
    description: 'Explores new subjects and fresh challenges',
    icon: '🌟',
    strugglingWeight: 0.2,
    recentWeight: 0.1,
    categoryBalance: true,
    spacedRepetition: false
  },
  {
    id: 'spaced-repetition',
    name: 'Memory Trainer',
    description: 'Optimized timing for long-term retention',
    icon: '🧠',
    strugglingWeight: 0.5,
    recentWeight: 0.4,
    categoryBalance: false,
    spacedRepetition: true
  },
  {
    id: 'random',
    name: 'Surprise Me',
    description: 'Completely random for variety and fun',
    icon: '🎲',
    strugglingWeight: 0,
    recentWeight: 0,
    categoryBalance: false,
    spacedRepetition: false
  }
];