import { supabase } from '../lib/supabase'

export interface SimpleImage {
  id: string
  user_id: string
  drawing_subject: string
  image_url: string
  position: number
  notes: string | null
  created_at: string
}

export interface SimpleImageInput {
  image_url: string
  notes?: string
}

export interface SimpleImageFileInput {
  file: File
  notes?: string
}

export class SimpleImageService {
  // Simple cache to prevent redundant bulk queries
  private static bulkCache: Map<string, { data: Record<string, SimpleImage[]>, timestamp: number }> = new Map()
  private static CACHE_DURATION = 30000 // 30 seconds

  // Get ALL user images at once for bulk loading (dashboard optimization)
  static async getAllUserImages(userId: string): Promise<Record<string, SimpleImage[]>> {
    console.log('🔍 SimpleImageService.getAllUserImages called for userId:', userId)

    if (!userId) {
      console.error('❌ Missing userId parameter')
      return {}
    }

    // Check cache first
    const cached = this.bulkCache.get(userId)
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('📦 Using cached bulk data for userId:', userId, '| Age:', Math.round((Date.now() - cached.timestamp) / 1000), 'seconds')
      return cached.data
    }

    // Retry logic for better reliability
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`🚀 Starting bulk Supabase query (attempt ${attempt}/2) for all user images...`)

        const queryPromise = supabase
          .from('image_collections')
          .select('*')
          .eq('user_id', userId)
          .order('drawing_subject', { ascending: true })
          .order('position', { ascending: true })

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log(`⏱️ Bulk query timeout reached on attempt ${attempt}!`)
            reject(new Error(`Bulk query timeout after 10 seconds (attempt ${attempt})`))
          }, 10000)
        })

        console.log(`🔍 Executing bulk query with timeout (attempt ${attempt})...`)
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

        console.log(`📊 Bulk Supabase query completed (attempt ${attempt}):`, { error, count: data?.length || 0 })

        if (error) {
          console.error(`❌ Error fetching all user images (attempt ${attempt}):`, error)
          if (attempt === 2) return {} // Last attempt failed
          continue // Try again
        }

        // Success! Group images by subject
        const imagesBySubject: Record<string, SimpleImage[]> = {}
        if (data) {
          data.forEach((image: SimpleImage) => {
            if (!imagesBySubject[image.drawing_subject]) {
              imagesBySubject[image.drawing_subject] = []
            }
            imagesBySubject[image.drawing_subject].push(image)
          })
        }

        console.log(`✅ SimpleImageService.getAllUserImages success on attempt ${attempt}:`, Object.keys(imagesBySubject).length, 'subjects with images')

        // Cache the result
        this.bulkCache.set(userId, {
          data: imagesBySubject,
          timestamp: Date.now()
        })

        return imagesBySubject
      } catch (err) {
        console.error(`💥 Exception in getAllUserImages (attempt ${attempt}):`, err)
        if (err instanceof Error && err.message.includes('timeout')) {
          console.error(`⏱️ Bulk query timed out after 10 seconds on attempt ${attempt}`)
        }
        if (attempt === 2) {
          console.error('🚨 All retry attempts failed - returning empty object to prevent UI hang')
          return {}
        }
        // Continue to next attempt
      }
    }

    // Should never reach here, but just in case
    return {}
  }

  // Get all images for a subject (using existing image_collections table)
  static async getImages(subject: string, userId: string): Promise<SimpleImage[]> {
    console.log('🔍 SimpleImageService.getImages called with:', { subject, userId })

    // Validate inputs
    if (!userId || !subject) {
      console.error('❌ Missing required parameters:', { subject, userId })
      return []
    }

    try {
      console.log('🚀 Starting Supabase query...')

      // Skip auth check for now since it's hanging - just try the query directly
      console.log('🔍 Skipping auth check, attempting direct query...')

      // Emergency performance fix: Only do debug on first call
      if (subject === 'Chair') {
        console.log('🔍 Debug: Checking all user data in image_collections...')
        const debugPromise = supabase
          .from('image_collections')
          .select('drawing_subject, image_url')
          .eq('user_id', userId)
          .limit(20)

        try {
          const debugUser = await debugPromise
          console.log('🔍 All saved subjects for user:', debugUser.data?.map(d => d.drawing_subject))
        } catch (debugError) {
          console.log('🔍 Debug queries failed:', debugError)
        }
      }

      // Create a simple timeout
      const queryPromise = supabase
        .from('image_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('drawing_subject', subject)
        .order('position', { ascending: true })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏱️ Query timeout reached!')
          reject(new Error('Query timeout after 3 seconds'))
        }, 3000)
      })

      console.log('🔍 Executing query with timeout...')
      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      console.log('📊 Supabase query completed:', { data, error, count: data?.length || 0 })

      if (error) {
        console.error('❌ Error fetching images:', error)
        return []
      }

      const result = data || []
      console.log('✅ SimpleImageService.getImages returning:', result.length, 'images')
      return result
    } catch (err) {
      console.error('💥 Exception in getImages:', err)
      if (err instanceof Error && err.message.includes('timeout')) {
        console.error('⏱️ Query timed out - returning empty array to prevent UI hang')
      }
      return []
    }
  }

  // Upload file to Supabase Storage and return public URL
  static async uploadFile(file: File, userId: string, subject: string): Promise<string> {
    console.log('📁 Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      userId,
      subject
    })

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, WebP, HEIC, or HEIF images.')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('File too large. Please upload images smaller than 10MB.')
    }

    try {
      // Generate unique filename with timestamp and random suffix
      const timestamp = Date.now()
      const randomSuffix = Math.random().toString(36).substring(2, 8)
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg'

      // Convert HEIC/HEIF extensions to more compatible format for storage
      const storageExt = (fileExt === 'heic' || fileExt === 'heif') ? 'jpg' : fileExt
      const fileName = `${userId}/${subject}/${timestamp}_${randomSuffix}.${storageExt}`

      console.log('📤 Uploading file to path:', fileName)

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('user-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (error) {
        console.error('❌ Upload error:', error)
        throw new Error(`Upload failed: ${error.message}`)
      }

      console.log('✅ File uploaded successfully:', data)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('user-images')
        .getPublicUrl(fileName)

      console.log('🔗 Generated public URL:', urlData.publicUrl)

      return urlData.publicUrl
    } catch (err) {
      console.error('💥 Exception in uploadFile:', err)
      throw err
    }
  }

  // Add image from file upload
  static async addImageFromFile(subject: string, fileInput: SimpleImageFileInput, userId: string): Promise<SimpleImage> {
    console.log('📁 addImageFromFile called with:', { subject, userId, fileName: fileInput.file.name })

    try {
      // Upload file and get URL
      const imageUrl = await this.uploadFile(fileInput.file, userId, subject)

      // Use existing addImage method with the generated URL
      return await this.addImage(subject, {
        image_url: imageUrl,
        notes: fileInput.notes
      }, userId)
    } catch (err) {
      console.error('💥 Exception in addImageFromFile:', err)
      throw err
    }
  }

  // Add image (using existing image_collections table)
  static async addImage(subject: string, imageInput: SimpleImageInput, userId: string): Promise<SimpleImage> {
    console.log('🔧 addImage called with:', { subject, userId, imageInput })

    try {
      // Get next position with timeout
      console.log('🔍 Getting next position...')
      const positionPromise = supabase
        .from('image_collections')
        .select('position')
        .eq('user_id', userId)
        .eq('drawing_subject', subject)
        .order('position', { ascending: false })
        .limit(1)

      const positionTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Position query timeout')), 5000)
      })

      const { data: existingImages, error: positionError } = await Promise.race([positionPromise, positionTimeout]) as any

      if (positionError) {
        console.error('❌ Error getting position:', positionError)
        throw positionError
      }

      const nextPosition = existingImages && existingImages.length > 0
        ? existingImages[0].position + 1
        : 0

      console.log('📍 Next position:', nextPosition)

      // Check for duplicates with timeout
      console.log('🔍 Checking for duplicates...')
      const duplicatePromise = supabase
        .from('image_collections')
        .select('id')
        .eq('user_id', userId)
        .eq('drawing_subject', subject)
        .eq('image_url', imageInput.image_url)

      const duplicateTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Duplicate check timeout')), 5000)
      })

      const { data: duplicateCheck, error: duplicateError } = await Promise.race([duplicatePromise, duplicateTimeout]) as any

      if (duplicateError) {
        console.error('❌ Error checking duplicates:', duplicateError)
        throw duplicateError
      }

      if (duplicateCheck && duplicateCheck.length > 0) {
        console.log('❌ Duplicate image found')
        throw new Error('This image is already in your collection')
      }

      // Insert new image with timeout
      console.log('💾 Inserting new image...')
      const insertData = {
        user_id: userId,
        drawing_subject: subject,
        image_url: imageInput.image_url,
        position: nextPosition,
        notes: imageInput.notes || null
      }
      console.log('📝 Insert data:', insertData)

      const insertPromise = supabase
        .from('image_collections')
        .insert([insertData])
        .select()
        .single()

      const insertTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Insert timeout')), 10000)
      })

      const { data, error } = await Promise.race([insertPromise, insertTimeout]) as any

      if (error) {
        console.error('❌ Error adding image:', error)
        throw error
      }

      console.log('✅ Image added successfully:', data)

      // Invalidate cache when image is added
      this.bulkCache.delete(userId)

      return data
    } catch (err) {
      console.error('💥 Exception in addImage:', err)
      throw err
    }
  }

  // Remove image
  static async removeImage(imageId: string): Promise<void> {
    const { error } = await supabase
      .from('image_collections')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('Error removing image:', error)
      throw error
    }

    // Invalidate all cache when image is removed (we don't know which user it belonged to)
    this.bulkCache.clear()
  }

  // Update image notes
  static async updateImageNotes(imageId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('image_collections')
      .update({ notes })
      .eq('id', imageId)

    if (error) {
      console.error('Error updating image notes:', error)
      throw error
    }
  }

  // Check if user can add more images (free tier limit)
  static async canAddImage(subject: string, subscriptionTier: 'free' | 'pro', userId: string): Promise<boolean> {
    if (subscriptionTier === 'pro') {
      return true
    }

    const { count, error } = await supabase
      .from('image_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('drawing_subject', subject)

    if (error) {
      throw error
    }

    return (count || 0) < 3 // Free tier limit: 3 images per subject
  }

  // Validate image file
  static validateImageFile(file: File): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Please upload JPEG, PNG, GIF, WebP, HEIC, or HEIF images.' }
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File too large. Please upload images smaller than 10MB.' }
    }

    return { valid: true }
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