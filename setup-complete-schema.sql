-- Complete database setup for Visual Library Trainer
-- This creates all required tables and RLS policies from scratch

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Custom lists table (for both curated and user-created lists)
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

-- Image collections table (with list context)
CREATE TABLE IF NOT EXISTS public.image_collections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE,
    drawing_subject TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Practice sessions table
CREATE TABLE IF NOT EXISTS public.practice_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL,
    rating INTEGER NOT NULL,
    images_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can insert own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can update own lists" ON public.custom_lists;
DROP POLICY IF EXISTS "Users can delete own lists" ON public.custom_lists;

DROP POLICY IF EXISTS "Users can view own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can insert own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can update own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can delete own image collections" ON public.image_collections;

DROP POLICY IF EXISTS "Users can view own practice sessions" ON public.practice_sessions;
DROP POLICY IF EXISTS "Users can insert own practice sessions" ON public.practice_sessions;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Custom lists policies
CREATE POLICY "Users can view own lists" ON public.custom_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lists" ON public.custom_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lists" ON public.custom_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own lists" ON public.custom_lists
    FOR DELETE USING (auth.uid() = user_id);

-- Image collections policies (with list context)
CREATE POLICY "Users can view own image collections" ON public.image_collections
    FOR SELECT USING (
        auth.uid() = user_id AND
        (list_id IS NULL OR EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can insert own image collections" ON public.image_collections
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND
        (list_id IS NULL OR EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can update own image collections" ON public.image_collections
    FOR UPDATE USING (
        auth.uid() = user_id AND
        (list_id IS NULL OR EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        ))
    );

CREATE POLICY "Users can delete own image collections" ON public.image_collections
    FOR DELETE USING (
        auth.uid() = user_id AND
        (list_id IS NULL OR EXISTS (
            SELECT 1 FROM public.custom_lists
            WHERE id = list_id AND user_id = auth.uid()
        ))
    );

-- Practice sessions policies
CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions" ON public.practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_custom_lists_user ON public.custom_lists(user_id);
CREATE INDEX IF NOT EXISTS idx_image_collections_user ON public.image_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_image_collections_list_user ON public.image_collections(list_id, user_id);
CREATE INDEX IF NOT EXISTS idx_image_collections_subject ON public.image_collections(drawing_subject);
CREATE INDEX IF NOT EXISTS idx_practice_sessions_user ON public.practice_sessions(user_id);

-- Create storage bucket for user images if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-images', 'user-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for user images
CREATE POLICY IF NOT EXISTS "Users can upload own images" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can view own images" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "Users can delete own images" ON storage.objects
    FOR DELETE USING (bucket_id = 'user-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Note: After running this, users will need to sign in again to trigger
-- the auto-creation of their curated lists via the AuthContext