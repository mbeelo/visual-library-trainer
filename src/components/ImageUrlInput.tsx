import React, { useState } from 'react'
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react'
import { ImageCollectionService } from '../services/imageCollections'
import { useAuth } from '../contexts/AuthContext'

interface ImageUrlInputProps {
  drawingSubject: string
  onImageAdded: () => void
  canAddMore: boolean
  onUpgradeNeeded: () => void
}

export function ImageUrlInput({
  drawingSubject,
  onImageAdded,
  canAddMore,
  onUpgradeNeeded
}: ImageUrlInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const { user } = useAuth()

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    setError('')

    // Basic URL validation and preview
    if (newUrl && ImageCollectionService.validateImageUrl(newUrl)) {
      setPreviewUrl(newUrl)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      setError('Please sign in to save images')
      return
    }

    if (!canAddMore) {
      onUpgradeNeeded()
      return
    }

    if (!url.trim()) {
      setError('Please enter an image URL')
      return
    }

    if (!ImageCollectionService.validateImageUrl(url)) {
      setError('Please enter a valid image URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await ImageCollectionService.addImage(user.id, {
        drawing_subject: drawingSubject,
        image_url: url.trim(),
        notes: notes.trim() || undefined
      })

      // Reset form
      setUrl('')
      setNotes('')
      setPreviewUrl(null)
      setIsOpen(false)
      onImageAdded()
    } catch (err) {
      setError('Failed to save image. Please try again.')
      console.error('Error adding image:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setIsOpen(false)
    setUrl('')
    setNotes('')
    setPreviewUrl(null)
    setError('')
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => {
          if (!user) {
            setError('Please sign in to save images')
            return
          }
          if (!canAddMore) {
            onUpgradeNeeded()
            return
          }
          setIsOpen(true)
        }}
        className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium py-8 px-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-2"
      >
        <Plus size={24} />
        <span>Add Reference Image</span>
        <span className="text-xs text-gray-500">
          Paste URL from Pinterest, Google, etc.
        </span>
      </button>
    )
  }

  return (
    <div className="bg-white border border-gray-300 rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-gray-900">Add Reference Image</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image URL
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {previewUrl && (
          <div className="border border-gray-200 rounded-md p-2">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <img
              src={previewUrl}
              alt="Preview"
              className="max-w-full h-24 object-cover rounded"
              onError={() => {
                setPreviewUrl(null)
                setError('Invalid image URL - unable to load preview')
              }}
            />
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Great perspective, good lighting..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isLoading || !url}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add Image
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}