-- Drop existing image collections policies
DROP POLICY IF EXISTS "Users can view own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can insert own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can update own image collections" ON public.image_collections;
DROP POLICY IF EXISTS "Users can delete own image collections" ON public.image_collections;

-- Create updated image collections policies (with list context)
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