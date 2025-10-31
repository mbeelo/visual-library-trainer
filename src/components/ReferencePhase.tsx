import { formatTime, getPinterestUrl, getArtStationUrl, getGoogleUrl, getUnsplashUrl, getPexelsUrl, getPixabayUrl } from '../utils';
import { Rating } from '../types';
import { ExternalLink, Play, Pause, Clock, RefreshCw, ArrowRight, Home, Timer, TrendingUp, Camera } from 'lucide-react';
import { PersonalImageBoard } from './PersonalImageBoard';
import { ImageUrlInput } from './ImageUrlInput';
import { useAuth } from '../contexts/AuthContext';
import { SimpleImageService } from '../services/simpleImageService';
import { useState, useEffect, useCallback } from 'react';

interface ReferencePhaseProps {
  currentItem: string | null;
  currentCategory: string | null;
  listId: string;
  listName: string;
  timer: number;
  onCompleteWithRating: (rating: Rating) => void;
  onRepeatItem?: () => void;
  onNextItem?: () => void;
  onBackToHub?: () => void;
  onShowUpgrade?: () => void;
  onShowAuth?: (mode: 'signin' | 'signup') => void;
  referenceTimer?: number;
  targetReferenceDuration?: number;
  isReferenceTimerRunning?: boolean;
  onStartReferenceTimer?: (duration?: number) => void;
  onStopReferenceTimer?: () => void;
}

