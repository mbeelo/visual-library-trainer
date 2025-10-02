import { supabase } from '../lib/supabase'

export interface SubjectBoard {
  id: string
  user_id: string
  subject_name: string
  board_name?: string
  description?: string
  cover_image_url?: string
  is_private: boolean
  created_at: string
  updated_at: string
}

export interface BoardImage {
  id: string
  board_id: string
  image_url: string
  title?: string
  description?: string
  source_url?: string
  notes?: string
  position: number
  width?: number
  height?: number
  added_at: string
}

export interface BoardImageInput {
  image_url: string
  title?: string
  description?: string
  source_url?: string
  notes?: string
  width?: number
  height?: number
}

export class BoardService {
  // Get or create a board for a specific subject
  static async getOrCreateSubjectBoard(userId: string, subject: string): Promise<SubjectBoard> {
    // First try to get existing board
    const { data: existingBoard, error: fetchError } = await supabase
      .from('subject_boards')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_name', subject)
      .single()

    if (existingBoard && !fetchError) {
      return existingBoard
    }

    // Create new board if it doesn't exist
    const { data, error } = await supabase
      .from('subject_boards')
      .insert([{
        user_id: userId,
        subject_name: subject,
        board_name: subject,
        is_private: true
      }])
      .select()
      .single()

    if (error) {
      console.error('Error creating subject board:', error)
      throw error
    }

    return data
  }

  // Get all images for a specific subject board
  static async getBoardImages(userId: string, subject: string): Promise<BoardImage[]> {
    // First get the board
    const board = await this.getOrCreateSubjectBoard(userId, subject)

    const { data, error } = await supabase
      .from('board_images')
      .select('*')
      .eq('board_id', board.id)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching board images:', error)
      throw error
    }

    // If no images found in new system, check for legacy data to migrate
    if ((!data || data.length === 0)) {
      try {
        console.log('No images found in board system, checking for legacy data...')
        await this.migrateLegacyDataForUser(userId, subject)

        // Re-fetch after potential migration
        const { data: newData, error: newError } = await supabase
          .from('board_images')
          .select('*')
          .eq('board_id', board.id)
          .order('position', { ascending: true })

        if (newError) {
          console.error('Error fetching board images after migration:', newError)
          return data || []
        }

        return newData || data || []
      } catch (migrationError) {
        console.log('Legacy migration check failed (expected if no legacy data):', migrationError)
        return data || []
      }
    }

