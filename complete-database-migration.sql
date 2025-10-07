-- Complete database migration for list-based image collections
-- This creates the missing custom_lists table and adds list context to image_collections

-- First, create the custom_lists table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.custom_lists (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    items TEXT[] NOT NULL DEFAULT '{}',
    is_active BOOLEAN DEFAULT false,
    is_custom BOOLEAN DEFAULT true,
    original_id TEXT,
    description TEXT,
    creator TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies for custom_lists
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.custom_lists;

CREATE POLICY "Users can view own lists" ON public.custom_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON public.custom_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON public.custom_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON public.custom_lists
    FOR DELETE USING (auth.uid() = user_id);

-- Add list_id column to image_collections (if it doesn't exist)
ALTER TABLE public.image_collections
ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_image_collections_list_user ON public.image_collections(list_id, user_id);

-- Update RLS policies for image_collections to include list context validation
DROP POLICY IF EXISTS "Users can insert own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can view own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can update own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can delete own image collections" ON public.image_collections;

CREATE POLICY "Users can insert own image collections" ON public.image_collections
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        )
    );

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