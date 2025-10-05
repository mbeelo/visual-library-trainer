import { LogOut, Flame, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TrainingList } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { ProgressTrackingService } from '../services/progressTracking';
import { useState, useEffect } from 'react';

interface HeaderProps {
  activeList: TrainingList;
  allLists: TrainingList[];
  onSetActiveList: (list: TrainingList) => void;
  onNavigateHome?: () => void;
  onShowAuth?: (mode: 'signin' | 'signup') => void;
}

export default function Header({
  activeList,
  allLists,
  onSetActiveList,
  onNavigateHome,
  onShowAuth
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut, subscriptionTier } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    const streakData = ProgressTrackingService.getStreakData();
    setCurrentStreak(streakData.currentStreak);
  }, []);
  return (
    <header className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onNavigateHome}
            className="hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="flex items-center gap-3 animate-pulse [animation-duration:3s]">
              <div className="w-6 h-6 bg-orange-400 rounded-lg flex items-center justify-center">
                <Eye className="w-4 h-4 text-slate-900" />
              </div>
              <span className="text-2xl font-bold text-orange-400">
                AfterImage
              </span>
            </div>
          </button>

          {/* Training List Selector */}
          <select
            className="px-2 py-1 border border-orange-400 text-orange-400 bg-transparent rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition-colors"
            value={activeList.id}
            onChange={(e) => {
              const selectedList = allLists.find(list => list.id === e.target.value);
              if (selectedList) {
                onSetActiveList(selectedList);
              }
            }}
          >
            {allLists.map(list => (
              <option key={list.id} value={list.id} className="bg-slate-800 text-white">
                {list.name}
              </option>
            ))}
          </select>

          {/* Streak Indicator */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 border border-orange-400 text-orange-400 bg-transparent rounded-lg text-xs font-medium">
              <Flame className="w-4 h-4" />
              <span>{currentStreak}</span>
              <span>day streak</span>
            </div>
          )}
        </div>

        <div className="flex gap-3 items-center">
          {!user && onShowAuth && (
            <>
              <button
                onClick={() => onShowAuth('signin')}
                className="bg-slate-800 border border-orange-500/20 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => onShowAuth('signup')}
                className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Up
              </button>
            </>
          )}

          {user && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <button
                  onClick={() => navigate('/app/account')}
                  className="text-slate-300 hover:text-orange-400 transition-colors cursor-pointer"
                >
                  {user.email}
                </button>
                {subscriptionTier === 'pro' && (
                  <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
                    Pro
                  </span>
                )}
              </div>
              <button
                onClick={async () => {
                  await signOut()
                  onNavigateHome?.()
                }}
                className="bg-slate-800 border border-orange-500/20 hover:bg-slate-700 text-white font-medium py-2 px-3 rounded-lg transition-colors inline-flex items-center gap-2"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          )}

        </div>
      </div>
    </header>
  );
}