import {
  TrendingUp,
  Activity,
  Target,
  Timer,
  Volume2,
  VolumeX,
  Brain,
  Play,
  Clock,
  BarChart3,
  Users,
  Zap
} from 'lucide-react';
import { formatTime, getRatingColor } from '../utils';
import { HistoryEntry, ItemRatings, TrainingAlgorithm } from '../types';

interface DashboardProps {
  algorithmMode: boolean;
  setAlgorithmMode: (mode: boolean) => void;
  generateChallenge: () => void;
  history: HistoryEntry[];
  itemRatings: ItemRatings;
  timer: number;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedAlgorithm: TrainingAlgorithm;
  trainingAlgorithms: TrainingAlgorithm[];
  onAlgorithmChange: (algorithm: TrainingAlgorithm) => void;
}

export default function Dashboard({
  algorithmMode,
  setAlgorithmMode,
  generateChallenge,
  history,
  itemRatings,
  timer,
  soundEnabled,
  setSoundEnabled,
  selectedAlgorithm,
  trainingAlgorithms,
  onAlgorithmChange
}: DashboardProps) {
  // Calculate KPIs
  const totalSessions = history.length;
  const needsPractice = Object.values(itemRatings).filter(r => r === 'struggled' || r === 'failed').length;
  const mastered = Object.values(itemRatings).filter(r => r === 'easy').length;
  const avgSessionTime = history.length > 0 ?
    Math.round(history.reduce((sum, entry) => sum + entry.time, 0) / history.length) : 0;

  // Recent sessions (last 7 days for trending)
  const last7Days = history.filter(entry => {
    const entryDate = new Date(entry.date);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return entryDate >= weekAgo;
  });

  const sessionTrend = last7Days.length - (history.length - last7Days.length > 7 ? 7 : history.length - last7Days.length);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Practice Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Track your drawing progress and maintain consistent practice</p>
        </div>
        <button
          onClick={generateChallenge}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
        >
          <Play className="w-5 h-5" />
          Start Practice
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Sessions */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Sessions</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{totalSessions}</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-sm text-green-600 font-medium">+{last7Days.length}</span>
            <span className="text-sm text-gray-500 ml-1">this week</span>
          </div>
        </div>

        {/* Needs Practice */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Needs Practice</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{needsPractice}</p>
            </div>
            <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Items marked struggled/failed</span>
          </div>
        </div>

        {/* Mastered */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mastered</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{mastered}</p>
            </div>
            <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Items marked as easy</span>
          </div>
        </div>

        {/* Avg Session Time */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Session</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{formatTime(avgSessionTime)}</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <Timer className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-500">Average practice duration</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-6">
          {/* Training Mode */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Training Mode</h3>
              <div className="flex items-center">
                <button
                  onClick={() => setAlgorithmMode(!algorithmMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    algorithmMode ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    algorithmMode ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>

            {algorithmMode ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="font-medium text-blue-900">Smart Algorithm</div>
                    <div className="text-xs text-blue-700">Adapts to your progress</div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Algorithm Type</label>
                  <select
                    value={selectedAlgorithm.id}
                    onChange={(e) => {
                      const algorithm = trainingAlgorithms.find(alg => alg.id === e.target.value);
                      if (algorithm) onAlgorithmChange(algorithm);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {trainingAlgorithms.filter(alg => alg.id !== 'random').map(algorithm => (
                      <option key={algorithm.id} value={algorithm.id}>
                        {algorithm.icon} {algorithm.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-2">{selectedAlgorithm.description}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">🎲</div>
                <div>
                  <div className="font-medium text-gray-900">Random Mode</div>
                  <div className="text-xs text-gray-600">Completely random selection</div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-5 h-5 text-gray-600" /> : <VolumeX className="w-5 h-5 text-gray-600" />}
                  <span className="text-sm font-medium text-gray-900">Sound Alerts</span>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    soundEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <BarChart3 className="w-4 h-4" />
                  Last 10 sessions
                </div>
              </div>
            </div>

            {history.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {history.slice().reverse().slice(0, 10).map((entry: HistoryEntry, idx: number) => (
                  <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <Activity className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{entry.item}</div>
                          <div className="text-sm text-gray-500">{entry.category}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRatingColor(entry.rating)}`}>
                          {entry.rating === 'easy' ? '😊 Easy' :
                           entry.rating === 'got-it' ? '👍 Okay' :
                           entry.rating === 'struggled' ? '😅 Hard' : '😵 Failed'}
                        </span>

                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-4 h-4" />
                          {formatTime(entry.time)}
                        </div>

                        <div className="text-xs text-gray-400">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No practice sessions yet</h3>
                <p className="text-gray-500 mb-6">Start your first practice session to see your progress here</p>
                <button
                  onClick={generateChallenge}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Start First Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}