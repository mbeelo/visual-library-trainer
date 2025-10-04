import { useNavigate } from 'react-router-dom'
import Dashboard from '../components/Dashboard'
import { useLocalStorage } from '../hooks'
import { HistoryEntry, ItemRatings, TrainingList } from '../types'
import { defaultList, communityLists, trainingAlgorithms } from '../data'
import { generateNextChallenge } from '../utils/challengeGeneration'

export function DashboardPage() {
  const navigate = useNavigate()

  const [history] = useLocalStorage<HistoryEntry[]>('vlt-history', [])
  const [itemRatings] = useLocalStorage<ItemRatings>('vlt-ratings', {})
  const [customLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [settings, setSettings] = useLocalStorage('vlt-settings', {
    algorithmMode: true,
    activeListId: defaultList.id,
    selectedAlgorithm: 'balanced',
    soundEnabled: true
  })

  const allLists = [defaultList, ...communityLists, ...customLists]
  const activeList = allLists.find(list => list.id === settings.activeListId) || defaultList
  const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0]

  const generateChallenge = () => {
    try {
      const challenge = generateNextChallenge(
        activeList,
        {
          algorithmMode: settings.algorithmMode,
          selectedAlgorithm: settings.selectedAlgorithm
        },
        itemRatings,
        history,
        trainingAlgorithms
      )

      navigate(`/app/practice/${encodeURIComponent(challenge.item)}?category=${encodeURIComponent(challenge.category)}`)
    } catch (error) {
      console.error('Error generating challenge:', error)
      // Fallback to random item from default list
      const categories = Object.keys(activeList.categories)
      const category = categories[Math.floor(Math.random() * categories.length)]
      const items = activeList.categories[category]
      const item = items[Math.floor(Math.random() * items.length)]
      navigate(`/app/practice/${encodeURIComponent(item)}?category=${encodeURIComponent(category)}`)
    }
  }

  const setAlgorithmMode = (mode: boolean) => {
    setSettings(prev => ({ ...prev, algorithmMode: mode }))
  }

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }))
  }

  const setSelectedAlgorithm = (algorithmId: string) => {
    setSettings(prev => ({ ...prev, selectedAlgorithm: algorithmId }))
  }

  return (
    <Dashboard
      algorithmMode={settings.algorithmMode}
      setAlgorithmMode={setAlgorithmMode}
      generateChallenge={generateChallenge}
      history={history}
      itemRatings={itemRatings}
      timer={0}
      soundEnabled={settings.soundEnabled}
      setSoundEnabled={setSoundEnabled}
      selectedAlgorithm={selectedAlgorithm}
      trainingAlgorithms={trainingAlgorithms}
      onAlgorithmChange={(algorithm: any) => setSelectedAlgorithm(algorithm.id)}
    />
  )
}