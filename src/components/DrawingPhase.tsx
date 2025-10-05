import { Clock, Eye, Volume2, Timer, TrendingUp, Play, Pause, RefreshCw } from 'lucide-react';
import { formatTime } from '../utils';
import { useEffect, useRef, useState } from 'react';

interface DrawingPhaseProps {
  currentItem: string;
  currentCategory: string;
  timer: number;
  targetDuration: number;
  isTimerRunning?: boolean;
  soundEnabled?: boolean;
  onShowReferences: () => void;
  onStartTimer?: (duration?: number) => void;
  onStopTimer?: () => void;
}

export default function DrawingPhase({
  currentItem,
  currentCategory,
  timer,
  targetDuration,
  isTimerRunning = false,
  soundEnabled = true,
  onShowReferences,
  onStartTimer,
  onStopTimer
}: DrawingPhaseProps) {
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const progress = targetDuration > 0 ? Math.min((timer / targetDuration) * 100, 100) : 0;
  const isTimeUp = targetDuration > 0 && timer >= targetDuration;
  const timeRemaining = targetDuration > 0 ? Math.max(0, targetDuration - timer) : 0;
  const lastTimeUpRef = useRef(false);
  const lastWarningRef = useRef(false);

  // Warning at 75% completion
  const isWarning = progress >= 75 && progress < 100;

  // Play sound notifications
  useEffect(() => {
    if (!soundEnabled) return;

    // Time up notification
    if (isTimeUp && !lastTimeUpRef.current) {
      playNotificationSound('timeup');
      lastTimeUpRef.current = true;
    }

    // Warning notification at 75%
    if (isWarning && !lastWarningRef.current && targetDuration > 0) {
      playNotificationSound('warning');
      lastWarningRef.current = true;
    }

    // Reset flags when timer resets
    if (timer === 0) {
      lastTimeUpRef.current = false;
      lastWarningRef.current = false;
    }
  }, [isTimeUp, isWarning, timer, soundEnabled, targetDuration]);

  const playNotificationSound = (type: 'warning' | 'timeup') => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === 'warning') {
        // Higher pitch double beep for warning
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);

        // Second beep
        setTimeout(() => {
          const osc2 = audioContext.createOscillator();
          const gain2 = audioContext.createGain();
          osc2.connect(gain2);
          gain2.connect(audioContext.destination);
          osc2.frequency.setValueAtTime(800, audioContext.currentTime);
          gain2.gain.setValueAtTime(0, audioContext.currentTime);
          gain2.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.01);
          gain2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
          osc2.start(audioContext.currentTime);
          osc2.stop(audioContext.currentTime + 0.1);
        }, 150);
      } else {
        // Lower pitch sustained tone for time up
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContext.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      }
    } catch (error) {
      console.warn('Audio notification failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8 relative">
        <div className="absolute top-4 right-4">
          <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border border-orange-400 text-orange-400 bg-transparent">
            {currentCategory}
          </div>
        </div>
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Draw <span className="text-orange-400">{currentItem}</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Trust your mind's eye first. Focus on the key shapes, proportions, and details you remember.
          </p>
        </div>
      </div>

      {/* Timer Section */}
      {targetDuration > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Display */}
          <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                isTimeUp ? 'bg-red-500/20 border border-red-500/20' : isWarning ? 'bg-orange-500/20 border border-orange-500/20' : 'bg-orange-400'
              }`}>
                <Timer className={`w-5 h-5 ${
                  isTimeUp ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-slate-900'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Time Remaining</h3>
                <p className="text-sm text-slate-300">
                  {isTimeUp ? 'Time is up!' : isWarning ? 'Almost finished' : 'Keep drawing'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className={`text-5xl font-bold mb-4 ${
                isTimeUp ? 'text-red-400' : isWarning ? 'text-orange-400' : 'text-white'
              }`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Sound Alert Indicator */}
              {soundEnabled && (isTimeUp || isWarning) && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Volume2 className={`w-5 h-5 ${isTimeUp ? 'text-red-500' : 'text-orange-500'}`} />
                  <span className={`text-sm font-medium ${isTimeUp ? 'text-red-400' : 'text-orange-400'}`}>
                    {isTimeUp ? 'Time up alert' : 'Warning alert'}
                  </span>
                </div>
              )}

              {/* Timer Controls */}
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => onStartTimer?.()}
                  className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg hover:shadow-orange-500/25"
                >
                  {isTimerRunning ? (
                    <>
                      <Pause className="w-4 h-4" />
                      Pause Timer
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      Resume Timer
                    </>
                  )}
                </button>
                {onStopTimer && (
                  <button
                    onClick={() => {
                      onStopTimer()
                      setSelectedDuration(null) // Reset duration selection
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 border border-red-500"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Stop & Reset
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-slate-900" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Progress</h3>
                <p className="text-sm text-slate-300">{Math.round(progress)}% complete</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="w-full bg-slate-600 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isTimeUp ? 'bg-red-400' : isWarning ? 'bg-orange-400' : 'bg-gradient-to-r from-orange-400 to-amber-500'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(progress)}%</div>
                  <div className="text-xs text-slate-300">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatTime(timer)}</div>
                  <div className="text-xs text-slate-300">Elapsed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{formatTime(targetDuration)}</div>
                  <div className="text-xs text-slate-300">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Drawing Timer</h3>
              <p className="text-sm text-slate-300">Set a drawing time or practice unlimited</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-white mb-4">{formatTime(timer)}</div>
            <p className="text-slate-300 mb-4">Time spent drawing</p>

            {/* Timer Duration Selector - Only show when timer hasn't been started */}
            {timer === 0 && targetDuration === 0 && (
              <div className="mb-6">
                <p className="text-sm text-slate-300 mb-3">Choose drawing duration:</p>
                <div className="flex justify-center gap-2 flex-wrap">
                  {[
                    { minutes: 0.5, label: '30 sec', seconds: 30 },
                    { minutes: 1, label: '1 min', seconds: 60 },
                    { minutes: 5, label: '5 min', seconds: 300 },
                    { minutes: 10, label: '10 min', seconds: 600 },
                    { minutes: 20, label: '20 min', seconds: 1200 }
                  ].map((duration) => (
                    <button
                      key={duration.minutes}
                      onClick={() => setSelectedDuration(duration.seconds)}
                      className={`font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-105 border text-sm ${
                        selectedDuration === duration.seconds
                          ? 'bg-orange-400 text-slate-900 border-orange-400'
                          : 'bg-slate-700 hover:bg-slate-600 text-white border-slate-600'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-center gap-3">
              <button
                onClick={() => onStartTimer?.(selectedDuration || undefined)}
                disabled={timer === 0 && targetDuration === 0 && !selectedDuration}
                className={`font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg ${
                  timer === 0 && targetDuration === 0 && !selectedDuration
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-orange-400 hover:bg-orange-500 text-slate-900 hover:shadow-orange-500/25'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pause Timer
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    {timer > 0 ? 'Resume Timer' : 'Start Drawing Timer'}
                  </>
                )}
              </button>
              {onStopTimer && timer > 0 && (
                <button
                  onClick={() => {
                    onStopTimer()
                    setSelectedDuration(null) // Reset duration selection
                  }}
                  className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-6 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 border border-red-500"
                >
                  <RefreshCw className="w-5 h-5" />
                  Stop & Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onShowReferences}
          className={`font-medium py-4 px-8 rounded-lg transition-all inline-flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 ${
            isTimeUp
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse hover:shadow-red-500/25'
              : 'bg-orange-400 hover:bg-orange-500 text-slate-900 hover:shadow-orange-500/25'
          }`}
        >
          <Eye className="w-5 h-5" />
          <span className="text-lg">
            {isTimeUp ? 'Time\'s Up - Show References' : 'Finished Drawing - Show References'}
          </span>
        </button>
      </div>
    </div>
  );
}