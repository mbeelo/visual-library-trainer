# Database Schema Setup

This document contains the complete database schema for Visual Library Trainer 2.0. Run these SQL commands in your Supabase SQL Editor.

## 1. Create Tables

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Image collections table
CREATE TABLE public.image_collections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    drawing_subject TEXT NOT NULL,
    image_url TEXT NOT NULL,
    position INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Practice sessions table
CREATE TABLE public.practice_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    duration INTEGER NOT NULL, -- in seconds
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 4), -- 1=failed, 2=struggled, 3=got-it, 4=easy
    images_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Custom lists table
CREATE TABLE public.custom_lists (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    items TEXT[] NOT NULL, -- Array of drawing subjects
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 2. Create Indexes

```sql
-- Performance indexes
CREATE INDEX idx_image_collections_user_subject ON public.image_collections(user_id, drawing_subject);
CREATE INDEX idx_image_collections_position ON public.image_collections(user_id, drawing_subject, position);
CREATE INDEX idx_practice_sessions_user ON public.practice_sessions(user_id);
CREATE INDEX idx_practice_sessions_created_at ON public.practice_sessions(created_at);
CREATE INDEX idx_custom_lists_user ON public.custom_lists(user_id);
CREATE INDEX idx_custom_lists_active ON public.custom_lists(user_id, is_active);
```

## 3. Row Level Security (RLS) Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.image_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.practice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_lists ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Image collections policies
CREATE POLICY "Users can view own image collections" ON public.image_collections
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own image collections" ON public.image_collections
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own image collections" ON public.image_collections
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own image collections" ON public.image_collections
    FOR DELETE USING (auth.uid() = user_id);

-- Practice sessions policies
CREATE POLICY "Users can view own practice sessions" ON public.practice_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own practice sessions" ON public.practice_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own practice sessions" ON public.practice_sessions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own practice sessions" ON public.practice_sessions
    FOR DELETE USING (auth.uid() = user_id);

-- Custom lists policies
CREATE POLICY "Users can view own custom lists" ON public.custom_lists
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own custom lists" ON public.custom_lists
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own custom lists" ON public.custom_lists
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own custom lists" ON public.custom_lists
    FOR DELETE USING (auth.uid() = user_id);
```

## 4. Database Functions

```sql
-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, subscription_tier)
    VALUES (NEW.id, NEW.email, 'free');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 5. Database Views (Optional)

```sql
-- View for user analytics
CREATE VIEW public.user_analytics AS
SELECT
    u.id,
    u.email,
    u.subscription_tier,
    u.created_at as user_created_at,
    COUNT(DISTINCT ps.id) as total_sessions,
    COUNT(DISTINCT ic.id) as total_images,
    COUNT(DISTINCT cl.id) as total_custom_lists,
    AVG(ps.duration) as avg_session_duration,
    MAX(ps.created_at) as last_session_date
FROM public.users u
LEFT JOIN public.practice_sessions ps ON u.id = ps.user_id
LEFT JOIN public.image_collections ic ON u.id = ic.user_id
LEFT JOIN public.custom_lists cl ON u.id = cl.user_id
GROUP BY u.id, u.email, u.subscription_tier, u.created_at;

-- View for image collection stats
CREATE VIEW public.image_collection_stats AS
SELECT
    user_id,
    drawing_subject,
    COUNT(*) as image_count,
    MIN(created_at) as first_image_added,
    MAX(created_at) as last_image_added
FROM public.image_collections
GROUP BY user_id, drawing_subject;
```

## 6. Sample Data (For Testing)

```sql
-- Insert sample user (only for testing)
-- Note: In production, users are created through Supabase Auth
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
    uuid_generate_v4(),
    'test@example.com',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT DO NOTHING;

-- The trigger will automatically create the profile in public.users
```

## 7. Backup & Maintenance

```sql
-- Query to check table sizes
SELECT
    schemaname,
    tablename,
    attname,
    n_distinct,
    correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY tablename, attname;

-- Query to monitor RLS policies
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public';
```

## 8. Migration Scripts

If you need to update existing data:

```sql
-- Example: Add new column to existing table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;

-- Example: Update subscription tiers
UPDATE public.users
SET subscription_tier = 'pro'
WHERE id IN (
    SELECT DISTINCT user_id
    FROM public.image_collections
    GROUP BY user_id
    HAVING COUNT(*) > 10
);
```

## 9. Performance Monitoring

```sql
-- Query to find slow queries
SELECT
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query LIKE '%image_collections%'
ORDER BY mean_time DESC
LIMIT 10;

-- Query to check index usage
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

## 🔧 Setup Instructions

1. **Open Supabase Dashboard**
2. **Go to SQL Editor**
3. **Run scripts in order**:
   - Section 1: Create Tables
   - Section 2: Create Indexes
   - Section 3: Row Level Security
   - Section 4: Database Functions
   - Section 5: Views (optional)

4. **Verify Setup**:
   ```sql
   -- Check all tables exist
   SELECT table_name FROM information_schema.tables
   WHERE table_schema = 'public' AND table_type = 'BASE TABLE';

   -- Check RLS is enabled
   SELECT tablename, rowsecurity FROM pg_tables
   WHERE schemaname = 'public' AND rowsecurity = true;
   ```

5. **Test Authentication**:
   - Create a test user through Supabase Auth
   - Verify user profile is auto-created in `public.users`
   - Test that RLS policies work correctly

## 🚨 Important Notes

- **Never disable RLS** in production
- **Use service key** only for admin operations in backend
- **Regular backups** are handled by Supabase automatically
- **Monitor performance** with the provided queries
- **Update indexes** if you modify query patterns

Your database is now ready for Visual Library Trainer 2.0! 🎨