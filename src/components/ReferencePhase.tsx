import { formatTime, getPinterestUrl, getArtStationUrl, getGoogleUrl } from '../utils';
import { Rating } from '../types';
import { Timer, BookOpen, ExternalLink, Star, Smile, ThumbsUp, Frown, X, Play, Pause, Clock } from 'lucide-react';
import { PersonalImageBoard } from './PersonalImageBoard';
import { ImageUrlInput } from './ImageUrlInput';
import { useAuth } from '../contexts/AuthContext';
import { ImageCollectionService } from '../services/imageCollections';
import { useState, useEffect } from 'react';

interface ReferencePhaseProps {
  currentItem: string | null;
  currentCategory: string | null;
  timer: number;
  onCompleteWithRating: (rating: Rating) => void;
  onShowUpgrade?: () => void;
  referenceTimer?: number;
  targetReferenceDuration?: number;
  onStartReferenceTimer?: () => void;
  onStopReferenceTimer?: () => void;
}

export default function ReferencePhase({
  currentItem,
  currentCategory,
  timer,
  onCompleteWithRating,
  onShowUpgrade,
  referenceTimer = 0,
  targetReferenceDuration = 0,
  onStartReferenceTimer,
  onStopReferenceTimer
}: ReferencePhaseProps) {
  const { user, subscriptionTier } = useAuth();
  const [imageCount, setImageCount] = useState(0);
  const [canAddMore, setCanAddMore] = useState(false);

  useEffect(() => {
    if (user && currentItem) {
      checkCanAddMore();
    }
  }, [user, currentItem, subscriptionTier, imageCount]);

  const checkCanAddMore = async () => {
    if (!user || !currentItem) return;

    try {
      const allowed = await ImageCollectionService.canAddImage(
        user.id,
        currentItem,
        subscriptionTier
      );
      setCanAddMore(allowed);
    } catch (error) {
      console.error('Error checking image limit:', error);
    }
  };

  const handleUpgradeNeeded = () => {
    onShowUpgrade?.();
  };

  const handleImageAdded = () => {
    checkCanAddMore();
  };

  const referenceProgress = targetReferenceDuration > 0 ? Math.min((referenceTimer / targetReferenceDuration) * 100, 100) : 0;
  const isReferenceTimeUp = targetReferenceDuration > 0 && referenceTimer >= targetReferenceDuration;
  const referenceTimeRemaining = targetReferenceDuration > 0 ? Math.max(0, targetReferenceDuration - referenceTimer) : 0;
  const isReferenceWarning = referenceProgress >= 75 && referenceProgress < 100;

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

      {/* Reference Timer Section */}
      {targetReferenceDuration > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timer Display */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                isReferenceTimeUp ? 'bg-red-50' : isReferenceWarning ? 'bg-orange-50' : 'bg-green-50'
              }`}>
                <Clock className={`w-6 h-6 ${
                  isReferenceTimeUp ? 'text-red-600' : isReferenceWarning ? 'text-orange-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reference Time Remaining</h3>
                <p className="text-sm text-gray-600">
                  {isReferenceTimeUp ? 'Time is up!' : isReferenceWarning ? 'Almost finished' : 'Study the references'}
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className={`text-5xl font-bold mb-4 ${
                isReferenceTimeUp ? 'text-red-600' : isReferenceWarning ? 'text-orange-600' : 'text-gray-900'
              }`}>
                {formatTime(referenceTimeRemaining)}
              </div>

              <div className="flex justify-center gap-3">
                {onStartReferenceTimer && (
                  <button
                    onClick={onStartReferenceTimer}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Play className="w-4 h-4" />
                    Start Timer
                  </button>
                )}
                {onStopReferenceTimer && (
                  <button
                    onClick={onStopReferenceTimer}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors inline-flex items-center gap-2"
                  >
                    <Pause className="w-4 h-4" />
                    Stop Timer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Progress Tracking */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Study Progress</h3>
                <p className="text-sm text-gray-600">{Math.round(referenceProgress)}% complete</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-4">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-1000 ${
                    isReferenceTimeUp ? 'bg-red-500' : isReferenceWarning ? 'bg-orange-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${referenceProgress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-gray-900">{Math.round(referenceProgress)}%</div>
                  <div className="text-xs text-gray-500">Complete</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatTime(referenceTimer)}</div>
                  <div className="text-xs text-gray-500">Elapsed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">{formatTime(targetReferenceDuration)}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : onStartReferenceTimer ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Optional Reference Timer</h3>
              <p className="text-sm text-gray-600">Set a time limit for studying references</p>
            </div>
          </div>

          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900 mb-4">{formatTime(referenceTimer)}</div>
            <p className="text-gray-600 mb-4">Time spent studying</p>
            <button
              onClick={onStartReferenceTimer}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Study Timer
            </button>
          </div>
        </div>
      ) : null}

      {/* Personal Image Collection */}
      {user && currentItem && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Your Personal Collection</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {subscriptionTier === 'free' && imageCount >= 3
                    ? `Free tier: ${imageCount}/3 images saved`
                    : `Saved references for "${currentItem}"`
                  }
                </p>
              </div>
              {subscriptionTier === 'free' && imageCount >= 3 && (
                <button
                  onClick={handleUpgradeNeeded}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Upgrade for Unlimited
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-4">
            <PersonalImageBoard
              drawingSubject={currentItem}
              onImageCountChange={setImageCount}
            />
            <ImageUrlInput
              drawingSubject={currentItem}
              onImageAdded={handleImageAdded}
              canAddMore={canAddMore}
              onUpgradeNeeded={handleUpgradeNeeded}
            />
          </div>
        </div>
      )}

      {/* Reference Sources */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Search for New References</h3>
          <p className="text-sm text-gray-600 mt-1">Find images to add to your personal collection</p>
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