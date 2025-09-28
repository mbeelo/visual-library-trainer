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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Session Setup</h1>
            <p className="text-sm text-gray-600 mt-1">Configure your practice session</p>
          </div>
        </div>
      </div>

      {/* Subject Card */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Practice Subject</h2>
              <p className="text-sm text-gray-600">Ready to draw from memory</p>
            </div>
          </div>
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50">
            <span className="text-sm font-medium text-blue-700">{currentCategory}</span>
          </div>
        </div>

        <div className="text-center py-8 border border-gray-100 rounded-lg bg-gray-50">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentItem}</h3>
          <p className="text-gray-600">Draw this subject from memory first, then study references</p>
        </div>
      </div>

      {/* Timer Configuration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timer Settings */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Timer Settings</h3>
              <p className="text-sm text-gray-600">Set your practice duration</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="5"
              />
              <p className="text-xs text-gray-500 mt-2">
                Set to 0 for no time limit • Max: 180 minutes
              </p>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">Quick Presets</p>
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
                    className="px-3 py-2 text-sm font-medium bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 rounded-lg transition-colors border border-gray-200 hover:border-blue-300"
                  >
                    {minutes}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Session Summary */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Session Summary</h3>
              <p className="text-sm text-gray-600">Review your setup</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Subject</span>
              <span className="font-medium text-gray-900">{currentItem}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-sm text-gray-600">Category</span>
              <span className="font-medium text-gray-900">{currentCategory}</span>
            </div>

            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-gray-600">Duration</span>
              <span className="font-medium text-gray-900">
                {selectedPreset.duration === 0 ? 'No limit' : selectedPreset.name}
              </span>
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                <span className="text-sm font-medium text-blue-900">Ready to practice</span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
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
      <div className="flex justify-end gap-4">
        <button
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Back to Dashboard
        </button>
        <button
          onClick={onStartSession}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <Play className="w-5 h-5" />
          Start Practice Session
        </button>
      </div>
    </div>
  );
}