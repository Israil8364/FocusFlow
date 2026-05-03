-- Add daily_goal column to profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS daily_goal INTEGER DEFAULT 4;

-- Ensure avatars storage bucket exists (run this manually in Supabase Storage UI
-- or via the dashboard if not already created)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
-- ON CONFLICT DO NOTHING;
