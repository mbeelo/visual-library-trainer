import { formatTime, getPinterestUrl, getArtStationUrl, getGoogleUrl } from '../utils';
import { Rating } from '../types';
import { Timer, BookOpen, ExternalLink, Star, Smile, ThumbsUp, Frown, X } from 'lucide-react';

interface ReferencePhaseProps {
  currentItem: string | null;
  currentCategory: string | null;
  timer: number;
  onCompleteWithRating: (rating: Rating) => void;
}

export default function ReferencePhase({
  currentItem,
  currentCategory,
  timer,
  onCompleteWithRating
}: ReferencePhaseProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Study References</h1>
          <p className="text-sm text-gray-600 mt-1">Compare your drawing with reference materials</p>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50">
          <span className="text-sm font-medium text-blue-700">{currentCategory}</span>
        </div>
      </div>

      {/* Subject Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Drawing Subject</h2>
              <p className="text-sm text-gray-600">Study and compare with your work</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-lg">
            <Timer className="w-5 h-5 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">Memory phase: {formatTime(timer)}</span>
          </div>
        </div>

        <div className="text-center py-6 border border-gray-100 rounded-lg bg-gray-50">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">{currentItem}</h3>
          <p className="text-gray-600">Now study references to see how you did</p>
        </div>
      </div>

      {/* Reference Sources */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Reference Sources</h3>
          <p className="text-sm text-gray-600 mt-1">Study these references to improve your drawing</p>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-6">
            <a
              href={getPinterestUrl(currentItem || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-red-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📌</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Pinterest</h4>
              <p className="text-sm text-gray-600 mb-4">Curated art references and inspiration boards</p>

              <div className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-red-700 transition-colors text-center">
                Browse References
              </div>
            </a>

            <a
              href={getArtStationUrl(currentItem || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🎨</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-500" />
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">ArtStation</h4>
              <p className="text-sm text-gray-600 mb-4">Professional artwork and detailed studies</p>

              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-blue-600 transition-colors text-center">
                View Artwork
              </div>
            </a>

            <a
              href={getGoogleUrl(currentItem || '')}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white border border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">🔍</span>
                </div>
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-gray-500" />
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Google Images</h4>
              <p className="text-sm text-gray-600 mb-4">Wide variety of reference photos</p>

              <div className="bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium group-hover:bg-gray-800 transition-colors text-center">
                Search Images
              </div>
            </a>
          </div>
        </div>
      </div>

      {/* Rating Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Rate Your Performance</h3>
              <p className="text-sm text-gray-600">How well did you remember this subject from memory?</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => onCompleteWithRating('easy')}
              className="group p-6 bg-white border-2 border-green-200 hover:border-green-400 hover:bg-green-50 rounded-xl transition-all hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Smile className="w-6 h-6 text-green-600" />
                </div>
                <div className="font-semibold text-green-700 mb-1">Easy</div>
                <div className="text-xs text-gray-600">Nailed it perfectly!</div>
              </div>
            </button>

            <button
              onClick={() => onCompleteWithRating('got-it')}
              className="group p-6 bg-white border-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <ThumbsUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="font-semibold text-blue-700 mb-1">Good</div>
                <div className="text-xs text-gray-600">Got most of it right</div>
              </div>
            </button>

            <button
              onClick={() => onCompleteWithRating('struggled')}
              className="group p-6 bg-white border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 rounded-xl transition-all hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-50 group-hover:bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Frown className="w-6 h-6 text-orange-600" />
                </div>
                <div className="font-semibold text-orange-700 mb-1">Struggled</div>
                <div className="text-xs text-gray-600">Missed some details</div>
              </div>
            </button>

            <button
              onClick={() => onCompleteWithRating('failed')}
              className="group p-6 bg-white border-2 border-red-200 hover:border-red-400 hover:bg-red-50 rounded-xl transition-all hover:shadow-md"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-red-50 group-hover:bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <div className="font-semibold text-red-700 mb-1">Failed</div>
                <div className="text-xs text-gray-600">Need more practice</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}