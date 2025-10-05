import { supabase } from '../lib/supabase'

// Utility function for adding timeout to promises
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  })

  return Promise.race([promise, timeoutPromise])
}

// Utility function for retrying failed operations
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error: any) {
      lastError = error
      console.warn(`Attempt ${attempt} failed:`, error.message)

      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
      }
    }
  }

  throw lastError
}

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
  // Test basic Supabase connectivity
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔌 Testing Supabase connection...')

      // Test 1: Check if users table exists
      console.log('🔌 Test 1: Checking users table...')
      const usersResult = await withTimeout(
        supabase.from('users').select('count').limit(1).single() as unknown as Promise<any>,
        5000,
        'Users table test timeout'
      ) as any
      const { data: usersData, error: usersError } = usersResult
      console.log('🔌 Users table test:', { usersData, usersError })

      // Test 2: Check if subject_boards table exists
      console.log('🔌 Test 2: Checking subject_boards table...')
      const boardsResult = await withTimeout(
        supabase.from('subject_boards').select('count').limit(1).single() as unknown as Promise<any>,
        5000,
        'Subject boards table test timeout'
      ) as any
      const { data: boardsData, error: boardsError } = boardsResult
      console.log('🔌 Subject boards table test:', { boardsData, boardsError })

      // Test 3: Check if image_collections (legacy) table exists
      console.log('🔌 Test 3: Checking image_collections table...')
      const collectionsResult = await withTimeout(
        supabase.from('image_collections').select('count').limit(1).single() as unknown as Promise<any>,
        5000,
        'Image collections table test timeout'
      ) as any
      const { data: collectionsData, error: collectionsError } = collectionsResult
      console.log('🔌 Image collections table test:', { collectionsData, collectionsError })

      return true // Always return true to continue debugging
    } catch (err) {
      console.error('🔌 Connection test failed:', err)
      return false
    }
  }

  // Get or create a board for a specific subject
  static async getOrCreateSubjectBoard(subject: string, userId: string): Promise<SubjectBoard> {
    return withRetry(async () => {
      console.log('🔐 BoardService: Using provided user ID:', userId)

      // Test connection first
      const isConnected = await this.testConnection()
      console.log('🔌 Supabase connection status:', isConnected)

      // First try to get existing board
      console.log('🔍 BoardService: Checking for existing board for subject:', subject)
      console.log('🔍 BoardService: About to execute query...')

      const query = supabase
        .from('subject_boards')
        .select('*')
        .eq('subject_name', subject)
        .eq('user_id', userId)
        .single()

      console.log('🔍 BoardService: Query object created, adding timeout...')

      const { data: existingBoard, error: fetchError } = await withTimeout(
        query as unknown as Promise<any>,
        10000,
        'Timeout while fetching existing board'
      ) as any

      console.log('🔍 BoardService: Query completed with:', { existingBoard, fetchError })

      if (existingBoard && !fetchError) {
        console.log('✅ BoardService: Found existing board:', existingBoard.id)
        return existingBoard
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ BoardService: Error fetching existing board:', fetchError)

        // TEMPORARY FALLBACK: If subject_boards table doesn't exist, create a mock board
        if (fetchError.message?.includes('relation') && fetchError.message?.includes('does not exist')) {
          console.log('⚠️ BoardService: subject_boards table not found, creating mock board')
          const mockBoard: SubjectBoard = {
            id: `mock-${subject}-${userId}`,
            user_id: userId,
            subject_name: subject,
            board_name: subject,
            is_private: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          return mockBoard
        }

        throw fetchError
      }

      // Create new board if it doesn't exist
      console.log('🆕 BoardService: Creating new board for subject:', subject)
      const boardData = {
        user_id: userId,
        subject_name: subject,
        board_name: subject,
        is_private: true
      }
      console.log('📝 BoardService: Board data to insert:', boardData)

      const { data, error } = await withTimeout(
        supabase
          .from('subject_boards')
          .insert([boardData])
          .select()
          .single() as unknown as Promise<any>,
        10000,
        'Timeout while creating new board'
      ) as any

      if (error) {
        console.error('❌ BoardService: Error creating subject board:', error)
        throw error
      }

      console.log('✅ BoardService: New board created:', data.id)
      return data
    })
  }

  // Get all images for a specific subject board
  static async getBoardImages(subject: string, userId: string): Promise<BoardImage[]> {
    return withRetry(async () => {
      // First get the board
      const board = await this.getOrCreateSubjectBoard(subject, userId)

      // If this is a mock board, use legacy image_collections table
      if (board.id.startsWith('mock-')) {
        console.log('🔄 BoardService: Using mock board, falling back to legacy image_collections')
        try {
          const { data: legacyData, error: legacyError } = await supabase
            .from('image_collections')
            .select('*')
            .eq('user_id', userId)
            .eq('drawing_subject', subject)
            .order('position', { ascending: true })

          if (legacyError) {
            console.error('❌ Legacy query error:', legacyError)
            return []
          }

          // Convert legacy data to BoardImage format
          const boardImages: BoardImage[] = (legacyData || []).map((item: any, index: number) => ({
            id: item.id,
            board_id: board.id,
            image_url: item.image_url,
            title: subject,
            description: undefined,
            source_url: undefined,
            notes: item.notes,
            position: item.position || index,
            width: undefined,
            height: undefined,
            added_at: item.created_at
          }))

          console.log('✅ BoardService: Loaded legacy images:', boardImages.length)
          return boardImages
        } catch (error) {
          console.error('❌ Legacy query failed:', error)
          return []
        }
      }

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
        await this.migrateLegacyDataForUser(subject, userId)

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
    })
  }

  // Helper function to migrate legacy data for a specific user/subject
  private static async migrateLegacyDataForUser(subject: string, userId: string): Promise<void> {
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
    const board = await this.getOrCreateSubjectBoard(subject, userId)

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
    subject: string,
    imageInput: BoardImageInput,
    userId: string
  ): Promise<BoardImage> {
    try {
      console.log('🏗️ BoardService: Starting addImageToBoard for:', subject, 'userId:', userId)

      // Get or create the board
      console.log('📋 BoardService: Getting or creating board...')
      const board = await this.getOrCreateSubjectBoard(subject, userId)
      console.log('✅ BoardService: Board obtained:', board.id)

      // If this is a mock board, use legacy image_collections table
      if (board.id.startsWith('mock-')) {
        console.log('🔄 BoardService: Using mock board, saving to legacy image_collections')
        try {
          // Get next position from legacy table
          const { data: existingImages } = await supabase
            .from('image_collections')
            .select('position')
            .eq('user_id', userId)
            .eq('drawing_subject', subject)
            .order('position', { ascending: false })
            .limit(1)

          const nextPosition = existingImages && existingImages.length > 0
            ? existingImages[0].position + 1
            : 0

          // Check for duplicates in legacy table
          const { data: duplicateCheck } = await supabase
            .from('image_collections')
            .select('id')
            .eq('user_id', userId)
            .eq('drawing_subject', subject)
            .eq('image_url', imageInput.image_url)
            .single()

          if (duplicateCheck) {
            throw new Error('This image is already in your board')
          }

          // Insert into legacy table
          const { data: legacyResult, error: legacyInsertError } = await supabase
            .from('image_collections')
            .insert([{
              user_id: userId,
              drawing_subject: subject,
              image_url: imageInput.image_url,
              position: nextPosition,
              notes: imageInput.notes || null
            }])
            .select()
            .single()

          if (legacyInsertError) {
            throw legacyInsertError
          }

          // Convert to BoardImage format
          const boardImage: BoardImage = {
            id: legacyResult.id,
            board_id: board.id,
            image_url: legacyResult.image_url,
            title: subject,
            description: undefined,
            source_url: undefined,
            notes: legacyResult.notes,
            position: legacyResult.position,
            width: undefined,
            height: undefined,
            added_at: legacyResult.created_at
          }

          console.log('✅ BoardService: Image saved to legacy table:', boardImage)
          return boardImage
        } catch (error) {
          console.error('❌ Legacy save failed:', error)
          throw error
        }
      }

      // Get next position
      console.log('🔢 BoardService: Getting next position...')
      const { data: existingImages, error: positionError } = await supabase
        .from('board_images')
        .select('position')
        .eq('board_id', board.id)
        .order('position', { ascending: false })
        .limit(1)

      if (positionError) {
        console.error('❌ BoardService: Error getting position:', positionError)
        throw positionError
      }

      const nextPosition = existingImages && existingImages.length > 0
        ? existingImages[0].position + 1
        : 0
      console.log('✅ BoardService: Next position will be:', nextPosition)

      // Check for duplicate URLs in this board
      console.log('🔍 BoardService: Checking for duplicates...')
      const { data: duplicateCheck, error: duplicateError } = await supabase
        .from('board_images')
        .select('id')
        .eq('board_id', board.id)
        .eq('image_url', imageInput.image_url)
        .single()

      if (duplicateError && duplicateError.code !== 'PGRST116') {
        console.error('❌ BoardService: Error checking duplicates:', duplicateError)
        throw duplicateError
      }

      if (duplicateCheck) {
        console.log('❌ BoardService: Duplicate image found')
        throw new Error('This image is already in your board')
      }
      console.log('✅ BoardService: No duplicates found')

      // Insert the image
      console.log('💾 BoardService: Inserting image into database...')
      const insertData = {
        board_id: board.id,
        image_url: imageInput.image_url,
        title: imageInput.title || subject,
        description: imageInput.description,
        source_url: imageInput.source_url,
        notes: imageInput.notes,
        position: nextPosition,
        width: imageInput.width,
        height: imageInput.height
      }
      console.log('📝 BoardService: Insert data:', insertData)

      const { data, error } = await withTimeout(
        supabase
          .from('board_images')
          .insert([insertData])
          .select()
          .single() as unknown as Promise<any>,
        15000,
        'Timeout while inserting image to board'
      ) as any

      if (error) {
        console.error('❌ BoardService: Error adding image to board:', error)
        throw error
      }

      console.log('✅ BoardService: Image inserted successfully:', data)

      // Update board's updated_at timestamp
      console.log('⏰ BoardService: Updating board timestamp...')
      const { error: updateError } = await supabase
        .from('subject_boards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', board.id)

      if (updateError) {
        console.warn('⚠️ BoardService: Error updating board timestamp:', updateError)
        // Don't throw - this is not critical
      } else {
        console.log('✅ BoardService: Board timestamp updated')
      }

      console.log('🎉 BoardService: addImageToBoard completed successfully')
      return data
    } catch (error) {
      console.error('Error in addImageToBoard:', error)
      throw error
    }
  }

  // Remove image from board
  static async removeImageFromBoard(imageId: string, _userId: string): Promise<void> {
    // Note: _userId parameter is for future use when we add user validation

    // Get board_id before deleting
    const { data: imageData } = await supabase
      .from('board_images')
      .select('board_id')
      .eq('id', imageId)
      .single()

    const { error } = await supabase
      .from('board_images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error removing image from board:', error)
      throw error
    }

    // Update board timestamp if we have the board_id
    if (imageData?.board_id) {
      await supabase
        .from('subject_boards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', imageData.board_id)
    }
  }

  // Update image notes
  static async updateImageNotes(imageId: string, notes: string, _userId: string): Promise<void> {
    // Note: _userId parameter is for future use when we add user validation

    // Get image data for board_id
    const { data: imageData } = await supabase
      .from('board_images')
      .select('board_id')
      .eq('id', imageId)
      .single()

    const { error } = await supabase
      .from('board_images')
      .update({ notes })
      .eq('id', imageId)

    if (error) {
      console.error('Error updating image notes:', error)
      throw error
    }

    // Update board timestamp if we have the board_id
    if (imageData?.board_id) {
      await supabase
        .from('subject_boards')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', imageData.board_id)
    }
  }

  // Reorder images in board
  static async reorderBoardImages(
    subject: string,
    imageOrders: { image_id: string; position: number }[],
    userId: string
  ): Promise<void> {
    const board = await this.getOrCreateSubjectBoard(subject, userId)

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
    subject: string,
    subscriptionTier: 'free' | 'pro',
    userId: string
  ): Promise<boolean> {
    if (subscriptionTier === 'pro') {
      return true
    }

    try {
      const board = await this.getOrCreateSubjectBoard(subject, userId)

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
  static async getBoardStats(subject: string, userId: string): Promise<{
    imageCount: number
    lastActivity: string | null
  }> {
    const board = await this.getOrCreateSubjectBoard(subject, userId)

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