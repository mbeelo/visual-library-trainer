import { VisualLibraryHub } from '../components/VisualLibraryHub'
import { useLocalStorage } from '../hooks'
import { HistoryEntry, ItemRatings, TrainingList, TrainingAlgorithm } from '../types'
import { defaultList, communityLists, trainingAlgorithms } from '../data'

export function DashboardPage() {
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
  const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0]

  const handleSelectList = (list: TrainingList) => {
    setSettings(prev => ({ ...prev, activeListId: list.id }))
  }

  const handleAlgorithmModeChange = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, algorithmMode: enabled }))
  }

  const handleAlgorithmChange = (algorithm: TrainingAlgorithm) => {
    setSettings(prev => ({ ...prev, selectedAlgorithm: algorithm.id }))
  }

  return (
    <VisualLibraryHub
      allLists={allLists}
      history={history}
      itemRatings={itemRatings}
      onSelectList={handleSelectList}
      algorithmMode={settings.algorithmMode}
      selectedAlgorithm={selectedAlgorithm}
      trainingAlgorithms={trainingAlgorithms}
      onAlgorithmModeChange={handleAlgorithmModeChange}
      onAlgorithmChange={handleAlgorithmChange}
    />
  )
}