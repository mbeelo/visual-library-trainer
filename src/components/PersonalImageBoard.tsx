import { useEffect, useState, useCallback, useRef } from 'react'
import { Trash2, ExternalLink, StickyNote, ImageIcon } from 'lucide-react'
import { ImageCollection } from '../types'
import { ImageCollectionService } from '../services/imageCollections'
import { useAuth } from '../contexts/AuthContext'

interface PersonalImageBoardProps {
  drawingSubject: string
  onImageCountChange: (count: number) => void
}

export function PersonalImageBoard({
  drawingSubject,
  onImageCountChange
}: PersonalImageBoardProps) {
  const [images, setImages] = useState<ImageCollection[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [imageLoadStates, setImageLoadStates] = useState<Record<string, 'loading' | 'loaded' | 'error'>>({})
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

  const loadImages = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Try database first
      let data: ImageCollection[] = []
      try {
        data = await ImageCollectionService.getImagesBySubject(user.id, drawingSubject)
        console.log('📸 Loaded images from database:', data)
      } catch (dbError) {
        console.log('Database not ready, loading from localStorage')

        // Fallback to localStorage
        const localImages = JSON.parse(localStorage.getItem('vlt-temp-images') || '{}')
        const subjectImages = localImages[drawingSubject] || []
        data = subjectImages.map((img: any) => ({
          ...img,
          user_id: user.id,
          drawing_subject: drawingSubject,
          position: 0
        }))
      }

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
      console.error('Error loading images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!user || deletingId) return

    setDeletingId(imageId)
    try {
      try {
        await ImageCollectionService.removeImage(user.id, imageId)
      } catch (dbError) {
        console.log('Database not ready, removing from localStorage')

        // Fallback: remove from localStorage
        const localImages = JSON.parse(localStorage.getItem('vlt-temp-images') || '{}')
        if (localImages[drawingSubject]) {
          localImages[drawingSubject] = localImages[drawingSubject].filter((img: any) => img.id !== imageId)
          localStorage.setItem('vlt-temp-images', JSON.stringify(localImages))
        }
      }

      setImages(prev => prev.filter(img => img.id !== imageId))
      setImageLoadStates(prev => {
        const newStates = { ...prev }
        delete newStates[imageId]
        return newStates
      })
      onImageCountChange(images.length - 1)
    } catch (error) {
      console.error('Error deleting image:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleImageClick = (url: string) => {
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
                onClick={() => handleImageClick(image.image_url)}
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
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200">
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleImageClick(image.image_url)
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

      <div className="text-xs text-gray-500 text-center bg-gray-50 p-3 rounded-lg">
        💡 <strong>Pro tip:</strong> Click images to view full size • Right-click images to copy or save • Each reference improves your visual memory
      </div>
    </div>
  )
}

export default PersonalImageBoard