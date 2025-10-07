import React, { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, X, AlertCircle, Loader2, CheckCircle, ExternalLink, Copy, Upload, Link } from 'lucide-react'
import { SimpleImageService } from '../services/simpleImageService'
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
  const [detectedPlatform, setDetectedPlatform] = useState<Platform>(null)
  const [uploadMode, setUploadMode] = useState<'url' | 'file'>('file') // Default to file upload for mobile-first
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
      if (SimpleImageService.validateImageUrl(newUrl)) {
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setSelectedFile(file)

    // Validate file
    const validation = SimpleImageService.validateImageFile(file)
    if (!validation.valid) {
      setError(validation.error || 'Invalid file')
      setPreviewUrl(null)
      return
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
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

    // Validate based on upload mode
    if (uploadMode === 'url') {
      if (!url.trim()) {
        setError('Please enter an image URL')
        return
      }

      if (!SimpleImageService.validateImageUrl(url)) {
        setError('Please enter a valid image URL')
        return
      }
    } else {
      if (!selectedFile) {
        setError('Please select an image file')
        return
      }

      const validation = SimpleImageService.validateImageFile(selectedFile)
      if (!validation.valid) {
        setError(validation.error || 'Invalid file')
        return
      }
    }

    setIsLoading(true)
    setError('')

    try {
      let result

      if (uploadMode === 'file' && selectedFile) {
        console.log('📁 Attempting to upload file:', {
          drawingSubject,
          fileName: selectedFile.name,
          fileSize: selectedFile.size,
          notes: notes.trim() || undefined
        })

        result = await SimpleImageService.addImageFromFile(drawingSubject, {
          file: selectedFile,
          notes: notes.trim() || undefined
        }, user.id)
      } else {
        console.log('💾 Attempting to save image URL:', {
          drawingSubject,
          url: url.trim(),
          notes: notes.trim() || undefined
        })

        result = await SimpleImageService.addImage(drawingSubject, {
          image_url: url.trim(),
          notes: notes.trim() || undefined
        }, user.id)
      }

      console.log('✅ Image saved successfully:', result)

      // Reset form
      setUrl('')
      setNotes('')
      setSelectedFile(null)
      setPreviewUrl(null)
      setIsOpen(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onImageAdded()
    } catch (err) {
      console.error('Error adding image to board:', err)

      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('already in your board')) {
          setError('This image is already in your collection')
        } else if (err.message.includes('timeout')) {
          setError('Request timed out. Please try again.')
        } else if (err.message.includes('Upload failed')) {
          setError('Upload failed. Please try again.')
        } else if (err.message.includes('File too large')) {
          setError('File too large. Please upload images smaller than 10MB.')
        } else if (err.message.includes('Invalid file type')) {
          setError('Invalid file type. Please upload JPEG, PNG, GIF, WebP, HEIC, or HEIF images.')
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
    setSelectedFile(null)
    setPreviewUrl(null)
    setError('')
    setDetectedPlatform(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
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
          className="w-full bg-slate-700 border-2 border-dashed border-slate-600 hover:border-orange-400 hover:bg-slate-600 text-slate-300 hover:text-orange-400 font-medium py-8 px-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-3 group"
        >
          <div className="w-12 h-12 bg-slate-600 group-hover:bg-orange-400 rounded-full flex items-center justify-center transition-colors">
            <Plus size={24} className="group-hover:scale-110 transition-transform" />
          </div>
          <div className="space-y-1">
            <span className="text-lg">Add Reference Image</span>
            <span className="text-sm text-slate-400 block">
              Upload from your device or add image URL
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
    <div className="bg-slate-800 border border-slate-600 rounded-lg p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
              {uploadMode === 'file' ? <Upload className="w-5 h-5 text-orange-400" /> : <Link className="w-5 h-5 text-orange-400" />}
            </div>
            <div>
              <h3 className="font-semibold text-white">Add Reference Image</h3>
              <p className="text-sm text-slate-300">For "{drawingSubject}"</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCancel}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-full hover:bg-slate-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle Tabs */}
        <div className="flex bg-slate-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => {
              setUploadMode('file')
              setError('')
              setPreviewUrl(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'file'
                ? 'bg-orange-400 text-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
          >
            <Upload size={16} />
            Upload Image
          </button>
          <button
            type="button"
            onClick={() => {
              setUploadMode('url')
              setError('')
              setPreviewUrl(null)
            }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              uploadMode === 'url'
                ? 'bg-orange-400 text-slate-900'
                : 'text-slate-300 hover:text-white hover:bg-slate-600'
            }`}
          >
            <Link size={16} />
            Add URL
          </button>
        </div>

        {/* File Upload Mode */}
        {uploadMode === 'file' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-200 mb-2">
                Select Image File
              </label>
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/heic,image/heif"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="w-full bg-slate-700 border-2 border-dashed border-slate-600 hover:border-orange-400 hover:bg-slate-600 text-slate-300 hover:text-orange-400 font-medium py-8 px-4 rounded-lg transition-all duration-200 flex flex-col items-center gap-3 group"
                >
                  <div className="w-12 h-12 bg-slate-600 group-hover:bg-orange-400 rounded-full flex items-center justify-center transition-colors">
                    <Upload size={24} className="group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-lg">
                      {selectedFile ? `Selected: ${selectedFile.name}` : 'Choose Image from Device'}
                    </span>
                    <span className="text-sm text-slate-400 block">
                      Tap to select from gallery or camera
                    </span>
                  </div>
                </button>
                {selectedFile && (
                  <div className="text-sm text-slate-300 bg-slate-700 p-3 rounded-lg">
                    <div><strong>File:</strong> {selectedFile.name}</div>
                    <div><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</div>
                    <div><strong>Type:</strong> {selectedFile.type}</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* URL Input Mode */}
        {uploadMode === 'url' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-200">
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
                className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm placeholder-slate-400"
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
        )}

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
          <label className="block text-sm font-medium text-slate-200 mb-2">
            Notes (optional)
          </label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Great lighting, interesting perspective, good anatomy reference..."
            className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 text-sm placeholder-slate-400"
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
            disabled={isLoading || (uploadMode === 'url' ? (!url || !previewUrl) : !selectedFile)}
            className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-slate-900 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>{uploadMode === 'file' ? 'Uploading...' : 'Saving to Collection...'}</span>
              </>
            ) : (
              <>
                {uploadMode === 'file' ? <Upload size={16} /> : <Plus size={16} />}
                <span>{uploadMode === 'file' ? 'Upload & Save' : 'Add to Collection'}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors font-medium"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}