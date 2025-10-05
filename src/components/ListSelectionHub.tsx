import { useNavigate } from 'react-router-dom'
import { Play, Users, Star, Plus, BookOpen, Target, Clock, Brain, Zap } from 'lucide-react'
import { TrainingList, HistoryEntry, ItemRatings, TrainingAlgorithm } from '../types'

interface ListSelectionHubProps {
  allLists: TrainingList[]
  history: HistoryEntry[]
  itemRatings: ItemRatings
  onSelectList: (list: TrainingList) => void
  algorithmMode: boolean
  selectedAlgorithm: TrainingAlgorithm
  trainingAlgorithms: TrainingAlgorithm[]
  onAlgorithmModeChange: (enabled: boolean) => void
  onAlgorithmChange: (algorithm: TrainingAlgorithm) => void
}

export function ListSelectionHub({
  allLists,
  history,
  itemRatings,
  onSelectList,
  algorithmMode,
  selectedAlgorithm,
  trainingAlgorithms,
  onAlgorithmModeChange,
  onAlgorithmChange
}: ListSelectionHubProps) {
  const navigate = useNavigate()

  const getListStats = (list: TrainingList) => {
    const allItems = Object.values(list.categories).flat()
    const totalItems = allItems.length

    // Count how many items from this list have been practiced
    const practizedItems = allItems.filter(item =>
      history.some(entry => entry.item === item)
    ).length

    // Average rating for this list
    const listRatings = allItems.map(item => itemRatings[item]).filter(Boolean)
    const avgRating = listRatings.length > 0
      ? listRatings.reduce((sum, rating) => sum + Number(rating), 0) / listRatings.length
      : 0

    // Recent activity
    const recentSessions = history.filter(entry =>
      allItems.includes(entry.item)
    ).slice(-5)

    return {
      totalItems,
      practizedItems,
      avgRating,
      recentSessions: recentSessions.length,
      progressPercent: Math.round((practizedItems / totalItems) * 100)
    }
  }

  const startPractice = (list: TrainingList) => {
    onSelectList(list)

    // Get first item from the list (could be algorithmic later)
    const categories = Object.keys(list.categories)
    const firstCategory = categories[0]
    const firstItem = list.categories[firstCategory][0]

    navigate(`/app/practice/${encodeURIComponent(firstItem)}?category=${encodeURIComponent(firstCategory)}`)
  }

  const featuredLists = allLists.filter(list => !list.isCustom).slice(0, 3)
  const customLists = allLists.filter(list => list.isCustom)

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-bold">
          Choose Your <span className="bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">Visual Journey</span>
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Select a training list to begin building your visual memory. Each list offers a curated collection of subjects designed to challenge and improve your artistic recall.
        </p>
      </div>

      {/* Algorithm Settings */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Training Intelligence</h3>
            <p className="text-sm text-gray-600">Customize how subjects are selected for optimal learning</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Algorithm Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <div>
                <div className="font-medium text-gray-900">Smart Algorithm Mode</div>
                <div className="text-sm text-gray-600">AI-powered subject selection based on your performance</div>
              </div>
            </div>
            <button
              onClick={() => onAlgorithmModeChange(!algorithmMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                algorithmMode ? 'bg-orange-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  algorithmMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Algorithm Selection */}
          {algorithmMode && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Algorithm Strategy:</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {trainingAlgorithms.map((algorithm) => (
                  <button
                    key={algorithm.id}
                    onClick={() => onAlgorithmChange(algorithm)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      selectedAlgorithm.id === algorithm.id
                        ? 'border-orange-400 bg-orange-50 text-orange-900'
                        : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'
                    }`}
                  >
                    <div className="font-medium text-sm">{algorithm.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{algorithm.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 justify-center">
        <button
          onClick={() => navigate('/app/create-list')}
          className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-900 font-semibold px-6 py-3 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
        >
          <Plus size={20} />
          Create Custom List
        </button>
      </div>

      {/* Featured Lists */}
      <section>
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Star className="w-6 h-6 text-orange-400" />
          Featured Lists
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {featuredLists.map(list => {
            const stats = getListStats(list)
            return (
              <div
                key={list.id}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="space-y-4">
                  {/* List Header */}
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                      {list.name}
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      {list.description || 'Master the fundamentals'}
                    </p>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-t border-gray-100">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-500">{stats.totalItems}</div>
                      <div className="text-xs text-gray-500">Subjects</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-500">{stats.progressPercent}%</div>
                      <div className="text-xs text-gray-500">Progress</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => startPractice(list)}
                    className="w-full bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2 group-hover:shadow-lg"
                  >
                    <Play size={18} />
                    Start Training
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Custom Lists */}
      {customLists.length > 0 && (
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-500" />
            Your Custom Lists
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customLists.map(list => {
              const stats = getListStats(list)
              return (
                <div
                  key={list.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="space-y-4">
                    {/* List Header */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {list.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Target size={12} />
                          {stats.totalItems} subjects
                        </span>
                        {stats.recentSessions > 0 && (
                          <span className="flex items-center gap-1">
                            <Clock size={12} />
                            {stats.recentSessions} recent
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Progress */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium text-blue-600">{stats.progressPercent}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${stats.progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => startPractice(list)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                    >
                      <Play size={18} />
                      Continue Training
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <div className="text-center py-8 border-t border-gray-200">
        <p className="text-gray-600 mb-4">
          Ready to build an unshakeable visual library?
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            onClick={() => startPractice(allLists[0])}
            className="bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-slate-900 font-bold px-8 py-4 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
          >
            <Play size={20} />
            Quick Start Training
          </button>
        </div>
      </div>
    </div>
  )
}