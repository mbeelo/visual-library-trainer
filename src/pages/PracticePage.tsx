import { useState, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import SessionSetup from '../components/SessionSetup'
import DrawingPhase from '../components/DrawingPhase'
import ReferencePhase from '../components/ReferencePhase'
import CompletePhase from '../components/CompletePhase'
import { timerPresets } from '../data'
import { useLocalStorage } from '../hooks'
import { HistoryEntry, ItemRatings, Rating, TimerPreset } from '../types'
import { useModal } from '../contexts/ModalContext'

export function PracticePage() {
  const { subject } = useParams<{ subject: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { showAuthModal, showUpgradeModal } = useModal()

  const category = searchParams.get('category')
  const phase = searchParams.get('phase') || 'setup'

  const [timer, setTimer] = useState(0)
  const [targetDuration, setTargetDuration] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Reference timer state
  const [referenceTimer, setReferenceTimer] = useState(0)
  const [targetReferenceDuration, setTargetReferenceDuration] = useState(0)
  const [isReferenceTimerRunning, setIsReferenceTimerRunning] = useState(false)

  // Persisted state
  const [, setHistory] = useLocalStorage<HistoryEntry[]>('vlt-history', [])
  const [, setItemRatings] = useLocalStorage<ItemRatings>('vlt-ratings', {})
  const [settings] = useLocalStorage('vlt-settings', {
    defaultTimerDuration: 300,
    soundEnabled: true
  })

  const [selectedTimerPreset, setSelectedTimerPreset] = useState<TimerPreset>(
    () => timerPresets.find(p => p.duration === settings.defaultTimerDuration) || timerPresets[3]
  )

  const currentItem = subject ? decodeURIComponent(subject) : null
  const currentCategory = category ? decodeURIComponent(category) : null

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
    navigate(`/practice/${subject}?${params.toString()}`, { replace: true })
  }

  const startSession = () => {
    setTargetDuration(selectedTimerPreset.duration)
    setTimer(0)
    updatePhase('drawing')
    if (selectedTimerPreset.duration > 0) {
      setIsTimerRunning(true)
    }
  }

  const showReferences = () => {
    updatePhase('references')
    setIsTimerRunning(false)
    setReferenceTimer(0)
    setIsReferenceTimerRunning(false)
    setTargetReferenceDuration(0)
  }

  const completeWithRating = (rating: Rating) => {
    if (!currentItem || !currentCategory) return

    setItemRatings(prev => ({ ...prev, [currentItem]: rating }))
    setHistory(prev => [...prev, {
      item: currentItem,
      category: currentCategory,
      time: timer,
      rating,
      date: new Date()
    }])
    updatePhase('complete')
    setIsTimerRunning(false)
    setIsReferenceTimerRunning(false)
  }

  const practiceSameSubject = () => {
    setTimer(0)
    setReferenceTimer(0)
    setIsTimerRunning(false)
    setIsReferenceTimerRunning(false)
    setTargetReferenceDuration(0)
    updatePhase('setup')
  }

  const startReferenceTimer = () => {
    setTargetReferenceDuration(300)
    setReferenceTimer(0)
    setIsReferenceTimerRunning(true)
  }

  const stopReferenceTimer = () => {
    setIsReferenceTimerRunning(false)
  }

  if (!currentItem || !currentCategory) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Subject not found</h1>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg"
        >
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <>
      {phase === 'setup' && (
        <SessionSetup
          currentItem={currentItem}
          currentCategory={currentCategory}
          selectedPreset={selectedTimerPreset}
          onPresetChange={setSelectedTimerPreset}
          onStartSession={startSession}
          onBack={() => navigate('/dashboard')}
        />
      )}

      {phase === 'drawing' && (
        <DrawingPhase
          currentItem={currentItem}
          currentCategory={currentCategory}
          timer={timer}
          targetDuration={targetDuration}
          soundEnabled={settings.soundEnabled}
          onShowReferences={showReferences}
        />
      )}

      {phase === 'references' && (
        <ReferencePhase
          currentItem={currentItem}
          currentCategory={currentCategory}
          timer={timer}
          onCompleteWithRating={completeWithRating}
          onShowUpgrade={showUpgradeModal}
          onShowAuth={showAuthModal}
          referenceTimer={referenceTimer}
          targetReferenceDuration={targetReferenceDuration}
          onStartReferenceTimer={startReferenceTimer}
          onStopReferenceTimer={stopReferenceTimer}
        />
      )}

      {phase === 'complete' && (
        <CompletePhase
          currentItem={currentItem}
          timer={timer}
          onGenerateChallenge={() => navigate('/dashboard')}
          onBackToDashboard={() => navigate('/dashboard')}
          onPracticeSameSubject={practiceSameSubject}
        />
      )}
    </>
  )
}