export default function ReferencePhase({
  currentItem,
  currentCategory,
  listId,
  listName,
  onCompleteWithRating,
  onRepeatItem,
  onNextItem,
  onBackToHub,
  onShowUpgrade,
  onShowAuth,
  referenceTimer = 0,
  targetReferenceDuration = 0,
  isReferenceTimerRunning = false,
  onStartReferenceTimer,
  onStopReferenceTimer
}: ReferencePhaseProps) {
  const { user, subscriptionTier } = useAuth();
  const [imageCount, setImageCount] = useState(0);
  const [canAddMore, setCanAddMore] = useState(true); // Start optimistic for better UX
  const [refreshKey, setRefreshKey] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [selectedRating, setSelectedRating] = useState<Rating | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  useEffect(() => {
    checkCanAddMore();
  }, [user, currentItem, subscriptionTier, imageCount]);

  const checkCanAddMore = async () => {
    if (!user || !currentItem) {
      return;
    }

    // For pro users, always allow
    if (subscriptionTier === 'pro') {
      setCanAddMore(true);
      return;
    }

    // For free users, use the current imageCount if available (faster)
    if (imageCount >= 0) {
      setCanAddMore(imageCount < 3);
      return;
    }

    // Fallback: query database
    try {
      const allowed = await SimpleImageService.canAddImage(
        currentItem,
        listId,
        subscriptionTier,
        user?.id || ''
      );
      setCanAddMore(allowed);
    } catch (error) {
      console.log('Error checking board image limit:', error);
      // On error, allow for better UX (user will get error when actually trying to add)
      setCanAddMore(true);
    }
  };

  const handleUpgradeNeeded = () => {
    onShowUpgrade?.();
  };

  const handleImageAdded = useCallback(() => {
    console.log('🔄 Image added callback triggered, updating refreshKey')
    // Force PersonalImageBoard to remount and reload images
    setRefreshKey(prev => {
      console.log('🔑 RefreshKey:', prev, '→', prev + 1)
      return prev + 1
    });
  }, []);

  const handleRating = (rating: Rating) => {
    setSelectedRating(rating);
    setHasRated(true);
    onCompleteWithRating(rating);
  };

  const ratingOptions = [
    { value: 'easy' as Rating, label: 'Fantastic', emoji: '😊' },
    { value: 'got-it' as Rating, label: 'Good', emoji: '👍' },
    { value: 'struggled' as Rating, label: 'Okay', emoji: '😅' },
    { value: 'failed' as Rating, label: 'Needs Work', emoji: '😔' }
  ];


  const referenceProgress = targetReferenceDuration > 0 ? Math.min((referenceTimer / targetReferenceDuration) * 100, 100) : 0;
  const isReferenceTimeUp = targetReferenceDuration > 0 && referenceTimer >= targetReferenceDuration;
  const referenceTimeRemaining = targetReferenceDuration > 0 ? Math.max(0, targetReferenceDuration - referenceTimer) : 0;
  const isReferenceWarning = referenceProgress >= 75 && referenceProgress < 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800 border border-orange-500/20 rounded-xl p-8">
        {/* Pills - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 mb-6">
          <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border border-slate-400 text-slate-400 bg-transparent">
            {listName}
          </div>
          <div className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium border border-orange-400 text-orange-400 bg-transparent">
            {currentCategory}
          </div>
        </div>

        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Study <span className="text-orange-400">{currentItem}</span> References
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Now study references to validate what you drew and discover new details to strengthen your visual memory.
          </p>
        </div>
      </div>


      {/* 📚 Personal Image Library - Supporting Content */}
      <div className="bg-slate-800/60 border border-orange-500/20 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
            <Camera className="w-5 h-5 text-slate-900" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Your Reference Library</h3>
            <p className="text-sm text-slate-300">
              {imageCount} reference{imageCount !== 1 ? 's' : ''} saved for {currentItem}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-slate-300">{imageCount}</div>
            <div className="text-xs text-slate-400">References</div>
          </div>
        </div>

        <PersonalImageBoard
          drawingSubject={currentItem || ''}
          listId={listId}
          onImageCountChange={setImageCount}
          refreshKey={refreshKey}
        />
      </div>

      {/* Add to Collection - Collapsible */}
      {currentItem && (
        <details className="group">
          <summary className="bg-slate-800 border border-orange-500/20 rounded-xl p-6 cursor-pointer hover:bg-slate-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                  <ExternalLink className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">Add to Collection</h3>
                  <p className="text-sm text-slate-300">
                    {!user
                      ? `Sign in to start building your reference library for "${currentItem}"`
                      : subscriptionTier === 'free' && imageCount >= 3
                      ? `Free tier: ${imageCount}/3 images saved`
                      : `Add reference images for "${currentItem}"`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {user && subscriptionTier === 'free' && imageCount >= 3 && (
                  <button
                    onClick={handleUpgradeNeeded}
                    className="bg-slate-600 hover:bg-slate-500 text-white text-xs font-medium py-1 px-3 rounded-md transition-all"
                  >
                    Upgrade
                  </button>
                )}
                <div className="text-orange-400 group-open:rotate-180 transition-transform">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </summary>

          <div className="bg-slate-800 border border-orange-500/20 border-t-0 rounded-b-xl p-6 space-y-6">
            {user ? (
              <ImageUrlInput
                drawingSubject={currentItem || ''}
                listId={listId}
                onImageAdded={handleImageAdded}
                canAddMore={canAddMore}
                onUpgradeNeeded={handleUpgradeNeeded}
                onSignInNeeded={() => onShowAuth?.('signin')}
              />
            ) : (
              <ImageUrlInput
                drawingSubject={currentItem || ''}
                listId={listId}
                onImageAdded={handleImageAdded}
                canAddMore={false}
                onUpgradeNeeded={handleUpgradeNeeded}
                onSignInNeeded={() => onShowAuth?.('signin')}
              />
            )}

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-slate-600"></div>
              <span className="text-sm text-slate-400 font-medium">Need help finding images?</span>
              <div className="flex-1 h-px bg-slate-600"></div>
            </div>

            {/* Search Sources */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              <a
                href={getPinterestUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📌</span>
                  <h4 className="font-semibold text-white">Pinterest</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">Curated art references</p>
              </a>

              <a
                href={getArtStationUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🎨</span>
                  <h4 className="font-semibold text-white">ArtStation</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">Professional artwork</p>
              </a>

              <a
                href={getGoogleUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🔍</span>
                  <h4 className="font-semibold text-white">Google Images</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">Wide variety of photos</p>
              </a>

              <a
                href={getUnsplashUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">📸</span>
                  <h4 className="font-semibold text-white">Unsplash</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">High-quality photography</p>
              </a>

              <a
                href={getPexelsUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🎭</span>
                  <h4 className="font-semibold text-white">Pexels</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">Free stock photos</p>
              </a>

              <a
                href={getPixabayUrl(currentItem || '')}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-700/50 border border-slate-600 rounded-lg p-4 hover:border-orange-500/30 hover:shadow-lg transition-all transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">🌈</span>
                  <h4 className="font-semibold text-white">Pixabay</h4>
                  <ExternalLink className="w-4 h-4 text-orange-400 ml-auto" />
                </div>
                <p className="text-sm text-slate-300">Free images & vectors</p>
              </a>
            </div>

            {/* Detailed Instructions - Collapsible */}
            <details className="group/instructions">
              <summary className="bg-slate-700/30 border border-slate-600 rounded-lg p-4 cursor-pointer hover:bg-slate-600/30 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-xs text-slate-900 font-bold">?</span>
                    </div>
                    <span className="text-sm font-medium text-white">How to copy image URLs</span>
                  </div>
                  <div className="text-orange-400 group-open/instructions:rotate-180 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </summary>

              <div className="bg-slate-700/30 border border-slate-600 border-t-0 rounded-b-lg p-4">
                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-sm text-slate-900 font-bold">👆</span>
                    </div>
                    <span className="font-medium text-white">Universal Method (works on all sites)</span>
                  </div>
                  <ol className="text-sm text-slate-300 space-y-2 ml-4">
                    <li><strong>1.</strong> Find the image you want to save</li>
                    <li><strong>2.</strong> Right-click on the image</li>
                    <li><strong>3.</strong> Look for "Copy image address" or "Copy image URL"</li>
                    <li><strong>4.</strong> If that option doesn't appear, try clicking the image first to open it larger, then right-click</li>
                    <li><strong>5.</strong> Paste the URL in the field above</li>
                  </ol>
                  <div className="mt-3 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <p className="text-xs text-orange-400">
                      💡 <strong>Tip:</strong> If the image opens in a new tab or full screen when you click it, right-click on that larger version for the best quality URL.
                    </p>
                  </div>
                </div>
              </div>
            </details>
          </div>
        </details>
      )}


      {/* Study Timer - Collapsible */}
      {onStartReferenceTimer && (
        <details className="group">
          <summary className="bg-slate-800 border border-orange-500/20 rounded-xl p-6 cursor-pointer hover:bg-slate-700/50 transition-colors list-none [&::-webkit-details-marker]:hidden [&::marker]:hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-900" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">
                    {targetReferenceDuration > 0 ? 'Study Timer Active' : 'Optional Study Timer'}
                  </h3>
                  <p className="text-sm text-slate-300">
                    {targetReferenceDuration > 0
                      ? `${formatTime(referenceTimer)} / ${formatTime(targetReferenceDuration)}`
                      : 'Set a time limit for studying references'
                    }
                  </p>
                </div>
              </div>
              <div className="text-orange-400 group-open:rotate-180 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </summary>

          <div className="bg-slate-800 border border-orange-500/20 border-t-0 rounded-b-xl p-6">
            {targetReferenceDuration > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Timer Display */}
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isReferenceTimeUp ? 'bg-red-500/20 border border-red-500/20' : isReferenceWarning ? 'bg-orange-500/20 border border-orange-500/20' : 'bg-orange-400'
                    }`}>
                      <Timer className={`w-5 h-5 ${
                        isReferenceTimeUp ? 'text-red-400' : isReferenceWarning ? 'text-orange-400' : 'text-slate-900'
                      }`} />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Time Remaining</h4>
                      <p className="text-sm text-slate-300">
                        {isReferenceTimeUp ? 'Time is up!' : isReferenceWarning ? 'Almost finished' : 'Keep studying'}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className={`text-4xl font-bold mb-4 ${
                      isReferenceTimeUp ? 'text-red-400' : isReferenceWarning ? 'text-orange-400' : 'text-white'
                    }`}>
                      {formatTime(referenceTimeRemaining)}
                    </div>

                    <div className="flex justify-center gap-3">
                      <button
                        onClick={() => onStartReferenceTimer && onStartReferenceTimer()}
                        className="bg-orange-400 hover:bg-orange-500 text-slate-900 font-semibold py-2 px-4 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg hover:shadow-orange-500/25"
                      >
                        {isReferenceTimerRunning ? (
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
                      {onStopReferenceTimer && (
                        <button
                          onClick={onStopReferenceTimer}
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
                <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-orange-400 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-slate-900" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-white">Study Progress</h4>
                      <p className="text-sm text-slate-300">{Math.round(referenceProgress)}% complete</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="w-full bg-slate-600 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-1000 ${
                          isReferenceTimeUp ? 'bg-red-400' : isReferenceWarning ? 'bg-orange-400' : 'bg-gradient-to-r from-orange-400 to-amber-500'
                        }`}
                        style={{ width: `${referenceProgress}%` }}
                      ></div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-xl font-bold text-white">{Math.round(referenceProgress)}%</div>
                        <div className="text-xs text-slate-300">Complete</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{formatTime(referenceTimer)}</div>
                        <div className="text-xs text-slate-300">Elapsed</div>
                      </div>
                      <div>
                        <div className="text-xl font-bold text-white">{formatTime(targetReferenceDuration)}</div>
                        <div className="text-xs text-slate-300">Total</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-4xl font-bold text-white mb-4">{formatTime(referenceTimer)}</div>
                <p className="text-slate-300 mb-4">Time spent studying</p>

                {/* Timer Duration Selector - Only show when timer hasn't been started */}
                {referenceTimer === 0 && targetReferenceDuration === 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-slate-300 mb-3">Choose study duration:</p>
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
                    onClick={() => onStartReferenceTimer?.(selectedDuration || undefined)}
                    disabled={referenceTimer === 0 && targetReferenceDuration === 0 && !selectedDuration}
                    className={`font-semibold py-3 px-6 rounded-lg transition-all transform hover:scale-105 inline-flex items-center gap-2 shadow-lg ${
                      referenceTimer === 0 && targetReferenceDuration === 0 && !selectedDuration
                        ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                        : 'bg-orange-400 hover:bg-orange-500 text-slate-900 hover:shadow-orange-500/25'
                    }`}
                  >
                    {isReferenceTimerRunning ? (
                      <>
                        <Pause className="w-5 h-5" />
                        Pause Timer
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        {referenceTimer > 0 ? 'Resume Timer' : 'Start Study Timer'}
                      </>
                    )}
                  </button>
                  {onStopReferenceTimer && referenceTimer > 0 && (
                    <button
                      onClick={() => {
                        onStopReferenceTimer()
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
            )}
          </div>
        </details>
      )}

      {/* 🎯 PRIMARY ACTION: Core Session Flow - Rating & Actions */}
      <div className="bg-orange-400 border border-slate-400 rounded-xl p-8 shadow-lg">
        <div className="text-center">
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">How did your <span className="text-slate-700">drawing</span> turn out?</h2>
          </div>

          {/* Rating Buttons */}
          <div className="flex flex-wrap justify-center gap-3 mb-3">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleRating(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRating === option.value
                    ? 'bg-slate-800 text-white'
                    : 'bg-slate-700 text-white hover:bg-slate-600'
                }`}
              >
                {option.emoji} {option.label}
              </button>
            ))}
          </div>

          <div className="text-center mb-6">
            <p className="text-white font-medium">Rate your performance to track progress</p>
          </div>

          {/* Action Buttons - Show after rating */}
          {hasRated && (
            <div className="border-t border-slate-800/30 pt-6 mt-6">
              <div className="mb-6">
                <p className="text-white font-bold mb-2">Great work! What's next?</p>
              </div>

              {/* Primary Action - Prominent */}
              <div className="mb-4 flex justify-center">
                <button
                  onClick={onNextItem}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center gap-3"
                >
                  <ArrowRight size={24} />
                  Continue to Next Subject
                </button>
              </div>

              {/* Secondary Actions - Smaller */}
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <button
                  onClick={onRepeatItem}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RefreshCw size={16} />
                  Practice Again
                </button>
                <button
                  onClick={onBackToHub}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <Home size={16} />
                  Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}