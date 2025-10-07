import { supabase } from '../lib/supabase'

export interface SimpleImage {
  id: string
  user_id: string
  list_id: string
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

  // Emergency localStorage fallback for when Supabase is down
  private static FALLBACK_KEY = 'vlt-emergency-images'

  // Emergency localStorage operations
  private static getFallbackImages(userId: string, subject: string): SimpleImage[] {
    try {
      const stored = localStorage.getItem(this.FALLBACK_KEY)
      if (!stored) return []

      const data = JSON.parse(stored)
      const userImages = data[userId] || {}
      return userImages[subject] || []
    } catch (error) {
      console.error('Error reading fallback images:', error)
      return []
    }
  }

  private static saveFallbackImage(userId: string, subject: string, image: Omit<SimpleImage, 'id' | 'created_at'>): SimpleImage {
    try {
      const stored = localStorage.getItem(this.FALLBACK_KEY)
      const data = stored ? JSON.parse(stored) : {}

      if (!data[userId]) data[userId] = {}
      if (!data[userId][subject]) data[userId][subject] = []

      const newImage: SimpleImage = {
        ...image,
        id: Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      }

      data[userId][subject].push(newImage)
      localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(data))

      console.log('💾 Saved image to localStorage fallback:', newImage.id)
      return newImage
    } catch (error) {
      console.error('Error saving fallback image:', error)
      throw error
    }
  }

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

    try {
      console.log('🚀 Starting optimized bulk Supabase query...')

      const queryPromise = supabase
        .from('image_collections')
        .select('*')
        .eq('user_id', userId)
        .order('drawing_subject', { ascending: true })
        .order('position', { ascending: true })

      // Same reasonable timeout as individual queries
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏱️ Bulk query timeout reached after 10 seconds')
          reject(new Error('Bulk query timeout after 10 seconds'))
        }, 10000)
      })

      const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any

      console.log('📊 Bulk Supabase query result:', { error, count: data?.length || 0 })

      if (error) {
        console.error('❌ Error fetching all user images:', error)
        return {}
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

      console.log('✅ Bulk query success:', Object.keys(imagesBySubject).length, 'subjects with images')

      // Cache the result
      this.bulkCache.set(userId, {
        data: imagesBySubject,
        timestamp: Date.now()
      })

      return imagesBySubject
    } catch (err) {
      console.error('💥 Exception in getAllUserImages:', err)
      console.log('🚨 Bulk query failed - returning empty object to prevent UI hang')
      return {}
    }
  }

  // Get all images for a subject in a specific list
  static async getImages(subject: string, listId: string, userId: string): Promise<SimpleImage[]> {
    console.log('🔍 SimpleImageService.getImages called with:', { subject, listId, userId })

    // Validate inputs
    if (!userId || !subject || !listId) {
      console.error('❌ Missing required parameters:', { subject, listId, userId })
      return []
    }

    console.log('📡 Querying image collections...')

    try {
      const startTime = Date.now()

      const { data, error } = await supabase
        .from('image_collections')
        .select('*')
        .eq('user_id', userId)
        .eq('drawing_subject', subject)
        .order('position', { ascending: true })

      const duration = Date.now() - startTime
      console.log(`📊 Supabase query completed in ${duration}ms:`, { error, count: data?.length || 0 })

      if (error) {
        console.error('❌ Supabase error:', error)
        console.log('🚨 Falling back to localStorage due to Supabase error')
        return this.getFallbackImages(userId, subject)
      }

      const result = data || []
      console.log(`✅ SimpleImageService.getImages success:`, result.length, 'images')
      return result
    } catch (err) {
      console.error('💥 Exception in getImages:', err)
      console.log('🚨 Falling back to localStorage due to exception')
      return this.getFallbackImages(userId, subject)
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
  static async addImageFromFile(subject: string, fileInput: SimpleImageFileInput, listId: string, userId: string): Promise<SimpleImage> {
    console.log('📁 addImageFromFile called with:', { subject, listId, userId, fileName: fileInput.file.name })

    try {
      // Upload file and get URL
      const imageUrl = await this.uploadFile(fileInput.file, userId, subject)

      // Use existing addImage method with the generated URL
      return await this.addImage(subject, {
        image_url: imageUrl,
        notes: fileInput.notes
      }, listId, userId)
    } catch (err) {
      console.error('💥 Exception in addImageFromFile:', err)
      throw err
    }
  }

  // Add image (using existing image_collections table)
  static async addImage(subject: string, imageInput: SimpleImageInput, listId: string, userId: string): Promise<SimpleImage> {
    console.log('🔧 addImage called with:', JSON.stringify({ subject, listId, userId, imageInput }, null, 2))

    try {
      console.log('🔧 Starting Supabase insert with 10 second timeout...')

      const insertData = {
        user_id: userId,
        list_id: listId,
        drawing_subject: subject,
        image_url: imageInput.image_url,
        position: 0,
        notes: imageInput.notes || null
      }
      console.log('📝 Insert data:', JSON.stringify(insertData, null, 2))

      const startTime = Date.now()

      // Try with fresh client instance to avoid connection reuse issues
      const { createClient } = await import('@supabase/supabase-js')
      const freshClient = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_ANON_KEY as string
      )

      console.log('🆕 Using fresh Supabase client for INSERT')

      // Add timeout to prevent infinite hangs
      const insertPromise = freshClient
        .from('image_collections')
        .insert([insertData])
        .select()
        .single()

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏱️ INSERT timeout reached after 10 seconds')
          reject(new Error('INSERT timeout after 10 seconds'))
        }, 10000)
      })

      const result = await Promise.race([insertPromise, timeoutPromise]) as any

      const duration = Date.now() - startTime
      console.log(`📊 RAW insert completed in ${duration}ms`)

      const { data, error } = result

      if (error) {
        console.error('❌ Error adding image:', error)
        throw error
      }

      console.log('✅ Image added successfully to Supabase:', data)

      // Invalidate cache when image is added
      this.bulkCache.delete(userId)

      return data
    } catch (err) {
      console.error('💥 Exception in addImage:', err)
      console.log('🚨 Supabase addImage failed - falling back to localStorage')

      try {
        const fallbackImage = this.saveFallbackImage(userId, subject, {
          user_id: userId,
          list_id: listId,
          drawing_subject: subject,
          image_url: imageInput.image_url,
          position: 0,
          notes: imageInput.notes || null
        })

        // Invalidate cache when image is added via fallback
        this.bulkCache.delete(userId)

        console.log('✅ Successfully saved to localStorage fallback')
        return fallbackImage
      } catch (fallbackErr) {
        console.error('💥 Even localStorage fallback failed:', fallbackErr)
        throw err // Throw original Supabase error
      }
    }
  }

  // Remove image
  static async removeImage(imageId: string): Promise<void> {
    console.log('🗑️ Removing image:', imageId)

    try {
      console.log('🗑️ Starting optimized Supabase delete...')

      const deletePromise = supabase
        .from('image_collections')
        .delete()
        .eq('id', imageId)

      // Reasonable timeout for delete operations
      const deleteTimeout = new Promise((_, reject) => {
        setTimeout(() => {
          console.log('⏱️ Delete timeout reached after 10 seconds')
          reject(new Error('Delete timeout after 10 seconds'))
        }, 10000)
      })

      const { error } = await Promise.race([deletePromise, deleteTimeout]) as any

      if (error) {
        console.error('❌ Error removing image from Supabase:', error)
        throw error
      }

      console.log('✅ Image removed successfully from Supabase')

      // Invalidate cache when image is removed
      this.bulkCache.clear()
    } catch (err) {
      console.error('💥 Exception in removeImage:', err)
      console.log('🚨 Supabase delete failed - falling back to localStorage removal')

      try {
        // Remove from localStorage as fallback
        const stored = localStorage.getItem(this.FALLBACK_KEY)
        if (stored) {
          const data = JSON.parse(stored)

          // Find and remove the image from localStorage
          let found = false
          for (const userId in data) {
            for (const subject in data[userId]) {
              const images = data[userId][subject]
              const index = images.findIndex((img: SimpleImage) => img.id === imageId)
              if (index !== -1) {
                images.splice(index, 1)
                found = true
                break
              }
            }
            if (found) break
          }

          if (found) {
            localStorage.setItem(this.FALLBACK_KEY, JSON.stringify(data))
            console.log('✅ Image removed from localStorage fallback')
          } else {
            console.log('⚠️ Image not found in localStorage fallback')
          }
        }

        // Invalidate cache when image is removed
        this.bulkCache.clear()
      } catch (fallbackErr) {
        console.error('💥 Even localStorage fallback failed:', fallbackErr)
        throw err // Throw original Supabase error
      }
    }
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
  static async canAddImage(subject: string, listId: string, subscriptionTier: 'free' | 'pro', userId: string): Promise<boolean> {
    if (subscriptionTier === 'pro') {
      return true
    }

    const { count, error } = await supabase
      .from('image_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('list_id', listId)
      .eq('drawing_subject', subject)

    if (error) {
      throw error
    }

    return (count || 0) < 3 // Free tier limit: 3 images per subject per list
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