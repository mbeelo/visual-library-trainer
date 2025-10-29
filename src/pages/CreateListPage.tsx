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
    creator: 'Anonymous', // Default value for hidden field
    socialLink: '', // Keep as optional, hidden from UI
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
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-slate-800 border border-orange-500/20 rounded-xl shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">List Created!</h2>
            <p className="text-slate-300 mb-4">
              "{formData.name}" has been created and set as your active list.
            </p>
            <p className="text-sm text-slate-400">Redirecting to dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Browse Lists
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-orange-400 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-slate-900" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Training List</h1>
              <p className="text-slate-300">Design your own collection of drawing subjects</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 rounded-xl shadow-sm border border-orange-500/20 p-8">
              {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <h4 className="font-medium text-red-400 mb-2">Please fix the following errors:</h4>
                  <ul className="text-sm text-red-300 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    List Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 'Character Design Essentials', 'Urban Sketching', 'Fantasy Creatures'"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Describe what this list is about and who would benefit from it..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400"
                  />
                  <p className="text-sm text-slate-400 mt-1">
                    Help others understand the purpose and focus of your training list.
                  </p>
                </div>

                {/* Hidden fields for launch - keeping data structure intact */}

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Drawing Subjects *
                  </label>
                  <textarea
                    placeholder={exampleText}
                    value={formData.rawItems}
                    onChange={(e) => setFormData(prev => ({ ...prev, rawItems: e.target.value }))}
                    rows={16}
                    className="w-full px-4 py-3 border border-slate-600 bg-slate-700 text-white placeholder-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 font-mono text-sm"
                    required
                  />
                  <p className="text-sm text-slate-400 mt-2">
                    Enter one subject per line. Use "Category:" headers to organize items into groups.
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/app/dashboard')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors border border-orange-500/20"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-400 hover:bg-orange-500 disabled:bg-orange-300 text-slate-900 font-medium py-3 px-6 rounded-lg transition-colors inline-flex items-center justify-center gap-2"
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
            <div className="bg-orange-500/10 rounded-xl p-6 border border-orange-500/20">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
                  <Lightbulb className="w-4 h-4 text-slate-900" />
                </div>
                <h3 className="font-semibold text-white">Pro Tips</h3>
              </div>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Start with broad subjects, then add specific variations</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Mix simple and complex subjects for balanced practice</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Use categories to organize related subjects together</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-orange-400">•</span>
                  <span>Aim for 20-50 subjects for a good practice session</span>
                </li>
              </ul>
            </div>

            {/* Format Guide */}
            <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-slate-300" />
                </div>
                <h3 className="font-semibold text-white">Format Examples</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium text-slate-300 mb-2">Simple List:</h4>
                  <div className="bg-slate-800 p-3 rounded border border-slate-600 font-mono text-xs text-slate-300">
                    Tree<br />
                    Mountain<br />
                    Car<br />
                    Person
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-slate-300 mb-2">With Categories:</h4>
                  <div className="bg-slate-800 p-3 rounded border border-slate-600 font-mono text-xs text-slate-300">
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
            <div className="bg-green-500/10 rounded-xl p-6 border border-green-500/20">
              <h3 className="font-semibold text-white mb-2">Your Lists</h3>
              <p className="text-sm text-slate-300">
                You currently have <strong>{customLists.length}</strong> custom training lists.
              </p>
              {customLists.length > 0 && (
                <button
                  onClick={() => navigate('/app/dashboard')}
                  className="text-green-400 hover:text-green-300 text-sm font-medium mt-2 transition-colors"
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