    return data || []
  }

  // Helper function to migrate legacy data for a specific user/subject
  private static async migrateLegacyDataForUser(userId: string, subject: string): Promise<void> {
    // Check if there's data in the old image_collections table for this user/subject
    const { data: legacyData, error: legacyError } = await supabase
      .from('image_collections')
      .select('*')
      .eq('user_id', userId)
      .eq('drawing_subject', subject)

    if (legacyError || !legacyData || legacyData.length === 0) {
      return // No legacy data to migrate
    }

    console.log(`Found ${legacyData.length} legacy images for ${subject}, migrating...`)

    // Get the board for this subject
    const board = await this.getOrCreateSubjectBoard(userId, subject)

    // Migrate each legacy image
    for (const legacyImage of legacyData) {
      try {
        await supabase
          .from('board_images')
          .insert([{
            board_id: board.id,
            image_url: legacyImage.image_url,
            title: subject,
            notes: legacyImage.notes,
            position: legacyImage.position || 0,
            added_at: legacyImage.created_at
          }])
          .select()
          .single()

        console.log(`Migrated legacy image: ${legacyImage.image_url}`)
      } catch (insertError: any) {
        // Ignore duplicate errors (image already migrated)
        if (!insertError.message?.includes('duplicate')) {
          console.error('Error migrating legacy image:', insertError)
        }
      }
    }

    // Update board timestamp
    await supabase
      .from('subject_boards')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', board.id)

    console.log(`Successfully migrated ${legacyData.length} images for ${subject}`)
  }

  // Add image to subject board
  static async addImageToBoard(
    userId: string,
    subject: string,
    imageInput: BoardImageInput
  ): Promise<BoardImage> {
    try {
      // Get or create the board
      const board = await this.getOrCreateSubjectBoard(userId, subject)

      // Get next position
      const { data: existingImages } = await supabase
        .from('board_images')
        .select('position')
        .eq('board_id', board.id)
        .order('position', { ascending: false })
        .limit(1)

      const nextPosition = existingImages && existingImages.length > 0
        ? existingImages[0].position + 1
        : 0

      // Check for duplicate URLs in this board
      const { data: duplicateCheck } = await supabase
        .from('board_images')
        .select('id')
        .eq('board_id', board.id)
        .eq('image_url', imageInput.image_url)
        .single()

      if (duplicateCheck) {
        throw new Error('This image is already in your board')
      }

      // Insert the image
      const { data, error } = await supabase
        .from('board_images')
        .insert([{
          board_id: board.id,
          image_url: imageInput.image_url,
          title: imageInput.title || subject,
          description: imageInput.description,
          source_url: imageInput.source_url,
          notes: imageInput.notes,
          position: nextPosition,
          width: imageInput.width,
          height: imageInput.height
        }])
        .select()
        .single()

      if (error) {
        console.error('Error adding image to board:', error)
        throw error
      }

      // Update board's updated_at timestamp
      await supabase
        .from('subject_boards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', board.id)

      return data
    } catch (error) {
      console.error('Error in addImageToBoard:', error)
      throw error
    }
  }

  // Remove image from board
  static async removeImageFromBoard(userId: string, imageId: string): Promise<void> {
    // Verify ownership through board
    const { data: imageData } = await supabase
      .from('board_images')
      .select('board_id, subject_boards!inner(user_id)')
      .eq('id', imageId)
      .single()

    if (!imageData || (imageData as any).subject_boards.user_id !== userId) {
      throw new Error('Unauthorized to delete this image')
    }

    const { error } = await supabase
      .from('board_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error removing image from board:', error)
      throw error
    }

    // Update board timestamp
    await supabase
      .from('subject_boards')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', imageData.board_id)
  }

  // Update image notes
  static async updateImageNotes(userId: string, imageId: string, notes: string): Promise<void> {
    // Verify ownership through board
    const { data: imageData } = await supabase
      .from('board_images')
      .select('board_id, subject_boards!inner(user_id)')
      .eq('id', imageId)
      .single()

    if (!imageData || (imageData as any).subject_boards.user_id !== userId) {
      throw new Error('Unauthorized to update this image')
    }

    const { error } = await supabase
      .from('board_images')
      .update({ notes })
      .eq('id', imageId)

    if (error) {
      console.error('Error updating image notes:', error)
      throw error
    }

    // Update board timestamp
    await supabase
      .from('subject_boards')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', imageData.board_id)
  }

  // Reorder images in board
  static async reorderBoardImages(
    userId: string,
    subject: string,
    imageOrders: { image_id: string; position: number }[]
  ): Promise<void> {
    const board = await this.getOrCreateSubjectBoard(userId, subject)

    // Use the SQL function we created in the migration
    const { error } = await supabase.rpc('reorder_subject_board_images', {
      board_uuid: board.id,
      image_orders: imageOrders
    })

    if (error) {
      console.error('Error reordering board images:', error)
      throw error
    }
  }

  // Check if user can add more images (free tier limit)
  static async canAddImageToBoard(
    userId: string,
    subject: string,
    subscriptionTier: 'free' | 'pro'
  ): Promise<boolean> {
    if (subscriptionTier === 'pro') {
      return true
    }

    try {
      const board = await this.getOrCreateSubjectBoard(userId, subject)

      const { count, error } = await supabase
        .from('board_images')
        .select('*', { count: 'exact', head: true })
        .eq('board_id', board.id)

      if (error) {
        throw error
      }

      return (count || 0) < 3 // Free tier limit: 3 images per subject
    } catch (error) {
      console.error('Error checking image limit:', error)
      throw error
    }
  }

  // Get all boards for a user
  static async getUserBoards(userId: string): Promise<SubjectBoard[]> {
    const { data, error } = await supabase
      .from('subject_boards')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('Error fetching user boards:', error)
      throw error
    }

    return data || []
  }

  // Get board stats
  static async getBoardStats(userId: string, subject: string): Promise<{
    imageCount: number
    lastActivity: string | null
  }> {
    const board = await this.getOrCreateSubjectBoard(userId, subject)

    const { data, error } = await supabase
      .from('board_images')
      .select('added_at')
      .eq('board_id', board.id)
      .order('added_at', { ascending: false })

    if (error) {
      console.error('Error fetching board stats:', error)
      throw error
    }

    return {
      imageCount: data?.length || 0,
      lastActivity: data?.[0]?.added_at || null
    }
  }

  // Validate image URL (reuse from old service)
  static validateImageUrl(url: string): boolean {
    try {
      const parsedUrl = new URL(url)
      const validProtocols = ['http:', 'https:']
      const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp']

      // Check protocol
      if (!validProtocols.includes(parsedUrl.protocol)) {
        return false
      }

      // Check if URL ends with image extension or contains image-related patterns
      const pathname = parsedUrl.pathname.toLowerCase()
      const hasImageExtension = imageExtensions.some(ext => pathname.includes(ext))
      const hasImagePattern = /\.(jpg|jpeg|png|gif|webp|svg|bmp)/i.test(url) ||
                              url.includes('images') ||
                              url.includes('img') ||
                              url.includes('photo') ||
                              url.includes('picture')

      return hasImageExtension || hasImagePattern
    } catch {
      return false
    }
  }
}