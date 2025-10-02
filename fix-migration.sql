-- Fix the migration function for proper execution
CREATE OR REPLACE FUNCTION public.migrate_existing_collections_to_boards()
RETURNS TABLE(migrated_subjects INTEGER, migrated_images INTEGER) AS $$
DECLARE
    collection_record RECORD;
    board_uuid UUID;
    subject_count INTEGER := 0;
    image_count INTEGER := 0;
    current_subject TEXT := '';
    rows_affected INTEGER;
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
            ) INTO board_uuid;

            current_subject := collection_record.user_id::TEXT || '|' || collection_record.drawing_subject;
            subject_count := subject_count + 1;
        END IF;

        -- Add image to board (check for duplicates using the variable name)
        INSERT INTO public.board_images (
            board_id,
            image_url,
            title,
            notes,
            position,
            added_at
        )
        VALUES (
            board_uuid,
            collection_record.image_url,
            collection_record.drawing_subject,
            collection_record.notes,
            COALESCE(collection_record.position, 0),
            collection_record.created_at
        )
        ON CONFLICT (board_id, image_url) DO NOTHING;

        -- Check if the insert was successful
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        image_count := image_count + rows_affected;
    END LOOP;

    RETURN QUERY SELECT subject_count, image_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;