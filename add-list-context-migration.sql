-- Add list_id to image_collections table for proper list context
-- This fixes the INSERT hanging issue by establishing clear ownership chains

-- First, add metadata fields to custom_lists table to support curated lists
ALTER TABLE public.custom_lists
ADD COLUMN IF NOT EXISTS is_custom BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS original_id TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS creator TEXT;

-- Add list_id column to image_collections
ALTER TABLE public.image_collections
ADD COLUMN list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX idx_image_collections_list_user ON public.image_collections(list_id, user_id);

-- Update RLS policy to include list context validation
DROP POLICY IF EXISTS "Users can insert own image collections" ON public.image_collections;

CREATE POLICY "Users can insert own image collections" ON public.image_collections
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

-- Update other RLS policies to be consistent
DROP POLICY IF EXISTS "Users can view own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can update own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can delete own image collections" ON public.image_collections;

CREATE POLICY "Users can view own image collections" ON public.image_collections
    FOR SELECT USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own image collections" ON public.image_collections
    FOR UPDATE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own image collections" ON public.image_collections
    FOR DELETE USING (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

-- NOTE: Existing image_collections rows will have list_id = NULL
-- These should be migrated or cleaned up manually