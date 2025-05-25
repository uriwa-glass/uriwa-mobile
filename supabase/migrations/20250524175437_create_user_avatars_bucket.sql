-- Create user-avatars bucket for storing user profile images
INSERT INTO storage.buckets (id, name, public, allowed_mime_types, file_size_limit)
VALUES (
  'user-avatars',
  'user-avatars',
  true,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  5242880  -- 5MB in bytes
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all avatars (public)
CREATE POLICY "Public Access for Avatars" ON storage.objects
FOR SELECT USING (bucket_id = 'user-avatars');

-- Policy: Users can upload their own avatars
CREATE POLICY "Users can upload own avatars" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can update their own avatars
CREATE POLICY "Users can update own avatars" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Policy: Users can delete their own avatars
CREATE POLICY "Users can delete own avatars" ON storage.objects
FOR DELETE USING (
  bucket_id = 'user-avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
