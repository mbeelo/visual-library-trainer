import { useNavigate } from 'react-router-dom'
import { Brain, BookOpen, Users, Star, Plus, Target, Zap, Trophy } from 'lucide-react'
import { TrainingList, HistoryEntry, ItemRatings, TrainingAlgorithm } from '../types'
import { ProgressDashboard } from './ProgressDashboard'
import { useAuth } from '../contexts/AuthContext'

interface VisualLibraryHubProps {
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

export function VisualLibraryHub({
  allLists,
  history,
  itemRatings,
  onSelectList,
  algorithmMode,
  selectedAlgorithm,
  trainingAlgorithms,
  onAlgorithmModeChange,
  onAlgorithmChange
}: VisualLibraryHubProps) {
  const navigate = useNavigate()
  const { findListByOriginalId } = useAuth()

  const getListStats = (list: TrainingList) => {
    const allItems = Object.values(list.categories).flat()
    const totalItems = allItems.length

    // Count how many items from this list have been practiced
    const practizedItems = allItems.filter(item =>
      history.some(entry => entry.item === item)
    ).length

    // Count mastered items (rated as 'easy')
    const masteredItems = allItems.filter(item => itemRatings[item] === 'easy').length

    // Count items that need practice (struggled/failed)
    const needsPractice = allItems.filter(item =>
      itemRatings[item] === 'struggled' || itemRatings[item] === 'failed'
    ).length

    return {
      totalItems,
      practizedItems,
      masteredItems,
      needsPractice,
      progressPercentage: totalItems > 0 ? Math.round((practizedItems / totalItems) * 100) : 0
    }
  }

  const handleEnterList = (list: TrainingList) => {
    onSelectList(list)
    navigate(`/app/list/${list.id}`)
  }

  const handleQuickPractice = (list: TrainingList) => {
    onSelectList(list)

    // Get first item from the list (could be algorithmic later)
    const categories = Object.keys(list.categories)
    const firstCategory = categories[0]
    const firstItem = list.categories[firstCategory][0]

    // Map conceptual list ID to actual database UUID if it's a curated list
    const actualList = findListByOriginalId(list.id)
    const listIdToUse = actualList ? actualList.id : list.id

    console.log(`🎯 Quick Practice: Mapping "${list.id}" → "${listIdToUse}" for "${list.name}"`)
    navigate(`/app/practice/${listIdToUse}/${encodeURIComponent(firstItem)}?category=${encodeURIComponent(firstCategory)}`)
  }

  const featuredLists = allLists.filter(list => !list.isCustom).slice(0, 3)
  const customLists = allLists.filter(list => list.isCustom)

  return (
    <div className="space-y-8">
      {/* Hero Header - Visual Memory Palace */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        <div className="text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white animate-fade-in">
              The <span className="text-orange-400">Art</span> of Seeing Twice
            </h1>
          </div>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Train your visual memory by drawing from your mind's eye first, then studying references.
            Build an <strong className="text-orange-400">afterimage</strong> that strengthens with every practice session.
          </p>

          <div className="pt-4">
            <button
              onClick={() => {
                // Quick start with Visual Basics (default list)
                const defaultList = allLists.find(list => list.id === 'default' && !list.isCustom)
                if (defaultList) {
                  const categories = Object.keys(defaultList.categories)
                  const firstCategory = categories[0]
                  const firstItem = defaultList.categories[firstCategory][0]

                  // Map conceptual "default" ID to actual database UUID
                  const actualList = findListByOriginalId('default')
                  const listIdToUse = actualList ? actualList.id : defaultList.id

                  console.log(`🎯 Hero button: Using list ID "${listIdToUse}" for Visual Basics`)
                  onSelectList(defaultList)
                  navigate(`/app/practice/${listIdToUse}/${encodeURIComponent(firstItem)}?category=${encodeURIComponent(firstCategory)}`)
                }
              }}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-bold text-xl px-12 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transform hover:scale-105"
            >
              Start Drawing
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Settings */}
      <details className="group">
        <summary className="bg-slate-800 border border-orange-500/20 rounded-xl p-6 cursor-pointer hover:bg-slate-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Choose Your Training Style</h3>
                <p className="text-sm text-slate-300">
                  Select how subjects are chosen from your training lists
                </p>
              </div>
            </div>
            <div className="text-orange-400 group-open:rotate-180 transition-transform">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </summary>

        <div className="bg-slate-800 border border-orange-500/20 border-t-0 rounded-b-xl p-6 space-y-4">
          {/* Algorithm Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-orange-400" />
              <div>
                <div className="font-medium text-white">
                  {algorithmMode ? 'Smart Algorithm Mode' : 'Random Selection Mode'}
                </div>
                <div className="text-sm text-slate-300">
                  {algorithmMode
                    ? 'AI-powered subject selection based on your memory performance'
                    : 'Completely random subject selection for variety and surprise'
                  }
                </div>
              </div>
            </div>
            <button
              onClick={() => onAlgorithmModeChange(!algorithmMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                algorithmMode ? 'bg-orange-400' : 'bg-slate-600'
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trainingAlgorithms.filter(alg => alg.id !== 'random').map(algorithm => (
                <button
                  key={algorithm.id}
                  onClick={() => onAlgorithmChange(algorithm)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedAlgorithm.id === algorithm.id
                      ? 'border-orange-400 bg-orange-500/10'
                      : 'border-slate-600 hover:border-orange-300 hover:bg-orange-500/5'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {algorithm.icon && <span className="text-lg">{algorithm.icon}</span>}
                    <span className="font-medium text-white">{algorithm.name}</span>
                  </div>
                  <p className="text-xs text-slate-300">{algorithm.description}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </details>

      {/* Progress Dashboard */}
      <ProgressDashboard />

      {/* Custom Lists */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-orange-400" />
            Your Custom Lists
          </h2>
          <button
            onClick={() => navigate('/app/create-list')}
            className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2 text-sm hover:shadow-lg hover:shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            Create New List
          </button>
        </div>

        {customLists.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {customLists.map((list) => (
              <ListCard
                key={list.id}
                list={list}
                stats={getListStats(list)}
                onEnterList={() => handleEnterList(list)}
                onQuickPractice={() => handleQuickPractice(list)}
                isCustom
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-800/30 border border-orange-500/20 rounded-xl">
            <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">No Custom Lists Yet</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Create your own personalized training lists with subjects that matter to your artistic journey.
            </p>
            <button
              onClick={() => navigate('/app/create-list')}
              className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-6 py-3 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg hover:shadow-orange-500/25"
            >
              <Plus className="w-5 h-5" />
              Create Your First List
            </button>
          </div>
        )}
      </div>

      {/* Featured Lists */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-orange-400" />
            Curated Training Lists
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {featuredLists.map((list) => (
            <ListCard
              key={list.id}
              list={list}
              stats={getListStats(list)}
              onEnterList={() => handleEnterList(list)}
              onQuickPractice={() => handleQuickPractice(list)}
            />
          ))}
        </div>
      </div>

      {/* Philosophy Footer */}
      <div className="text-center py-8 border-t border-orange-500/20">
        <p className="text-slate-300 max-w-2xl mx-auto">
          <strong className="text-orange-400">Remember:</strong> Your mind already knows more than you realize.
          Draw from memory first, then let your references validate and enrich what you've conjured.
          <br />
          <span className="text-sm italic text-orange-400">The art of seeing twice</span>
        </p>
      </div>
    </div>
  )
}

// List Card Component
function ListCard({
  list,
  stats,
  onEnterList,
  onQuickPractice,
  isCustom = false
}: {
  list: TrainingList
  stats: {
    totalItems: number
    practizedItems: number
    masteredItems: number
    needsPractice: number
    progressPercentage: number
  }
  onEnterList: () => void
  onQuickPractice: () => void
  isCustom?: boolean
}) {
  return (
    <div className="bg-slate-800 border border-orange-500/20 rounded-xl overflow-hidden shadow-sm hover:shadow-md hover:shadow-orange-500/25 transition-all duration-200 group">
      {/* Header */}
      <div className="p-6 border-b border-orange-500/20">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-xl text-white mb-2 group-hover:text-orange-400 transition-colors">
              {list.name}
            </h3>
            <p className="text-sm text-slate-300 line-clamp-2">
              {list.description}
            </p>
          </div>
          <div className="ml-3">
            <span className={`inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium ${
              isCustom
                ? 'border border-orange-400 text-orange-400 bg-transparent'
                : 'bg-orange-400 text-slate-900'
            }`}>
              {isCustom ? 'Custom' : 'Curated'}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Created by {list.creator}
        </div>
      </div>

      {/* Stats */}
      <div className="p-6 bg-slate-700/30">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="w-4 h-4 text-orange-500" />
              <span className="text-lg font-bold text-white">{stats.totalItems}</span>
            </div>
            <div className="text-xs text-slate-300">Subjects</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="w-4 h-4 text-green-500" />
              <span className="text-lg font-bold text-green-600">{stats.masteredItems}</span>
            </div>
            <div className="text-xs text-slate-300">Mastered</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-300 mb-1">
            <span>Visual Memory Progress</span>
            <span>{stats.progressPercentage}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-400 to-amber-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${stats.progressPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Needs Practice */}
        {stats.needsPractice > 0 && (
          <div className="flex items-center gap-2 text-xs text-orange-400 bg-orange-500/20 px-2 py-1 rounded-full">
            <Target className="w-3 h-3" />
            <span>{stats.needsPractice} need memory strengthening</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-6 bg-slate-800">
        <div className="flex gap-3">
          <button
            onClick={onEnterList}
            className="flex-1 px-4 py-3 border border-orange-400 text-orange-400 hover:bg-orange-400/10 rounded-lg transition-colors font-medium"
          >
            Explore
          </button>
          <button
            onClick={onQuickPractice}
            className="flex-1 bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 px-4 rounded-lg transition-all transform group-hover:scale-105 hover:shadow-lg hover:shadow-orange-500/25 relative"
          >
            Draw
          </button>
        </div>
      </div>
    </div>
  )
}