import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import DrawingPhase from '../components/DrawingPhase'
import ReferencePhase from '../components/ReferencePhase'
import { timerPresets, defaultList, communityLists, trainingAlgorithms } from '../data'
import { useLocalStorage } from '../hooks'
import { HistoryEntry, ItemRatings, TimerPreset, TrainingList } from '../types'
import { useModal } from '../contexts/ModalContext'
import { generateNextChallenge } from '../utils/challengeGeneration'
import { ProgressTrackingService } from '../services/progressTracking'

export function PracticePage() {
  const { subject } = useParams<{ subject: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showAuthModal, showUpgradeModal } = useModal()

  const category = searchParams.get('category')
  const phase = searchParams.get('phase') || 'drawing' // Auto-start with drawing

  const [timer, setTimer] = useState(0)
  const [targetDuration, setTargetDuration] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Reference timer state
  const [referenceTimer, setReferenceTimer] = useState(0)
  const [targetReferenceDuration, setTargetReferenceDuration] = useState(0)
  const [isReferenceTimerRunning, setIsReferenceTimerRunning] = useState(false)

  // Persisted state
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('vlt-history', [])
  const [itemRatings, setItemRatings] = useLocalStorage<ItemRatings>('vlt-ratings', {})
  const [customLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [settings, setSettings] = useLocalStorage('vlt-settings', {
    defaultTimerDuration: 300,
    soundEnabled: true,
    algorithmMode: true,
    activeListId: defaultList.id,
    selectedAlgorithm: 'struggling-focus'
  })

  // Get active training list
  const allLists = [defaultList, ...communityLists, ...customLists]
  const activeList = allLists.find(list => list.id === settings.activeListId) || defaultList

  const [selectedTimerPreset] = useState<TimerPreset>(
    () => timerPresets.find(p => p.duration === settings.defaultTimerDuration) || timerPresets[3]
  )

  const currentItem = subject ? decodeURIComponent(subject) : null
  const currentCategory = category ? decodeURIComponent(category) : null

  // No auto-start timer - users will manually start with their chosen duration

  // Timer effects
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isReferenceTimerRunning) {
      interval = setInterval(() => setReferenceTimer(t => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [isReferenceTimerRunning])

  const updatePhase = (newPhase: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('phase', newPhase)
    navigate(`/app/practice/${subject}?${params.toString()}`, { replace: true })
  }

  const showReferences = () => {
    updatePhase('references')
    setIsTimerRunning(false)
    setReferenceTimer(0)
    setIsReferenceTimerRunning(false)
    setTargetReferenceDuration(0)
  }


  const startReferenceTimer = (duration?: number) => {
    if (targetReferenceDuration === 0) {
      // First start - set target and begin
      const targetDuration = duration || 300 // Default to 5 minutes if no duration provided
      setTargetReferenceDuration(targetDuration)
      setReferenceTimer(0)
      setIsReferenceTimerRunning(true)
    } else {
      // Toggle play/pause
      setIsReferenceTimerRunning(!isReferenceTimerRunning)
    }
  }

  const stopReferenceTimer = () => {
    // True stop - reset everything
    setIsReferenceTimerRunning(false)
    setReferenceTimer(0)
    setTargetReferenceDuration(0)
  }

  const startDrawingTimer = (duration?: number) => {
    if (targetDuration === 0) {
      // First start - set target and begin
      const targetDrawingDuration = duration || 300 // Default to 5 minutes if no duration provided
      setTargetDuration(targetDrawingDuration)
      setTimer(0)
      setIsTimerRunning(true)
    } else {
      // Toggle play/pause
      setIsTimerRunning(!isTimerRunning)
    }
  }

  const stopDrawingTimer = () => {
    // True stop - reset everything
    setIsTimerRunning(false)
    setTimer(0)
    setTargetDuration(0)
  }

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

      // Navigate to the new challenge
      navigate(`/app/practice/${encodeURIComponent(challenge.item)}?category=${encodeURIComponent(challenge.category)}`)
    } catch (error) {
      console.error('Error generating challenge:', error)
      // Fallback to dashboard
      navigate('/app/dashboard')
    }
  }

  if (!currentItem || !currentCategory) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-white mb-4">Subject not found</h1>
        <button
          onClick={() => navigate('/app/dashboard')}
          className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium py-2 px-4 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      {phase === 'drawing' && (
        <DrawingPhase
          currentItem={currentItem}
          currentCategory={currentCategory}
          timer={timer}
          targetDuration={targetDuration}
          isTimerRunning={isTimerRunning}
          soundEnabled={settings.soundEnabled}
          onShowReferences={showReferences}
          onStartTimer={startDrawingTimer}
          onStopTimer={stopDrawingTimer}
        />
      )}

      {phase === 'references' && (
        <ReferencePhase
          currentItem={currentItem}
          currentCategory={currentCategory}
          timer={timer}
          onCompleteWithRating={(rating) => {
            // Save the rating but don't auto-advance
            if (!currentItem || !currentCategory) return

            const newEntry = {
              item: currentItem,
              subject: currentItem,
              category: currentCategory,
              time: timer,
              rating,
              date: new Date()
            }

            // Update history and ratings
            setItemRatings(prev => ({ ...prev, [currentItem]: rating }))
            setHistory(prev => {
              const newHistory = [...prev, newEntry]

              // Update streak and progress tracking
              ProgressTrackingService.updateStreak()
              ProgressTrackingService.updateProgressStats(timer, newHistory, { ...itemRatings, [currentItem]: rating })

              return newHistory
            })
          }}
          onRepeatItem={() => {
            // Reset and go back to drawing phase
            setTimer(0)
            setTargetDuration(0)
            setReferenceTimer(0)
            setIsTimerRunning(false)
            setIsReferenceTimerRunning(false)
            setTargetReferenceDuration(0)
            updatePhase('drawing')
          }}
          onNextItem={generateChallenge}
          onBackToHub={() => navigate('/app/dashboard')}
          onShowUpgrade={showUpgradeModal}
          onShowAuth={showAuthModal}
          referenceTimer={referenceTimer}
          targetReferenceDuration={targetReferenceDuration}
          isReferenceTimerRunning={isReferenceTimerRunning}
          onStartReferenceTimer={startReferenceTimer}
          onStopReferenceTimer={stopReferenceTimer}
        />
      )}
    </>
  )
}