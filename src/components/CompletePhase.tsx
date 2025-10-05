import { Play, RotateCcw, CheckCircle, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { formatTime } from '../utils';

interface CompletePhaseProps {
  currentItem: string | null;
  timer: number;
  onGenerateChallenge: () => void;
  onBackToDashboard: () => void;
  onPracticeSameSubject: () => void;
}

export default function CompletePhase({
  currentItem,
  timer,
  onGenerateChallenge,
  onBackToDashboard,
  onPracticeSameSubject
}: CompletePhaseProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Session Complete</h1>
          <p className="text-sm text-gray-600 mt-1">Great work! Your practice session is finished</p>
        </div>
      </div>

      {/* Success Card */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-8 text-center border-b border-gray-200">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Session Complete!</h2>
          <p className="text-gray-600 text-lg">You've successfully completed another practice session</p>
        </div>

        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-orange-50 rounded-full">
            <Target className="w-6 h-6 text-orange-600" />
            <span className="text-lg font-semibold text-orange-900">You practiced: {currentItem}</span>
          </div>
        </div>
      </div>

      {/* Progress Insight */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Keep Building Your Skills</h3>
            <p className="text-sm text-gray-600">Consistent practice leads to improvement</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">+1</div>
            <div className="text-sm text-orange-700 font-medium">Session Completed</div>
          </div>

          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">{formatTime(timer)}</div>
            <div className="text-sm text-green-700 font-medium">Practice Time</div>
          </div>

          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600 mb-1">📈</div>
            <div className="text-sm text-orange-700 font-medium">Progress Made</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onPracticeSameSubject}
          className="bg-green-600 hover:bg-green-700 text-white font-medium px-8 py-4 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-3"
        >
          <RefreshCw className="w-5 h-5" />
          <span className="text-lg">Practice Same Subject</span>
        </button>
        <button
          onClick={onGenerateChallenge}
          className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-medium px-8 py-4 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-3"
        >
          <Play className="w-5 h-5" />
          <span className="text-lg">Next Challenge</span>
        </button>
        <button
          onClick={onBackToDashboard}
          className="bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 font-medium px-8 py-4 rounded-lg transition-all shadow-sm hover:shadow-md inline-flex items-center justify-center gap-3"
        >
          <RotateCcw className="w-5 h-5" />
          <span className="text-lg">Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
}