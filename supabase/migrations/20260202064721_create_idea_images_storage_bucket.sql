/*
  # Create idea-images storage bucket

  ## Storage Configuration
  
  ### idea-images bucket
  - Public bucket for storing AI-generated idea images
  - Images are publicly accessible via URL
  - File size limit: 5MB
  - Allowed MIME types: image/png, image/jpeg, image/webp
  
  ## Security
  - Enable RLS on storage.objects
  - Allow public read access to all files
  - Allow authenticated users to upload files
  - Allow authenticated users to update/delete their own files

  ## Notes
  This bucket stores AI-generated images for submitted ideas.
  Images are publicly accessible once uploaded.
*/

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'idea-images',
  'idea-images',
  true,
  5242880,
  ARRAY['image/png', 'image/jpeg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public read access for idea images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload idea images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own idea images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own idea images" ON storage.objects;

CREATE POLICY "Public read access for idea images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'idea-images');

CREATE POLICY "Authenticated users can upload idea images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'idea-images');

CREATE POLICY "Users can update their own idea images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'idea-images')
  WITH CHECK (bucket_id = 'idea-images');

CREATE POLICY "Users can delete their own idea images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'idea-images');
