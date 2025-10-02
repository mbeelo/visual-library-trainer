import { supabase } from '../lib/supabase'
import { ImageCollection, ImageCollectionInput } from '../types'

export class ImageCollectionService {
  // Get all images for a specific drawing subject for the current user
  static async getImagesBySubject(userId: string, drawingSubject: string): Promise<ImageCollection[]> {
    const { data, error } = await supabase
      .from('image_collections')
      .select('*')
      .eq('user_id', userId)
      .eq('drawing_subject', drawingSubject)
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching images:', error)
      throw error
    }

    return data || []
  }

  // Add a new image to a collection
  static async addImage(userId: string, input: ImageCollectionInput): Promise<ImageCollection> {
    // Get current max position for this subject
    const { data: existingImages } = await supabase
      .from('image_collections')
      .select('position')
      .eq('user_id', userId)
      .eq('drawing_subject', input.drawing_subject)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = existingImages && existingImages.length > 0
      ? existingImages[0].position + 1
      : 0

    const { data, error } = await supabase
      .from('image_collections')
      .insert([{
        user_id: userId,
        drawing_subject: input.drawing_subject,
        image_url: input.image_url,
        notes: input.notes,
        position: nextPosition
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding image:', error)
      throw error
    }

    return data
  }

  // Remove an image from collection
  static async removeImage(userId: string, imageId: string): Promise<void> {
    const { error } = await supabase
      .from('image_collections')
      .delete()
      .eq('id', imageId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error removing image:', error)
      throw error
    }
  }

  // Update image notes
  static async updateImageNotes(userId: string, imageId: string, notes: string): Promise<void> {
    const { error } = await supabase
      .from('image_collections')
      .update({ notes })
      .eq('id', imageId)
      .eq('user_id', userId)

    if (error) {
      console.error('Error updating image notes:', error)
      throw error
    }
  }

  // Reorder images in collection
  static async reorderImages(userId: string, drawingSubject: string, imageIds: string[]): Promise<void> {
    const updates = imageIds.map((id, index) =>
      supabase
        .from('image_collections')
        .update({ position: index })
        .eq('id', id)
        .eq('user_id', userId)
        .eq('drawing_subject', drawingSubject)
    )

    await Promise.all(updates)
  }

  // Check if user can add more images (free tier limit)
  static async canAddImage(userId: string, drawingSubject: string, subscriptionTier: 'free' | 'pro'): Promise<boolean> {
    if (subscriptionTier === 'pro') {
      return true
    }

    try {
      // Add a 3-second timeout to the database query
      const queryPromise = supabase
        .from('image_collections')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('drawing_subject', drawingSubject);

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Database query timeout')), 3000)
      );

      const { count, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

      if (error) {
        throw error;
      }

      return (count || 0) < 3;
    } catch (error) {
      throw error;
    }
  }

  // Get total image count for user (for analytics)
  static async getTotalImageCount(userId: string): Promise<number> {
    const { count } = await supabase
      .from('image_collections')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    return count || 0
  }

  // Validate image URL (basic check)
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