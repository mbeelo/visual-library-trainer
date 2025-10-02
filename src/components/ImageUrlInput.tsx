import React, { useState, useEffect, useMemo } from 'react'
import { Plus, X, AlertCircle, Loader2, CheckCircle, ExternalLink, Copy, Info } from 'lucide-react'
import { BoardService } from '../services/boardService'
import { useAuth } from '../contexts/AuthContext'

interface ImageUrlInputProps {
  drawingSubject: string
  onImageAdded: () => void
  canAddMore: boolean
  onUpgradeNeeded: () => void
  onSignInNeeded?: () => void
}

type Platform = 'pinterest' | 'google' | 'artstation' | 'unsplash' | 'other' | null

interface PlatformGuide {
  name: string
  icon: string
  steps: string[]
  urlPattern: RegExp
  color: string
}

const platformGuides: Record<Exclude<Platform, null>, PlatformGuide> = {
  pinterest: {
    name: 'Pinterest',
    icon: '📌',
    color: 'red',
    urlPattern: /pinterest\.(com|ca|co\.uk)/,
    steps: [
      'Right-click on the image you want to save',
      'Select "Copy image address" or "Copy image URL"',
      'Paste the URL in the field below'
    ]
  },
  google: {
    name: 'Google Images',
    icon: '🔍',
    color: 'blue',
    urlPattern: /images\.google\./,
    steps: [
      'Click on the image to open it in full size',
      'Right-click on the large image',
      'Select "Copy image address"',
      'Paste the URL below'
    ]
  },
  artstation: {
    name: 'ArtStation',
    icon: '🎨',
    color: 'blue',
    urlPattern: /artstation\.com/,
    steps: [
      'Click on the artwork to view it full size',
      'Right-click on the image',
      'Select "Copy image address"',
      'Paste the URL below'
    ]
  },
  unsplash: {
    name: 'Unsplash',
    icon: '📸',
    color: 'gray',
    urlPattern: /unsplash\.com/,
    steps: [
      'Click "Download" on the image',
      'Right-click the download link',
      'Select "Copy link address"',
      'Paste the URL below'
    ]
  },
  other: {
    name: 'Other Sites',
    icon: '🌐',
    color: 'gray',
    urlPattern: /.*/,
    steps: [
      'Right-click on the image',
      'Select "Copy image address" or "Copy image URL"',
      'Paste the URL below'
    ]
  }
}

export function ImageUrlInput({
  drawingSubject,
  onImageAdded,
  canAddMore,
  onUpgradeNeeded,
  onSignInNeeded
}: ImageUrlInputProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null)

  const { user } = useAuth()

  // Detect platform from URL
  const detectPlatform = useMemo((): Platform => {
    if (!url) return null

    for (const [platform, guide] of Object.entries(platformGuides)) {
      if (guide.urlPattern.test(url)) {
        return platform as Platform
      }
    }
    return 'other'
  }, [url])

  useEffect(() => {
    setDetectedPlatform(detectPlatform)
  }, [detectPlatform])

  const handleUrlChange = (newUrl: string) => {
    setUrl(newUrl)
    setError('')

    // Enhanced URL validation and preview
    if (newUrl.trim()) {
      if (BoardService.validateImageUrl(newUrl)) {
        setPreviewUrl(newUrl)
      } else {
        setPreviewUrl(null)
        if (newUrl.length > 10) { // Only show error for substantial input
          setError('Please enter a valid image URL (should end with .jpg, .png, .gif, .webp, etc.)')
        }
      }
    } else {
      setPreviewUrl(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      if (onSignInNeeded) {
        onSignInNeeded()
        return
      }
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

    if (!BoardService.validateImageUrl(url)) {
      setError('Please enter a valid image URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await BoardService.addImageToBoard(user.id, drawingSubject, {
        image_url: url.trim(),
        notes: notes.trim() || undefined,
        title: drawingSubject
      })

      // Reset form
      setUrl('')
      setNotes('')
      setPreviewUrl(null)
      setIsOpen(false)
      onImageAdded()
    } catch (err) {
      console.error('Error adding image to board:', err)

      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('already in your board')) {
          setError('This image is already in your collection')
        } else if (err.message.includes('timeout')) {
          setError('Request timed out. Please try again.')
        } else {
          setError('Unable to save image. Please try again.')
        }
      } else {
        setError('Unable to save image. Please try again.')
      }
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
    setShowInstructions(false)
    setDetectedPlatform(null)
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy text:', err)
    }
  }

  if (!isOpen) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => {
            if (!user) {
              if (onSignInNeeded) {
                onSignInNeeded()
                return
              }
              setError('Please sign in to save images')
              return
            }
            if (!canAddMore) {
              onUpgradeNeeded()
              return
            }
            setIsOpen(true)
          }}
          className="w-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 text-gray-600 hover:text-blue-600 font-medium py-8 px-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-3 group"
        >
          <div className="w-12 h-12 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors">
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-1">
            <span className="text-lg">Add Reference Image</span>
            <span className="text-sm text-gray-500 block">
              From Pinterest, Google Images, ArtStation & more
            </span>
          </div>
        </button>

        {error && (
          <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle size={16} />
            {error}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Reference Image</h3>
              <p className="text-sm text-gray-600">For "{drawingSubject}"</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Instructions Toggle */}
        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Need help getting image URLs?</span>
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {showInstructions ? 'Hide' : 'Show'} Instructions
          </button>
        </div>

        {/* Platform Instructions */}
        {showInstructions && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">How to copy image URLs:</h4>
            <div className="grid gap-4">
              {Object.entries(platformGuides).map(([key, guide]) => (
                <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{guide.icon}</span>
                    <span className="font-medium text-gray-900">{guide.name}</span>
                  </div>
                  <ol className="text-sm text-gray-600 space-y-1">
                    {guide.steps.map((step, index) => (
                      <li key={index} className="flex gap-2">
                        <span className="font-medium text-gray-400">{index + 1}.</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* URL Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              Image URL
            </label>
            {detectedPlatform && detectedPlatform !== 'other' && (
              <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full border border-green-200">
                <CheckCircle size={12} />
                <span>{platformGuides[detectedPlatform].icon} {platformGuides[detectedPlatform].name} detected</span>
              </div>
            )}
          </div>

          <div className="relative">
            <input
              type="url"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              placeholder="Paste image URL here... (e.g., https://example.com/image.jpg)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
            {url && (
              <button
                type="button"
                onClick={() => copyToClipboard(url)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded"
                title="Copy URL"
              >
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700">Preview loaded successfully</span>
            </div>
            <div className="relative group">
              <img
                src={previewUrl}
                alt="Preview"
                className="max-w-full h-32 object-cover rounded-lg border border-gray-200"
                onError={() => {
                  setPreviewUrl(null)
                  setError('Invalid image URL - unable to load preview')
                }}
              />
              <button
                type="button"
                onClick={() => window.open(previewUrl, '_blank')}
                className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Open full size"
              >
                <ExternalLink size={14} />
              </button>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Great lighting, interesting perspective, good anatomy reference..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 text-red-600 text-sm bg-red-50 p-4 rounded-lg border border-red-200">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading || !url || !previewUrl}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving to Collection...</span>
              </>
            ) : (
              <>
                <Plus size={16} />
                <span>Add to Collection</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}