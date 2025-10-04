import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Grid, List, Plus, Star, ChevronRight, Play } from 'lucide-react'
import { TrainingList } from '../types'
import { defaultList, communityLists } from '../data'
import { useLocalStorage } from '../hooks'

// Helper function to get all items from a training list
const getAllItemsFromList = (list: TrainingList): string[] => {
  return Object.values(list.categories).flat()
}

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'community' | 'custom' | 'featured'
type SortType = 'popular' | 'newest' | 'alphabetical' | 'size'

interface ListCardProps {
  list: TrainingList
  isActive: boolean
  onSelect: (list: TrainingList) => void
  onPreview: (list: TrainingList) => void
  viewMode: ViewMode
}

function ListCard({ list, isActive, onSelect, onPreview, viewMode }: ListCardProps) {
  const allItems = getAllItemsFromList(list)
  const previewItems = allItems.slice(0, 8)
  const itemCount = allItems.length
  const isCustom = list.id.startsWith('custom-')

  // Generate preview images (in real app, these would be actual thumbnails)
  const previewImages = previewItems.map((item, i) => ({
    item,
    color: `hsl(${(i * 137.5) % 360}, 70%, 85%)`
  }))

  if (viewMode === 'list') {
    return (
      <div className={`group bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-md ${
        isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
      }`}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                {list.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{list.name}</h3>
                  {isActive && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">ACTIVE</span>}
                  {isCustom && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">CUSTOM</span>}
                </div>
                {list.description && (
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{list.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">{itemCount} drawing subjects</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPreview(list)}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Quick preview"
              >
                <Search size={18} />
              </button>
              <button
                onClick={() => onSelect(list)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                {isActive ? 'Currently Active' : 'Use This List'}
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group bg-white rounded-xl border-2 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer ${
      isActive ? 'border-blue-500 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
    }`}>
      {/* Preview Grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {previewImages.map(({ item, color }, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg flex items-center justify-center text-xs font-medium text-gray-700 border border-gray-200"
              style={{ backgroundColor: color }}
              title={item}
            >
              {item.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Card Content */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {list.name}
              </h3>
              {isActive && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
                  ACTIVE
                </span>
              )}
            </div>
            {list.description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{list.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {itemCount} drawing subjects • {isCustom ? 'Custom list' : 'Community list'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPreview(list)
              }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Search size={14} />
              Preview
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onSelect(list)
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                isActive
                  ? 'bg-blue-100 text-blue-800 cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              disabled={isActive}
            >
              {isActive ? (
                <>
                  <Star size={14} />
                  Active
                </>
              ) : (
                <>
                  <Play size={14} />
                  Use List
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrowseListsPage() {
  const navigate = useNavigate()
  const [customLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [settings, setSettings] = useLocalStorage('vlt-settings', { activeListId: defaultList.id })

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [sortBy, setSortBy] = useState<SortType>('popular')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [previewList, setPreviewList] = useState<TrainingList | null>(null)

  // Combine all lists
  const allLists = useMemo(() => [
    defaultList,
    ...communityLists,
    ...customLists
  ], [customLists])

  // Get active list
  const activeList = allLists.find(list => list.id === settings.activeListId) || defaultList

  // Filter and sort lists
  const filteredLists = useMemo(() => {
    let filtered = allLists

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(list => {
        const allItems = getAllItemsFromList(list)
        return list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          allItems.some(item => item.toLowerCase().includes(searchQuery.toLowerCase()))
      })
    }

    // Apply category filter
    switch (activeFilter) {
      case 'community':
        filtered = filtered.filter(list => !list.id.startsWith('custom-') && list.id !== 'default')
        break
      case 'custom':
        filtered = filtered.filter(list => list.id.startsWith('custom-'))
        break
      case 'featured':
        filtered = filtered.filter(list => list.id === 'default' || communityLists.slice(0, 3).includes(list))
        break
    }

    // Apply sorting
    switch (sortBy) {
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'size':
        filtered.sort((a, b) => getAllItemsFromList(b).length - getAllItemsFromList(a).length)
        break
      case 'newest':
        // Custom lists are "newest" - this is a simplified sort
        filtered.sort((a, b) => {
          if (a.id.startsWith('custom-') && !b.id.startsWith('custom-')) return -1
          if (!a.id.startsWith('custom-') && b.id.startsWith('custom-')) return 1
          return 0
        })
        break
      case 'popular':
      default:
        // Keep default order (featured first)
        break
    }

    return filtered
  }, [allLists, searchQuery, activeFilter, sortBy])

  const handleSelectList = (list: TrainingList) => {
    setSettings(prev => ({ ...prev, activeListId: list.id }))
    navigate('/app/dashboard')
  }

  const handlePreviewList = (list: TrainingList) => {
    setPreviewList(list)
  }

  const filterOptions = [
    { id: 'all', label: 'All Lists', count: allLists.length },
    { id: 'featured', label: 'Featured', count: 4 },
    { id: 'community', label: 'Community', count: communityLists.length },
    { id: 'custom', label: 'My Lists', count: customLists.length }
  ] as const

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Browse Training Lists</h1>
              <p className="text-gray-600">
                Discover and switch between different drawing subject collections
              </p>
            </div>
            <button
              onClick={() => navigate('/create-list')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus size={20} />
              Create New List
            </button>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search lists or drawing subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex items-center bg-white border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {filterOptions.map(option => (
              <button
                key={option.id}
                onClick={() => setActiveFilter(option.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  activeFilter === option.id
                    ? 'bg-blue-100 text-blue-700 border-2 border-blue-200'
                    : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-gray-300'
                }`}
              >
                {option.label}
                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                  {option.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="popular">Most Popular</option>
              <option value="alphabetical">Alphabetical</option>
              <option value="size">List Size</option>
              <option value="newest">Newest First</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing {filteredLists.length} of {allLists.length} lists
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>

        {/* Lists Grid/List */}
        {filteredLists.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No lists found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery
                ? `No lists match "${searchQuery}". Try a different search term.`
                : 'No lists match your current filters.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {filteredLists.map(list => (
              <ListCard
                key={list.id}
                list={list}
                isActive={list.id === activeList.id}
                onSelect={handleSelectList}
                onPreview={handlePreviewList}
                viewMode={viewMode}
              />
            ))}
          </div>
        )}

        {/* Preview Modal */}
        {previewList && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setPreviewList(null)}
          >
            <div
              className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{previewList.name}</h3>
                    <p className="text-gray-600">{getAllItemsFromList(previewList).length} drawing subjects</p>
                  </div>
                  <button
                    onClick={() => setPreviewList(null)}
                    className="text-gray-400 hover:text-gray-600 p-1"
                  >
                    ×
                  </button>
                </div>
              </div>
              <div className="p-6 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {getAllItemsFromList(previewList).map((item, i) => (
                    <div
                      key={i}
                      className="bg-gray-50 rounded-lg p-3 text-sm font-medium text-gray-700 text-center"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={() => setPreviewList(null)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleSelectList(previewList)
                    setPreviewList(null)
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Use This List
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}