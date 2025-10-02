import { useState, useEffect } from 'react';
import { defaultList, timerPresets, trainingAlgorithms, communityLists } from './data';
import { useLocalStorage } from './hooks';
import { HistoryEntry, ItemRatings, AppSettings, Rating, Phase, TrainingList, TimerPreset } from './types';
import {
  Welcome,
  Header,
  ListBrowser,
  ListCreator,
  Dashboard,
  SessionSetup,
  DrawingPhase,
  ReferencePhase,
  CompletePhase,
  Toast
} from './components';
import { AuthProvider } from './contexts/AuthContext';
import { AuthModal } from './components/AuthModal';
import { UpgradeModal } from './components/UpgradeModal';
import { MigrationPrompt } from './components/MigrationPrompt';

export default function ArtMemoryTrainer() {
  const [phase, setPhase] = useState<Phase>('welcome');
  const [currentItem, setCurrentItem] = useState<string | null>(null);
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [timer, setTimer] = useState(0);
  const [targetDuration, setTargetDuration] = useState(0); // 0 means no timer
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showListBrowser, setShowListBrowser] = useState(false);
  const [showListCreator, setShowListCreator] = useState(false);

  // Auth modal state
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    mode: 'signin' | 'signup';
  }>({ isOpen: false, mode: 'signin' });

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  // Persisted state
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('vlt-history', []);
  const [itemRatings, setItemRatings] = useLocalStorage<ItemRatings>('vlt-ratings', {});
  const [customLists, setCustomLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', []);
  const [settings, setSettings] = useLocalStorage<AppSettings>('vlt-settings', {
    algorithmMode: true,
    activeListId: defaultList.id,
    defaultTimerDuration: 300, // 5 minutes
    selectedAlgorithm: 'balanced',
    soundEnabled: true,
    autoAdvance: false
  });

  // Session setup state - initialized after settings
  const [selectedTimerPreset, setSelectedTimerPreset] = useState<TimerPreset>(
    () => timerPresets.find(p => p.duration === settings.defaultTimerDuration) || timerPresets[3]
  );

  // Derived state
  const algorithmMode = settings.algorithmMode;
  const setAlgorithmMode = (mode: boolean) => {
    setSettings(prev => ({ ...prev, algorithmMode: mode }));
  };

  const setSoundEnabled = (enabled: boolean) => {
    setSettings(prev => ({ ...prev, soundEnabled: enabled }));
  };

  const setSelectedAlgorithm = (algorithmId: string) => {
    setSettings(prev => ({ ...prev, selectedAlgorithm: algorithmId }));
  };

  const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0];

  // Get all available lists (default + community + custom)
  const allLists = [defaultList, ...communityLists, ...customLists];
  const activeList = allLists.find(list => list.id === settings.activeListId) || defaultList;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const setActiveList = (list: TrainingList) => {
    setSettings(prev => ({ ...prev, activeListId: list.id }));
    showToast(`Switched to "${list.name}"`, 'success');
    setShowListBrowser(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const generateChallenge = () => {
    const selectedAlgorithm = trainingAlgorithms.find(alg => alg.id === settings.selectedAlgorithm) || trainingAlgorithms[0];

    if (!algorithmMode || selectedAlgorithm.id === 'random') {
      // Pure random selection
      const categories = Object.keys(activeList.categories);
      const category = categories[Math.floor(Math.random() * categories.length)];
      const items = activeList.categories[category];
      const item = items[Math.floor(Math.random() * items.length)];

      setCurrentItem(item);
      setCurrentCategory(category);
      setPhase('session-setup');
      return;
    }

    // Smart algorithm selection
    const allItems: Array<{item: string, category: string, score: number}> = [];

    // Calculate scores for all items
    for (const [categoryName, items] of Object.entries(activeList.categories)) {
      for (const itemName of items) {
        let score = 1; // Base score

        // Apply struggling weight
        const rating = itemRatings[itemName];
        if (rating === 'failed' || rating === 'struggled') {
          score += selectedAlgorithm.strugglingWeight * 2;
        } else if (rating === 'easy') {
          score -= selectedAlgorithm.strugglingWeight * 0.5;
        }

        // Apply recent practice weight (items practiced recently get lower scores)
        const recentPractice = history
          .filter(h => h.item === itemName)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

        if (recentPractice) {
          const daysSince = (Date.now() - new Date(recentPractice.date).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSince < 1) {
            score -= selectedAlgorithm.recentWeight * 1.5;
          } else if (daysSince < 3) {
            score -= selectedAlgorithm.recentWeight * 0.8;
          }
        } else {
          // Never practiced - boost score
          score += 0.5;
        }

        // Spaced repetition logic
        if (selectedAlgorithm.spacedRepetition && rating && recentPractice) {
          const daysSince = (Date.now() - new Date(recentPractice.date).getTime()) / (1000 * 60 * 60 * 24);
          const targetInterval = rating === 'failed' ? 0.5 : rating === 'struggled' ? 1 : rating === 'got-it' ? 3 : 7;

          if (daysSince >= targetInterval) {
            score += 1; // Ready for review
          } else {
            score -= 0.5; // Not ready yet
          }
        }

        allItems.push({ item: itemName, category: categoryName, score: Math.max(0.1, score) });
      }
    }

    // Category balancing
    if (selectedAlgorithm.categoryBalance) {
      const categoryCount: Record<string, number> = {};
      history.slice(-20).forEach(h => {
        categoryCount[h.category] = (categoryCount[h.category] || 0) + 1;
      });

      allItems.forEach(item => {
        const recentCount = categoryCount[item.category] || 0;
        if (recentCount > 3) {
          item.score *= 0.7; // Reduce score for over-practiced categories
        }
      });
    }

    // Weighted random selection
    const totalScore = allItems.reduce((sum, item) => sum + item.score, 0);
    let randomValue = Math.random() * totalScore;

    for (const item of allItems) {
      randomValue -= item.score;
      if (randomValue <= 0) {
        setCurrentItem(item.item);
        setCurrentCategory(item.category);
        setPhase('session-setup');
        return;
      }
    }

    // Fallback to random if algorithm fails
    const categories = Object.keys(activeList.categories);
    const category = categories[Math.floor(Math.random() * categories.length)];
    const items = activeList.categories[category];
    const item = items[Math.floor(Math.random() * items.length)];

    setCurrentItem(item);
    setCurrentCategory(category);
    setPhase('session-setup');
  };

  const showReferences = () => {
    setPhase('reference');
    setIsTimerRunning(false);
  };

  const completeWithRating = (rating: Rating) => {
    if (!currentItem || !currentCategory) return;

    setItemRatings(prev => ({ ...prev, [currentItem]: rating }));
    setHistory(prev => [...prev, {
      item: currentItem,
      category: currentCategory,
      time: timer,
      rating,
      date: new Date()
    }]);
    setPhase('complete');
    setIsTimerRunning(false);
  };


  const startPractice = () => {
    setPhase('dashboard');
  };

  const navigateHome = () => {
    setPhase('dashboard');
    setShowListBrowser(false);
    setShowListCreator(false);
  };

  const handleCreateList = (newList: TrainingList) => {
    try {
      setCustomLists(prev => [...prev, newList]);
      setSettings(prev => ({ ...prev, activeListId: newList.id }));
      showToast(`Created and activated "${newList.name}"`, 'success');
      setShowListCreator(false);
    } catch (error) {
      showToast('Failed to create list. Please try again.', 'error');
    }
  };

  const startSession = () => {
    setTargetDuration(selectedTimerPreset.duration);
    setTimer(0);
    setPhase('drawing');
    if (selectedTimerPreset.duration > 0) {
      setIsTimerRunning(true);
    }

    // Save preferences
    setSettings(prev => ({
      ...prev,
      defaultTimerDuration: selectedTimerPreset.duration
    }));
  };

  const handleTimerPresetChange = (preset: TimerPreset) => {
    setSelectedTimerPreset(preset);
  };

  // Check for auth URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const authParam = urlParams.get('auth');
    if (authParam === 'signin' || authParam === 'signup') {
      setAuthModal({ isOpen: true, mode: authParam });
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);


  if (phase === 'welcome') {
    return (
      <AuthProvider>
        <Welcome onStartPractice={startPractice} />
        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          mode={authModal.mode}
        />
      </AuthProvider>
    );
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <Header
          activeList={activeList}
          allLists={allLists}
          onSetActiveList={setActiveList}
          showListBrowser={showListBrowser}
          setShowListBrowser={setShowListBrowser}
          showListCreator={showListCreator}
          setShowListCreator={setShowListCreator}
          onNavigateHome={navigateHome}
          onShowAuth={(mode) => setAuthModal({ isOpen: true, mode })}
        />

        <ListBrowser
          show={showListBrowser}
          onUseList={setActiveList}
          currentListId={settings.activeListId}
          customLists={customLists}
        />
        <ListCreator
          show={showListCreator}
          onCreateList={handleCreateList}
          onClose={() => setShowListCreator(false)}
        />

        {phase === 'session-setup' && currentItem && currentCategory && (
          <SessionSetup
            currentItem={currentItem}
            currentCategory={currentCategory}
            selectedPreset={selectedTimerPreset}
            onPresetChange={handleTimerPresetChange}
            onStartSession={startSession}
            onBack={() => setPhase('dashboard')}
          />
        )}

        {phase === 'dashboard' && (
          <Dashboard
            algorithmMode={algorithmMode}
            setAlgorithmMode={setAlgorithmMode}
            generateChallenge={generateChallenge}
            history={history}
            itemRatings={itemRatings}
            timer={timer}
            soundEnabled={settings.soundEnabled}
            setSoundEnabled={setSoundEnabled}
            selectedAlgorithm={selectedAlgorithm}
            trainingAlgorithms={trainingAlgorithms}
            onAlgorithmChange={(algorithm) => setSelectedAlgorithm(algorithm.id)}
          />
        )}

        {phase === 'drawing' && currentItem && currentCategory && (
          <DrawingPhase
            currentItem={currentItem}
            currentCategory={currentCategory}
            timer={timer}
            targetDuration={targetDuration}
            soundEnabled={settings.soundEnabled}
            onShowReferences={showReferences}
          />
        )}

        {phase === 'reference' && (
          <ReferencePhase
            currentItem={currentItem}
            currentCategory={currentCategory}
            timer={timer}
            onCompleteWithRating={completeWithRating}
            onShowUpgrade={() => setShowUpgradeModal(true)}
          />
        )}

        {phase === 'complete' && (
          <CompletePhase
            currentItem={currentItem}
            timer={timer}
            onGenerateChallenge={generateChallenge}
            onBackToDashboard={() => setPhase('dashboard')}
          />
        )}

        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />

        <AuthModal
          isOpen={authModal.isOpen}
          onClose={() => setAuthModal({ ...authModal, isOpen: false })}
          mode={authModal.mode}
        />

        <UpgradeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
        />

        <MigrationPrompt
          onComplete={() => {
            // Migration completed or skipped
            console.log('Migration process completed')
          }}
        />

        {/* Footer */}
        <footer className="mt-16 text-center">
          <div className="text-gray-500 text-sm font-medium">
            <a
              href="https://behelo.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gray-700 transition-colors duration-200"
            >
              behelo.com
            </a>
          </div>
        </footer>
      </div>
    </div>
    </AuthProvider>
  );
}