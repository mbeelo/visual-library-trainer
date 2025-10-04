import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ArrowLeft, BookOpen, Plus, Lightbulb } from 'lucide-react'
import { CustomListData, TrainingList } from '../types'
import { createCustomList, validateCustomListData } from '../utils'
import { useLocalStorage } from '../hooks'

export default function CreateListPage() {
  const navigate = useNavigate()
  const [customLists, setCustomLists] = useLocalStorage<TrainingList[]>('vlt-custom-lists', [])
  const [, setSettings] = useLocalStorage('vlt-settings', { activeListId: 'default' })

  const [formData, setFormData] = useState<CustomListData>({
    name: '',
    description: '',
    creator: '',
    socialLink: '',
    rawItems: ''
  })
  const [errors, setErrors] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const validationErrors = validateCustomListData(formData)
    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      setIsSubmitting(false)
      return
    }

    try {
      const newList = createCustomList(formData)

      // Save to local storage
      setCustomLists(prev => [...prev, newList])

      // Set as active list
      setSettings(prev => ({ ...prev, activeListId: newList.id }))

      setShowSuccess(true)

      // Navigate back to dashboard after a brief success message
      setTimeout(() => {
        navigate('/app/dashboard')
      }, 1500)
    } catch (error) {
      setErrors(['Failed to create list. Please try again.'])
    } finally {
      setIsSubmitting(false)
    }
  }

  const exampleText = `Example format:

Simple list (one item per line):
Tree
Mountain
Car
Person

Or with categories:
Nature:
Tree
Mountain
River

Vehicles:
Car
Bicycle
Airplane`

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">List Created!</h2>
            <p className="text-gray-600 mb-4">
              "{formData.name}" has been created and set as your active list.
            </p>
            <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/browse-lists')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Browse Lists
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Training List</h1>
              <p className="text-gray-600">Design your own collection of drawing subjects</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <h4 className="font-medium text-red-800 mb-2">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'Character Design Essentials', 'Urban Sketching', 'Fantasy Creatures'"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this list is about and who would benefit from it..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Help others understand the purpose and focus of your training list.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Your name or username"
                    value={formData.creator}
                    onChange={(e) => setFormData(prev => ({ ...prev, creator: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Social Link (optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Your portfolio, Instagram, Twitter, etc."
                    value={formData.socialLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, socialLink: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Drawing Subjects *
                  </label>
                  <textarea
                    placeholder={exampleText}
                    value={formData.rawItems}
                    onChange={(e) => setFormData(prev => ({ ...prev, rawItems: e.target.value }))}
                    rows={16}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter one subject per line. Use "Category:" headers to organize items into groups.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/browse-lists')}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Check size={18} />
                        Create List
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Tips */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-900">Pro Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-blue-800">
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Start with broad subjects, then add specific variations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Mix simple and complex subjects for balanced practice</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Use categories to organize related subjects together</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400">•</span>
                  <span>Aim for 20-50 subjects for a good practice session</span>
                </li>
              </ul>
            </div>

            {/* Format Guide */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-gray-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Format Examples</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Simple List:</h4>
                  <div className="bg-white p-3 rounded border font-mono text-xs text-gray-600">
                    Tree<br />
                    Mountain<br />
                    Car<br />
                    Person
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">With Categories:</h4>
                  <div className="bg-white p-3 rounded border font-mono text-xs text-gray-600">
                    Animals:<br />
                    Cat<br />
                    Dog<br />
                    <br />
                    Objects:<br />
                    Chair<br />
                    Lamp
                  </div>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="bg-green-50 rounded-xl p-6 border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">Your Lists</h3>
              <p className="text-sm text-green-700">
                You currently have <strong>{customLists.length}</strong> custom training lists.
              </p>
              {customLists.length > 0 && (
                <button
                  onClick={() => navigate('/browse-lists')}
                  className="text-green-600 hover:text-green-700 text-sm font-medium mt-2 transition-colors"
                >
                  View all lists →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}