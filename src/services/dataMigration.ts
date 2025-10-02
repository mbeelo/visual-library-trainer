import { supabase } from '../lib/supabase'
import { HistoryEntry, TrainingList } from '../types'

export class DataMigrationService {
  // Check if user has existing cloud data
  static async hasCloudData(userId: string): Promise<boolean> {
    const { count } = await supabase
      .from('practice_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return (count || 0) > 0
  }

  // Migrate practice history to cloud
  static async migratePracticeHistory(userId: string, history: HistoryEntry[]): Promise<void> {
    if (history.length === 0) return

    const sessions = history.map(entry => ({
      user_id: userId,
      subject: entry.item,
      duration: entry.time,
      rating: entry.rating === 'easy' ? 4 :
              entry.rating === 'got-it' ? 3 :
              entry.rating === 'struggled' ? 2 : 1,
      images_used: 0, // No image data in old format
      created_at: entry.date.toISOString()
    }))

    const { error } = await supabase
      .from('practice_sessions')
      .insert(sessions)

    if (error) {
      console.error('Error migrating practice history:', error)
      throw error
    }
  }

  // Migrate custom lists to cloud
  static async migrateCustomLists(userId: string, customLists: TrainingList[]): Promise<void> {
    if (customLists.length === 0) return

    const lists = customLists.map(list => ({
      user_id: userId,
      name: list.name,
      items: Object.values(list.categories).flat(),
      is_active: false, // Will be set by settings migration
      created_at: list.createdAt?.toISOString() || new Date().toISOString()
    }))

    const { error } = await supabase
      .from('custom_lists')
      .insert(lists)

    if (error) {
      console.error('Error migrating custom lists:', error)
      throw error
    }
  }

  // Migrate all localStorage data for a user
  static async migrateAllData(userId: string): Promise<{
    success: boolean
    migratedItems: string[]
    errors: string[]
  }> {
    const migratedItems: string[] = []
    const errors: string[] = []

    try {
      // Check if user already has cloud data
      const hasExistingData = await this.hasCloudData(userId)
      if (hasExistingData) {
        return {
          success: false,
          migratedItems: [],
          errors: ['User already has cloud data - migration skipped to prevent duplicates']
        }
      }

      // Get localStorage data
      const historyData = localStorage.getItem('vlt-history')
      const customListsData = localStorage.getItem('vlt-custom-lists')
      const settingsData = localStorage.getItem('vlt-settings')

      // Migrate practice history
      if (historyData) {
        try {
          const history: HistoryEntry[] = JSON.parse(historyData).map((entry: any) => ({
            ...entry,
            date: new Date(entry.date)
          }))
          await this.migratePracticeHistory(userId, history)
          migratedItems.push(`${history.length} practice sessions`)
        } catch (error) {
          errors.push('Failed to migrate practice history')
          console.error('History migration error:', error)
        }
      }

      // Migrate custom lists
      if (customListsData) {
        try {
          const customLists: TrainingList[] = JSON.parse(customListsData).map((list: any) => ({
            ...list,
            createdAt: list.createdAt ? new Date(list.createdAt) : new Date()
          }))
          await this.migrateCustomLists(userId, customLists)
          migratedItems.push(`${customLists.length} custom lists`)
        } catch (error) {
          errors.push('Failed to migrate custom lists')
          console.error('Custom lists migration error:', error)
        }
      }

      // Create user profile with settings
      if (settingsData) {
        try {
          JSON.parse(settingsData) // Validate settings format
          const { error } = await supabase
            .from('users')
            .upsert({
              id: userId,
              email: '', // Will be updated by auth context
              subscription_tier: 'free'
            })

          if (error && error.code !== '23505') { // Ignore duplicate key error
            throw error
          }
          migratedItems.push('user settings')
        } catch (error) {
          errors.push('Failed to migrate settings')
          console.error('Settings migration error:', error)
        }
      }

      return {
        success: errors.length === 0,
        migratedItems,
        errors
      }
    } catch (error) {
      console.error('Migration error:', error)
      return {
        success: false,
        migratedItems,
        errors: ['Unexpected error during migration']
      }
    }
  }

  // Clear localStorage after successful migration
  static clearLocalStorage(): void {
    const keysToRemove = [
      'vlt-history',
      'vlt-ratings',
      'vlt-custom-lists',
      'vlt-settings'
    ]

    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
    })
  }

  // Get summary of localStorage data for migration preview
  static getLocalDataSummary(): {
    historyCount: number
    customListsCount: number
    ratingsCount: number
    hasSettings: boolean
  } {
    const historyData = localStorage.getItem('vlt-history')
    const customListsData = localStorage.getItem('vlt-custom-lists')
    const ratingsData = localStorage.getItem('vlt-ratings')
    const settingsData = localStorage.getItem('vlt-settings')

    return {
      historyCount: historyData ? JSON.parse(historyData).length : 0,
      customListsCount: customListsData ? JSON.parse(customListsData).length : 0,
      ratingsCount: ratingsData ? Object.keys(JSON.parse(ratingsData)).length : 0,
      hasSettings: !!settingsData
    }
  }
}