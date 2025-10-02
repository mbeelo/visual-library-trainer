import { useEffect, useState } from 'react'
import { Trash2, ExternalLink, StickyNote } from 'lucide-react'
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

  const { user } = useAuth()

  useEffect(() => {
    if (user && drawingSubject) {
      loadImages()
    }
  }, [user, drawingSubject])

  const loadImages = async () => {
    if (!user) return

    try {
      setLoading(true)
      const data = await ImageCollectionService.getImagesBySubject(user.id, drawingSubject)
      setImages(data)
      onImageCountChange(data.length)
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
      await ImageCollectionService.removeImage(user.id, imageId)
      setImages(prev => prev.filter(img => img.id !== imageId))
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

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 aspect-square rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return null
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">
          Your Reference Collection ({images.length})
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="group relative bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            <div
              className="aspect-square cursor-pointer"
              onClick={() => handleImageClick(image.image_url)}
            >
              <img
                src={image.image_url}
                alt="Reference"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"%3E%3Crect width="200" height="200" fill="%23f3f4f6"/%3E%3Ctext x="100" y="100" text-anchor="middle" dy=".3em" fill="%236b7280" font-family="sans-serif" font-size="14"%3EImage not found%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>

            {/* Overlay controls */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex gap-2">
                <button
                  onClick={() => handleImageClick(image.image_url)}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-gray-700 p-2 rounded-full transition-colors"
                  title="Open in new tab"
                >
                  <ExternalLink size={16} />
                </button>
                <button
                  onClick={() => handleDeleteImage(image.id)}
                  disabled={deletingId === image.id}
                  className="bg-white bg-opacity-90 hover:bg-opacity-100 text-red-600 hover:text-red-700 p-2 rounded-full transition-colors disabled:opacity-50"
                  title="Remove from collection"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Notes indicator */}
            {image.notes && (
              <div className="absolute top-2 left-2">
                <div
                  className="bg-white bg-opacity-90 p-1 rounded-full"
                  title={image.notes}
                >
                  <StickyNote size={12} className="text-blue-600" />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Click images to view full size • Hover to see controls
      </div>
    </div>
  )
}

export default PersonalImageBoard