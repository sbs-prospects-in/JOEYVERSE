-- Run this in your Supabase SQL Editor to make the chat-media bucket public
-- and allow users to upload files to it.

-- 1. Make the bucket public so images and videos can be loaded directly via URL
UPDATE storage.buckets SET public = true WHERE id = 'chat-media';

-- 2. Create policy to allow authenticated users to upload files to chat-media
DROP POLICY IF EXISTS "Allow authenticated uploads to chat-media" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to chat-media" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'chat-media' AND auth.role() = 'authenticated');

-- 3. Create policy to allow anyone to view media from chat-media
DROP POLICY IF EXISTS "Allow public view for chat-media" ON storage.objects;
CREATE POLICY "Allow public view for chat-media" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'chat-media');
