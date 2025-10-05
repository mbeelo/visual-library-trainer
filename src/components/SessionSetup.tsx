import { Play, Clock, ArrowLeft, Timer, Settings } from 'lucide-react';
import { TimerPreset } from '../types';

interface SessionSetupProps {
  currentItem: string;
  currentCategory: string;
  selectedPreset: TimerPreset;
  onPresetChange: (preset: TimerPreset) => void;
  onStartSession: () => void;
  onBack: () => void;
}

export default function SessionSetup({
  currentItem,
  currentCategory,
  selectedPreset,
  onPresetChange,
  onStartSession,
  onBack
}: SessionSetupProps) {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-orange-400 rounded-xl flex items-center justify-center">
              <Settings className="w-8 h-8 text-slate-900" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white animate-fade-in">
                Session Setup
              </h1>
              <p className="text-orange-400 font-medium text-lg">Configure your practice session</p>
            </div>
          </div>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all transform hover:scale-105 border border-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Subject Card */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
            <Timer className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white">Practice Subject</h2>
            <p className="text-sm text-slate-300">Ready to draw from memory</p>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-50/10 border border-orange-500/20">
            <span className="text-sm font-medium text-orange-400">{currentCategory}</span>
          </div>
        </div>

        <div className="text-center py-8 border border-orange-500/20 rounded-lg bg-slate-700/30">
          <h3 className="text-3xl font-bold text-white mb-2">{currentItem}</h3>
          <p className="text-slate-300">Draw this subject from memory first, then study references</p>
        </div>
      </div>

      {/* Timer Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Settings */}
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Timer Settings</h3>
              <p className="text-sm text-slate-300">Set your practice duration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="180"
                step="1"
                value={Math.floor(selectedPreset.duration / 60)}
                onChange={(e) => {
                  const inputValue = e.target.value;

                  if (inputValue === '') {
                    const preset: TimerPreset = {
                      id: 'custom',
                      name: 'No limit',
                      duration: 0
                    };
                    onPresetChange(preset);
                    return;
                  }

                  const minutes = parseInt(inputValue);
                  if (isNaN(minutes) || minutes < 0) return;

                  const validMinutes = Math.min(minutes, 180);
                  const preset: TimerPreset = {
                    id: 'custom',
                    name: validMinutes === 0 ? 'No limit' : `${validMinutes} min${validMinutes > 1 ? 's' : ''}`,
                    duration: validMinutes * 60
                  };
                  onPresetChange(preset);
                }}
                className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                placeholder="5"
              />
              <p className="text-xs text-slate-300 mt-2">
                Set to 0 for no time limit • Max: 180 minutes
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-white mb-3">Quick Presets</p>
              <div className="grid grid-cols-3 gap-2">
                {[1, 5, 15, 30, 60, 90].map(minutes => (
                  <button
                    key={minutes}
                    onClick={() => {
                      const preset: TimerPreset = {
                        id: `quick-${minutes}`,
                        name: `${minutes} min${minutes > 1 ? 's' : ''}`,
                        duration: minutes * 60
                      };
                      onPresetChange(preset);
                    }}
                    className="px-3 py-2 text-sm font-medium bg-slate-700 hover:bg-orange-400 text-white hover:text-slate-900 rounded-lg transition-all transform hover:scale-105 border border-slate-600 hover:border-orange-400"
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
              <Timer className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Session Summary</h3>
              <p className="text-sm text-slate-300">Review your setup</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-sm text-slate-300">Subject</span>
              <span className="font-medium text-white">{currentItem}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-slate-600">
              <span className="text-sm text-slate-300">Category</span>
              <span className="font-medium text-white">{currentCategory}</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-slate-300">Duration</span>
              <span className="font-medium text-white">
                {selectedPreset.duration === 0 ? 'No limit' : selectedPreset.name}
              </span>
            </div>

            <div className="mt-6 p-4 bg-orange-50/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-sm font-medium text-orange-400">Ready to practice</span>
              </div>
              <p className="text-sm text-slate-300 mt-1">
                {selectedPreset.duration === 0
                  ? 'Take your time drawing without any pressure'
                  : `You have ${selectedPreset.name} to draw from memory`
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center">
        <button
          onClick={onStartSession}
          className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold px-8 py-4 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-3 shadow-lg hover:shadow-orange-500/25 text-lg"
        >
          <Play className="w-5 h-5" />
          Start Practice Session
        </button>
      </div>
    </div>
  );
}