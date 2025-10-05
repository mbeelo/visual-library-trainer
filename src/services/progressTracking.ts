import { HistoryEntry, StreakData, ProgressStats, ItemRatings } from '../types';

export class ProgressTrackingService {
  private static STREAK_KEY = 'vlt-streak-data';
  private static PROGRESS_KEY = 'vlt-progress-stats';

  // Streak Management
  static getStreakData(): StreakData {
    const stored = localStorage.getItem(this.STREAK_KEY);
    if (!stored) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        lastPracticeDate: null
      };
    }
    return JSON.parse(stored);
  }

  static updateStreak(): StreakData {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const streakData = this.getStreakData();

    // If already practiced today, don't update
    if (streakData.lastPracticeDate === today) {
      return streakData;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak continues or resets
    if (streakData.lastPracticeDate === yesterdayStr) {
      // Continuing streak
      streakData.currentStreak += 1;
    } else if (streakData.lastPracticeDate === null || streakData.lastPracticeDate < yesterdayStr) {
      // Reset streak (missed days or first time)
      streakData.currentStreak = 1;
    }

    // Update longest streak if needed
    if (streakData.currentStreak > streakData.longestStreak) {
      streakData.longestStreak = streakData.currentStreak;
    }

    streakData.lastPracticeDate = today;

    localStorage.setItem(this.STREAK_KEY, JSON.stringify(streakData));
    return streakData;
  }

  // Progress Stats Management
  static getProgressStats(): ProgressStats {
    const stored = localStorage.getItem(this.PROGRESS_KEY);
    if (!stored) {
      return {
        totalSessions: 0,
        totalPracticeTime: 0,
        subjectsMastered: 0,
        averageSessionTime: 0,
        practiceSessionsThisWeek: 0,
        practiceSessionsThisMonth: 0,
        weeklyGoal: 5 // Default goal: 5 sessions per week
      };
    }
    return JSON.parse(stored);
  }

  static updateProgressStats(
    sessionTime: number,
    history: HistoryEntry[],
    itemRatings: ItemRatings
  ): ProgressStats {
    const stats = this.getProgressStats();

    // Update basic stats
    stats.totalSessions += 1;
    stats.totalPracticeTime += sessionTime;
    stats.averageSessionTime = Math.round(stats.totalPracticeTime / stats.totalSessions);

    // Count mastered subjects (rated as 'easy')
    stats.subjectsMastered = Object.values(itemRatings).filter(rating => rating === 'easy').length;

    // Count sessions this week/month
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    stats.practiceSessionsThisWeek = history.filter(entry =>
      new Date(entry.date) >= oneWeekAgo
    ).length;

    stats.practiceSessionsThisMonth = history.filter(entry =>
      new Date(entry.date) >= oneMonthAgo
    ).length;

    localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(stats));
    return stats;
  }

  // Utility functions
  static formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  static calculateWeeklyProgress(stats: ProgressStats): number {
    return Math.min((stats.practiceSessionsThisWeek / stats.weeklyGoal) * 100, 100);
  }

  static getStreakEmoji(streak: number): string {
    if (streak === 0) return '🌱';
    if (streak < 3) return '🔥';
    if (streak < 7) return '💪';
    if (streak < 14) return '🚀';
    if (streak < 30) return '⭐';
    return '👑';
  }
}