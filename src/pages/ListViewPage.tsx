import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Dashboard from '../components/Dashboard'
import { useLocalStorage } from '../hooks'
import { HistoryEntry, ItemRatings, TrainingList, TrainingAlgorithm } from '../types'
import { defaultList, communityLists, trainingAlgorithms } from '../data'

export function ListViewPage() {
  const { listId } = useParams<{ listId: string }>()
  const navigate = useNavigate()

  const [history] = useLocalStorage<HistoryEntry[]>('vlt-history', [])
  const [itemRatings] = useLocalStorage<ItemRatings>('vlt-ratings', {})
  const [customLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [settings, setSettings] = useLocalStorage('vlt-settings', {
    algorithmMode: true,
    activeListId: defaultList.id,
    selectedAlgorithm: 'struggling-focus',
    soundEnabled: true
  })

  const allLists = [defaultList, ...communityLists, ...customLists]
  const currentList = allLists.find(list => list.id === listId) || defaultList
  const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0]

  const handleAlgorithmModeChange = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, algorithmMode: enabled }))
  }

  const handleAlgorithmChange = (algorithm: TrainingAlgorithm) => {
    setSettings(prev => ({ ...prev, selectedAlgorithm: algorithm.id }))
  }

  const handleSoundToggle = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }))
  }

  const generateChallenge = () => {
    // Get a random subject from the current list to practice
    const allSubjects = Object.values(currentList.categories).flat()
    if (allSubjects.length === 0) return

    // Set as active list
    setSettings(prev => ({ ...prev, activeListId: currentList.id }))

    // Simple random selection for now (can enhance with algorithm later)
    const randomSubject = allSubjects[Math.floor(Math.random() * allSubjects.length)]

    // Find the category for this subject
    const category = Object.entries(currentList.categories).find(([_, items]) =>
      items.includes(randomSubject)
    )?.[0] || 'General'

    navigate(`/app/practice/${currentList.id}/${encodeURIComponent(randomSubject)}?category=${encodeURIComponent(category)}`)
  }

  const handlePracticeSubject = (subject: string, category: string) => {
    // Set as active list
    setSettings(prev => ({ ...prev, activeListId: currentList.id }))

    navigate(`/app/practice/${currentList.id}/${encodeURIComponent(subject)}?category=${encodeURIComponent(category)}`)
  }

  return (
    <div className="space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/app/dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Library</span>
        </button>
        <div className="h-4 w-px bg-orange-500/20"></div>
        <div>
          <h1 className="text-lg font-semibold text-white">{currentList.name}</h1>
          <p className="text-sm text-slate-300">{currentList.description}</p>
        </div>
      </div>

      {/* Visual Memory Palace for this specific list */}
      <Dashboard
        algorithmMode={settings.algorithmMode}
        setAlgorithmMode={handleAlgorithmModeChange}
        generateChallenge={generateChallenge}
        history={history}
        itemRatings={itemRatings}
        timer={0} // Not used in the new design
        soundEnabled={settings.soundEnabled}
        setSoundEnabled={handleSoundToggle}
        selectedAlgorithm={selectedAlgorithm}
        trainingAlgorithms={trainingAlgorithms}
        onAlgorithmChange={handleAlgorithmChange}
        activeList={currentList}
        onPracticeSubject={handlePracticeSubject}
      />
    </div>
  )
}