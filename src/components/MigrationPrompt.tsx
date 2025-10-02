import { useState, useEffect } from 'react'
import { Cloud, Check, AlertCircle, Loader2, X } from 'lucide-react'
import { DataMigrationService } from '../services/dataMigration'
import { useAuth } from '../contexts/AuthContext'

interface MigrationPromptProps {
  onComplete: () => void
}

export function MigrationPrompt({ onComplete }: MigrationPromptProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [summary, setSummary] = useState({
    historyCount: 0,
    customListsCount: 0,
    ratingsCount: 0,
    hasSettings: false
  })
  const [migrationResult, setMigrationResult] = useState<{
    success: boolean
    migratedItems: string[]
    errors: string[]
  } | null>(null)

  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      checkForLocalData()
    }
  }, [user])

  const checkForLocalData = () => {
    const dataSummary = DataMigrationService.getLocalDataSummary()
    setSummary(dataSummary)

    // Show prompt if user has local data to migrate
    const hasLocalData = dataSummary.historyCount > 0 ||
                        dataSummary.customListsCount > 0 ||
                        dataSummary.ratingsCount > 0

    if (hasLocalData) {
      setIsOpen(true)
    }
  }

  const handleMigrate = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const result = await DataMigrationService.migrateAllData(user.id)
      setMigrationResult(result)

      if (result.success) {
        // Clear localStorage after successful migration
        DataMigrationService.clearLocalStorage()
        setTimeout(() => {
          setIsOpen(false)
          onComplete()
        }, 3000)
      }
    } catch (error) {
      console.error('Migration failed:', error)
      setMigrationResult({
        success: false,
        migratedItems: [],
        errors: ['Migration failed due to unexpected error']
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    setIsOpen(false)
    onComplete()
  }

  if (!isOpen || !user) return null


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        {!migrationResult ? (
          <>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Cloud className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Save Your Progress</h2>
                <p className="text-sm text-gray-600">We found local data that can be synced to the cloud</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-900 mb-3">Data to migrate:</h3>
              <div className="space-y-2 text-sm">
                {summary.historyCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{summary.historyCount} practice sessions</span>
                  </div>
                )}
                {summary.customListsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{summary.customListsCount} custom training lists</span>
                  </div>
                )}
                {summary.ratingsCount > 0 && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{summary.ratingsCount} subject ratings</span>
                  </div>
                )}
                {summary.hasSettings && (
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>App preferences</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium">Why migrate?</p>
                  <p>Your data will be saved to the cloud and accessible from any device. You won't lose your progress if you clear your browser data.</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Cloud className="w-4 h-4" />
                    Save to Cloud
                  </>
                )}
              </button>
              <button
                onClick={handleSkip}
                disabled={isLoading}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Skip
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Migration Result */}
            <div className="text-center">
              {migrationResult.success ? (
                <>
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Migration Complete!</h2>
                  <p className="text-gray-600 mb-4">Your data has been successfully saved to the cloud.</p>

                  <div className="bg-green-50 rounded-lg p-3 mb-4">
                    <div className="text-sm text-green-800">
                      <p className="font-medium mb-1">Migrated:</p>
                      <ul className="text-left">
                        {migrationResult.migratedItems.map((item, index) => (
                          <li key={index}>• {item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs text-gray-500">This dialog will close automatically...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Migration Failed</h2>
                  <p className="text-gray-600 mb-4">Some items couldn't be migrated. You can try again later.</p>

                  {migrationResult.errors.length > 0 && (
                    <div className="bg-red-50 rounded-lg p-3 mb-4">
                      <div className="text-sm text-red-800">
                        <p className="font-medium mb-1">Errors:</p>
                        <ul className="text-left">
                          {migrationResult.errors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSkip}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}