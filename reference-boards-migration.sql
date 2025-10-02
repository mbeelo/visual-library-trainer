-- Visual Library Reference Boards Migration
-- Enhances reference phase with Pinterest-style contextual curation
-- Preserves ALL existing functionality - training lists and sessions unchanged

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create subject_boards table (contextual boards for drawing subjects)
CREATE TABLE IF NOT EXISTS public.subject_boards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject_name TEXT NOT NULL, -- matches items from custom_lists or built-in subjects
    board_name TEXT, -- optional custom name, defaults to subject_name
    description TEXT,
    cover_image_url TEXT, -- Pinterest-style board cover
    is_private BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, subject_name) -- one board per subject per user
);

-- 2. Create board_images table (Pinterest's pin pattern)
CREATE TABLE IF NOT EXISTS public.board_images (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    board_id UUID REFERENCES public.subject_boards(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    source_url TEXT, -- where the image came from
    notes TEXT, -- user's personal notes about this reference
    position INTEGER DEFAULT 0, -- for drag-and-drop ordering
    width INTEGER, -- for masonry layout
    height INTEGER,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(board_id, image_url) -- prevent duplicate images in same board
);

-- 3. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_subject_boards_user_subject ON public.subject_boards(user_id, subject_name);
CREATE INDEX IF NOT EXISTS idx_subject_boards_user_updated ON public.subject_boards(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_board_images_board_position ON public.board_images(board_id, position);
CREATE INDEX IF NOT EXISTS idx_board_images_board_added ON public.board_images(board_id, added_at DESC);

-- 4. Enable Row Level Security
ALTER TABLE public.subject_boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_images ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for subject_boards
CREATE POLICY "Users can view own subject boards" ON public.subject_boards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subject boards" ON public.subject_boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subject boards" ON public.subject_boards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own subject boards" ON public.subject_boards
    FOR DELETE USING (auth.uid() = user_id);

-- 6. Create RLS policies for board_images
CREATE POLICY "Users can view own board images" ON public.board_images
    FOR SELECT USING (
        auth.uid() IN (
            SELECT user_id FROM public.subject_boards WHERE id = board_id
        )
    );

CREATE POLICY "Users can insert own board images" ON public.board_images
    FOR INSERT WITH CHECK (
        auth.uid() IN (
            SELECT user_id FROM public.subject_boards WHERE id = board_id
        )
    );

CREATE POLICY "Users can update own board images" ON public.board_images
    FOR UPDATE USING (
        auth.uid() IN (
            SELECT user_id FROM public.subject_boards WHERE id = board_id
        )
    );

CREATE POLICY "Users can delete own board images" ON public.board_images
    FOR DELETE USING (
        auth.uid() IN (
            SELECT user_id FROM public.subject_boards WHERE id = board_id
        )
    );

-- 7. Create function to get or create subject board
CREATE OR REPLACE FUNCTION public.get_or_create_subject_board(
    user_uuid UUID,
    subject TEXT
)
RETURNS UUID AS $$
DECLARE
    board_id UUID;
BEGIN
    -- Try to get existing board
    SELECT id INTO board_id
    FROM public.subject_boards
    WHERE user_id = user_uuid AND subject_name = subject;

    -- Create board if it doesn't exist
    IF board_id IS NULL THEN
        INSERT INTO public.subject_boards (user_id, subject_name, board_name)
        VALUES (user_uuid, subject, subject)
        RETURNING id INTO board_id;
    END IF;

    RETURN board_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create function to add image to subject board
CREATE OR REPLACE FUNCTION public.add_image_to_subject_board(
    user_uuid UUID,
    subject TEXT,
    image_url_param TEXT,
    title_param TEXT DEFAULT NULL,
    description_param TEXT DEFAULT NULL,
    source_url_param TEXT DEFAULT NULL,
    notes_param TEXT DEFAULT NULL,
    width_param INTEGER DEFAULT NULL,
    height_param INTEGER DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    board_id UUID;
    image_id UUID;
    next_position INTEGER;
BEGIN
    -- Get or create board for this subject
    SELECT public.get_or_create_subject_board(user_uuid, subject) INTO board_id;

    -- Get next position
    SELECT COALESCE(MAX(position), 0) + 1
    INTO next_position
    FROM public.board_images
    WHERE board_id = board_id;

    -- Insert image
    INSERT INTO public.board_images (
        board_id, image_url, title, description, source_url, notes, position, width, height
    )
    VALUES (
        board_id, image_url_param, title_param, description_param,
        source_url_param, notes_param, next_position, width_param, height_param
    )
    RETURNING id INTO image_id;

    -- Update board's updated_at timestamp
    UPDATE public.subject_boards
    SET updated_at = NOW()
    WHERE id = board_id;

    RETURN image_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Create function to reorder board images (Pinterest drag-and-drop)
CREATE OR REPLACE FUNCTION public.reorder_subject_board_images(
    board_uuid UUID,
    image_orders JSONB -- Array of {image_id, position} objects
)
RETURNS BOOLEAN AS $$
DECLARE
    order_item JSONB;
BEGIN
    -- Update position for each image
    FOR order_item IN SELECT * FROM jsonb_array_elements(image_orders)
    LOOP
        UPDATE public.board_images
        SET position = (order_item->>'position')::INTEGER
        WHERE id = (order_item->>'image_id')::UUID
        AND board_id = board_uuid;
    END LOOP;

    -- Update board timestamp
    UPDATE public.subject_boards
    SET updated_at = NOW()
    WHERE id = board_uuid;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 10. Create function to update board cover image
CREATE OR REPLACE FUNCTION public.update_board_cover(
    board_uuid UUID,
    image_url_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.subject_boards
    SET cover_image_url = image_url_param, updated_at = NOW()
    WHERE id = board_uuid;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Create views for board analytics
CREATE OR REPLACE VIEW public.subject_board_stats AS
SELECT
    sb.id as board_id,
    sb.user_id,
    sb.subject_name,
    sb.board_name,
    COUNT(bi.id) as image_count,
    MIN(bi.added_at) as first_image_added,
    MAX(bi.added_at) as last_image_added,
    sb.created_at as board_created_at,
    sb.updated_at as board_updated_at,
    sb.cover_image_url
FROM public.subject_boards sb
LEFT JOIN public.board_images bi ON sb.id = bi.board_id
GROUP BY sb.id, sb.user_id, sb.subject_name, sb.board_name, sb.created_at, sb.updated_at, sb.cover_image_url;

-- 12. Create view for user's most active boards
CREATE OR REPLACE VIEW public.user_active_boards AS
SELECT
    sb.user_id,
    sb.subject_name,
    sb.board_name,
    COUNT(bi.id) as image_count,
    MAX(bi.added_at) as last_activity,
    sb.cover_image_url
FROM public.subject_boards sb
LEFT JOIN public.board_images bi ON sb.id = bi.board_id
GROUP BY sb.user_id, sb.subject_name, sb.board_name, sb.cover_image_url
HAVING COUNT(bi.id) > 0
ORDER BY MAX(bi.added_at) DESC;

-- 13. Create function to migrate existing image_collections to subject boards
CREATE OR REPLACE FUNCTION public.migrate_existing_collections_to_boards()
RETURNS TABLE(migrated_subjects INTEGER, migrated_images INTEGER) AS $$
DECLARE
    collection_record RECORD;
    board_id UUID;
    subject_count INTEGER := 0;
    image_count INTEGER := 0;
    current_subject TEXT := '';
BEGIN
    -- Loop through existing image collections grouped by user and subject
    FOR collection_record IN
        SELECT
            user_id,
            drawing_subject,
            image_url,
            notes,
            position,
            created_at
        FROM public.image_collections
        ORDER BY user_id, drawing_subject, created_at
    LOOP
        -- Create new board if we're on a new subject
        IF current_subject != collection_record.user_id::TEXT || '|' || collection_record.drawing_subject THEN
            SELECT public.get_or_create_subject_board(
                collection_record.user_id,
                collection_record.drawing_subject
            ) INTO board_id;

            current_subject := collection_record.user_id::TEXT || '|' || collection_record.drawing_subject;
            subject_count := subject_count + 1;
        END IF;

        -- Add image to board (check for duplicates)
        INSERT INTO public.board_images (
            board_id,
            image_url,
            title,
            notes,
            position,
            added_at
        )
        VALUES (
            board_id,
            collection_record.image_url,
            collection_record.drawing_subject,
            collection_record.notes,
            COALESCE(collection_record.position, 0),
            collection_record.created_at
        )
        ON CONFLICT (board_id, image_url) DO NOTHING;

        GET DIAGNOSTICS image_count = image_count + ROW_COUNT;
    END LOOP;

    RETURN QUERY SELECT subject_count, image_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Update user analytics to include board data
CREATE OR REPLACE VIEW public.user_analytics_with_boards AS
SELECT
    u.id,
    u.subscription_tier,
    u.created_at as user_created_at,
    COUNT(DISTINCT ps.id) as total_sessions,
    COUNT(DISTINCT ic.id) as total_legacy_images, -- existing image_collections
    COUNT(DISTINCT sb.id) as total_subject_boards,
    COUNT(DISTINCT bi.id) as total_board_images,
    COUNT(DISTINCT cl.id) as total_custom_lists,
    AVG(ps.duration) as avg_session_duration,
    MAX(ps.created_at) as last_session_date,
    MAX(sb.updated_at) as last_board_activity
FROM public.users u
LEFT JOIN public.practice_sessions ps ON u.id = ps.user_id
LEFT JOIN public.image_collections ic ON u.id = ic.user_id -- keep legacy for comparison
LEFT JOIN public.subject_boards sb ON u.id = sb.user_id
LEFT JOIN public.board_images bi ON sb.id = bi.board_id
LEFT JOIN public.custom_lists cl ON u.id = cl.user_id
GROUP BY u.id, u.subscription_tier, u.created_at;

-- Ready to enhance the reference phase!
-- Run migration with: SELECT * FROM public.migrate_existing_collections_to_boards();