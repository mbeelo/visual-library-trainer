import { LogOut, Flame, Eye, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ProgressTrackingService } from '../services/progressTracking';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onNavigateHome?: () => void;
  onShowAuth?: (mode: 'signin' | 'signup') => void;
}

export default function Header({
  onNavigateHome,
  onShowAuth
}: HeaderProps) {
  const navigate = useNavigate();
  const { user, signOut, subscriptionTier } = useAuth();
  const [currentStreak, setCurrentStreak] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const streakData = ProgressTrackingService.getStreakData();
    setCurrentStreak(streakData.currentStreak);
  }, []);
  return (
    <header className="mb-8">
      {/* Desktop & Mobile Nav Bar */}
      <div className="flex justify-between items-center mb-4">
        {/* Logo - Always Visible */}
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

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          {/* Streak Indicator */}
          {currentStreak > 0 && (
            <div className="flex items-center gap-2 px-2 py-1 border border-orange-400 text-orange-400 bg-transparent rounded-lg text-xs font-medium">
              <Flame className="w-4 h-4" />
              <span>{currentStreak}</span>
              <span>day streak</span>
            </div>
          )}

          {/* Auth Buttons */}
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

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-orange-400 text-orange-400 hover:bg-orange-400/10 transition-colors"
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden mb-4">
          <div className="bg-slate-800 border border-orange-500/20 rounded-lg p-4 space-y-4">
            {/* Streak Indicator */}
            {currentStreak > 0 && (
              <div className="flex items-center justify-center gap-2 px-3 py-2 border border-orange-400 text-orange-400 bg-transparent rounded-lg text-sm font-medium">
                <Flame className="w-4 h-4" />
                <span>{currentStreak} day streak</span>
              </div>
            )}

            {/* Auth Buttons */}
            {!user && onShowAuth && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    onShowAuth('signin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-700 border border-orange-500/20 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onShowAuth('signup');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-3 rounded-lg transition-colors"
                >
                  Sign Up
                </button>
              </div>
            )}

            {user && (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    navigate('/app/account');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full text-center text-slate-300 hover:text-orange-400 transition-colors py-2 border border-slate-600 rounded-lg"
                >
                  {user.email}
                  {subscriptionTier === 'pro' && (
                    <span className="ml-2 bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-xs font-medium border border-orange-200">
                      Pro
                    </span>
                  )}
                </button>
                <button
                  onClick={async () => {
                    await signOut();
                    onNavigateHome?.();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-700 border border-orange-500/20 hover:bg-slate-600 text-white font-medium py-3 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}