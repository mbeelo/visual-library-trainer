-- Add list_id column to image_collections table
ALTER TABLE public.image_collections
ADD COLUMN IF NOT EXISTS list_id UUID REFERENCES public.custom_lists(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_image_collections_list_user ON public.image_collections(list_id, user_id);