import { useEffect, useState, useCallback, useRef } from 'react'
import { Trash2, ExternalLink, StickyNote, ImageIcon, X } from 'lucide-react'
import { BoardImage } from '../services/boardService'
import { BoardService } from '../services/boardService'
import { useAuth } from '../contexts/AuthContext'

interface PersonalImageBoardProps {
  drawingSubject: string
  onImageCountChange: (count: number) => void
}

export function PersonalImageBoard({
  drawingSubject,
  onImageCountChange
}: PersonalImageBoardProps) {
  const [images, setImages] = useState<BoardImage[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({})
  const [expandedImage, setExpandedImage] = useState<BoardImage | null>(null)

  // Debug log for expanded image state changes
  useEffect(() => {
    console.log('🔍 Expanded image state changed:', expandedImage)
  }, [expandedImage])
  const containerRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user && drawingSubject) {
      loadImages()
    } else {
      // For non-authenticated users, set loading to false so they see the empty state
      setLoading(false)
    }
  }, [user?.id, drawingSubject]) // Only depend on user.id, not the entire user object

  // Keyboard navigation for expanded image
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (expandedImage && e.key === 'Escape') {
        setExpandedImage(null)
      }
    }

    if (expandedImage) {
      document.addEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'hidden' // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleKeyPress)
      document.body.style.overflow = 'unset'
    }
  }, [expandedImage])

  const loadImages = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Load images from new board system
      const data = await BoardService.getBoardImages(user.id, drawingSubject)
      console.log('📸 Loaded images from board:', data)

      setImages(data)
      onImageCountChange(data.length)

      // Initialize loading states for new images only
      setImageLoadStates(prev => {
        const newStates = { ...prev }
        data.forEach(img => {
          // Only set to loading if this image doesn't have a state yet
          if (!newStates[img.id]) {
            newStates[img.id] = 'loading'
          }
          console.log('🔍 Image URL:', img.image_url, 'Current state:', newStates[img.id])
        })
        return newStates
      })
    } catch (error) {
      console.error('Error loading board images:', error)
      // On error, set empty array to show empty state
      setImages([])
      onImageCountChange(0)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!user || deletingId) return

    setDeletingId(imageId)
    try {
      await BoardService.removeImageFromBoard(user.id, imageId)

      setImages(prev => prev.filter(img => img.id !== imageId))
      setImageLoadStates(prev => {
        const newStates = { ...prev }
        delete newStates[imageId]
        return newStates
      })
      onImageCountChange(images.length - 1)
    } catch (error) {
      console.error('Error deleting image from board:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleImageClick = (image: BoardImage) => {
    console.log('🖼️ Image clicked:', image.image_url)
    console.log('📸 Setting expanded image:', image)
    setExpandedImage(image)
  }

  const handleImageUrlClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleImageLoad = useCallback((imageId: string) => {
    console.log('✅ Image loaded successfully:', imageId)
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: 'loaded'
    }))
  }, [])

  const handleImageError = useCallback((imageId: string) => {
    console.log('❌ Image failed to load:', imageId)
    setImageLoadStates(prev => ({
      ...prev,
      [imageId]: 'error'
    }))
  }, [])

  const getImageStyle = (index: number) => {
    // Stagger animation delays for a smooth cascade effect
    return {
      animationDelay: `${index * 0.1}s`
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg break-inside-avoid animate-pulse"
              style={{ height: `${Math.random() * 100 + 150}px` }}
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="w-32 h-4 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className="bg-gray-200 rounded-lg break-inside-avoid animate-pulse"
              style={{ height: `${Math.random() * 100 + 150}px` }}
            ></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900 flex items-center gap-2">
          <ImageIcon className="w-4 h-4" />
          Your Reference Collection ({images.length})
        </h3>
        <div className="text-xs text-gray-500">
          {images.length === 1 ? '1 image' : `${images.length} images`}
        </div>
      </div>

      {/* Masonry Grid */}
      <div
        ref={containerRef}
        className="columns-2 sm:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4"
      >
        {images.map((image, index) => {
          const loadState = imageLoadStates[image.id] || 'loading'

          return (
            <div
              key={image.id}
              className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 break-inside-avoid animate-in slide-in-from-bottom-4"
              style={getImageStyle(index)}
            >
              {/* Image Container */}
              <div
                className="relative cursor-pointer overflow-hidden"
                onClick={() => handleImageClick(image)}
              >
                {loadState === 'loading' && (
                  <div className="w-full h-48 bg-gray-100 animate-pulse flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-gray-300" />
                  </div>
                )}

                <img
                  src={image.image_url}
                  alt="Reference"
                  className={`w-full object-cover group-hover:scale-105 transition-transform duration-500 ${
                    loadState === 'loaded' ? 'opacity-100' : 'opacity-0'
                  }`}
                  loading="lazy"
                  onLoad={() => handleImageLoad(image.id)}
                  onError={() => handleImageError(image.id)}
                  style={{
                    display: loadState === 'error' ? 'none' : 'block'
                  }}
                />

                {loadState === 'error' && (
                  <div className="w-full h-48 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <ImageIcon className="w-8 h-8 mb-2" />
                    <span className="text-xs">Image unavailable</span>
                  </div>
                )}

                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none">
                <div className="flex gap-2 pointer-events-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageUrlClick(image.image_url)
                    }}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2.5 rounded-full transition-all hover:scale-110 shadow-lg"
                    title="Open in new tab"
                  >
                    <ExternalLink size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteImage(image.id)
                    }}
                    disabled={deletingId === image.id}
                    className="bg-white/90 backdrop-blur-sm hover:bg-white text-red-600 hover:text-red-700 p-2.5 rounded-full transition-all hover:scale-110 disabled:opacity-50 shadow-lg"
                    title="Remove from collection"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Notes indicator */}
              {image.notes && (
                <div className="absolute top-3 left-3">
                  <div
                    className="bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm border border-white/20"
                    title={image.notes}
                  >
                    <StickyNote size={12} className="text-blue-600" />
                  </div>
                </div>
              )}

              {/* Loading indicator for deletion */}
              {deletingId === image.id && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-gray-300 border-t-red-500 rounded-full animate-spin" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Expanded Image View */}
      {expandedImage && (
        <div
          className="fixed bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          style={{
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 0,
            padding: '1rem'
          }}
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl max-h-full bg-white rounded-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-700 p-2 rounded-full transition-all hover:scale-110 shadow-lg"
              title="Close"
            >
              <X size={20} />
            </button>

            {/* Image */}
            <img
              src={expandedImage.image_url}
              alt={expandedImage.title || "Reference"}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Image info and actions */}
            <div className="p-4 bg-white border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{expandedImage.title}</h3>
                  {expandedImage.notes && (
                    <p className="text-sm text-gray-600 mt-1">{expandedImage.notes}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleImageUrlClick(expandedImage.image_url)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="Open original"
                  >
                    <ExternalLink size={16} />
                    Open Original
                  </button>
                  <button
                    onClick={() => {
                      handleDeleteImage(expandedImage.id)
                      setExpandedImage(null)
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    title="Remove from collection"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
        💡 <strong>Pro tip:</strong> Click images to view full size • Right-click images to copy or save • Each reference improves your visual memory
      </div>
    </div>
  )
}

export default PersonalImageBoard