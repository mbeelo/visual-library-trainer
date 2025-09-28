import { Clock, Eye, Volume2, Palette, Timer, TrendingUp } from 'lucide-react';
import { formatTime } from '../utils';
import { useEffect, useRef } from 'react';

interface DrawingPhaseProps {
  currentItem: string;
  currentCategory: string;
  timer: number;
  targetDuration: number;
  soundEnabled?: boolean;
  onShowReferences: () => void;
}

export default function DrawingPhase({
  currentItem,
  currentCategory,
  timer,
  targetDuration,
  soundEnabled = true,
  onShowReferences
}: DrawingPhaseProps) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Practice Session</h1>
          <p className="text-sm text-gray-600 mt-1">Draw from memory, then compare with references</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50">
          <span className="text-sm font-medium text-blue-700">{currentCategory}</span>
        </div>
      </div>

      {/* Subject Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-8 shadow-sm text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            <Palette className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Drawing Subject</h2>
            <p className="text-sm text-gray-600">Draw from memory</p>
          </div>
        </div>

        <h3 className="text-4xl font-bold text-gray-900 mb-4">{currentItem}</h3>
        <p className="text-gray-600 mb-8">Focus on the key shapes, proportions, and details you remember</p>
      </div>

      {/* Timer Section */}
      {targetDuration > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Display */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isTimeUp ? 'bg-red-50' : isWarning ? 'bg-orange-50' : 'bg-purple-50'
              }`}>
                <Timer className={`w-6 h-6 ${
                  isTimeUp ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-purple-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Time Remaining</h3>
                <p className="text-sm text-gray-600">
                  {isTimeUp ? 'Time is up!' : isWarning ? 'Almost finished' : 'Keep drawing'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className={`text-5xl font-bold mb-4 ${
                isTimeUp ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {formatTime(timeRemaining)}
              </div>

              {/* Sound Alert Indicator */}
              {soundEnabled && (isTimeUp || isWarning) && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Volume2 className={`w-5 h-5 ${isTimeUp ? 'text-red-500' : 'text-orange-500'}`} />
                  <span className={`text-sm font-medium ${isTimeUp ? 'text-red-600' : 'text-orange-600'}`}>
                    {isTimeUp ? 'Time up alert' : 'Warning alert'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Progress</h3>
                <p className="text-sm text-gray-600">{Math.round(progress)}% complete</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isTimeUp ? 'bg-red-500' : isWarning ? 'bg-orange-500' : 'bg-blue-600'
                  }`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(progress)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatTime(timer)}</div>
                  <div className="text-xs text-gray-500">Elapsed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatTime(targetDuration)}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">No Time Limit</h3>
              <p className="text-sm text-gray-600">Take your time and draw at your own pace</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-2">{formatTime(timer)}</div>
            <p className="text-gray-600">Time spent drawing</p>
          </div>
        </div>
      )}

      {/* Action Button */}
      <div className="flex justify-center">
        <button
          onClick={onShowReferences}
          className={`font-medium py-4 px-8 rounded-lg transition-all inline-flex items-center gap-3 shadow-sm ${
            isTimeUp
              ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
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