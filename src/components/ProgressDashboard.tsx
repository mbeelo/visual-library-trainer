import { Trophy, Target, Clock, TrendingUp, Flame } from 'lucide-react'
import { ProgressTrackingService } from '../services/progressTracking'
import { useState, useEffect } from 'react'
import { StreakData, ProgressStats } from '../types'

export function ProgressDashboard() {
  const [streakData, setStreakData] = useState<StreakData | null>(null)
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null)

  useEffect(() => {
    setStreakData(ProgressTrackingService.getStreakData())
    setProgressStats(ProgressTrackingService.getProgressStats())
  }, [])

  if (!streakData || !progressStats) {
    return null
  }

  const weeklyProgress = ProgressTrackingService.calculateWeeklyProgress(progressStats)
  const streakEmoji = ProgressTrackingService.getStreakEmoji(streakData.currentStreak)

  return (
    <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-slate-900" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Your Progress</h3>
          <p className="text-sm text-slate-300">Building visual memory through consistent practice</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Streak */}
        <div className="bg-orange-50/10 rounded-lg p-4 border border-orange-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {streakData.currentStreak}
          </div>
          <div className="text-xs text-slate-300">Day streak</div>
          {streakData.longestStreak > streakData.currentStreak && (
            <div className="text-xs text-orange-400 mt-1">
              Best: {streakData.longestStreak} days
            </div>
          )}
        </div>

        {/* Total Sessions */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {progressStats.totalSessions}
          </div>
          <div className="text-xs text-slate-300">Total sessions</div>
        </div>

        {/* Practice Time */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {ProgressTrackingService.formatTime(progressStats.totalPracticeTime)}
          </div>
          <div className="text-xs text-slate-300">Practice time</div>
        </div>

        {/* Mastered Subjects */}
        <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-orange-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {progressStats.subjectsMastered}
          </div>
          <div className="text-xs text-slate-300">Mastered</div>
        </div>
      </div>

      {/* Weekly Goal Progress */}
      <div className="mt-6 p-4 bg-slate-700/30 rounded-lg border border-slate-600">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-sm font-medium text-white">Weekly Goal</div>
            <div className="text-xs text-slate-300">
              {progressStats.practiceSessionsThisWeek} of {progressStats.weeklyGoal} sessions
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-orange-400">
              {Math.round(weeklyProgress)}%
            </div>
          </div>
        </div>

        <div className="w-full bg-slate-600 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${Math.min(weeklyProgress, 100)}%` }}
          />
        </div>

        {weeklyProgress >= 100 && (
          <div className="text-xs text-green-400 mt-2 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Weekly goal achieved! 🎉
          </div>
        )}
      </div>
    </div>
  )
}