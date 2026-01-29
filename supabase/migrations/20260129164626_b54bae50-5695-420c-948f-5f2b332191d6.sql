-- Create storage bucket for room images
INSERT INTO storage.buckets (id, name, public)
VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to room images
CREATE POLICY "Room images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- Allow admins to upload room images
CREATE POLICY "Admins can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to update room images
CREATE POLICY "Admins can update room images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-images' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Allow admins to delete room images
CREATE POLICY "Admins can delete room images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images' 
  AND auth.uid() IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Add image_url column to rooms table
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS image_url TEXT;