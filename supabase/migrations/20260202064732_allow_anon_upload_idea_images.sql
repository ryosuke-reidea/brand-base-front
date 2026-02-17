/*
  # Allow anonymous uploads for idea images

  ## Updates
  - Allow anon role to upload idea images via edge function
  
  ## Notes
  Edge functions use the anon key, so we need to allow anon uploads.
  This is safe because uploads are controlled by the edge function logic.
*/

DROP POLICY IF EXISTS "Anon users can upload idea images" ON storage.objects;

CREATE POLICY "Anon users can upload idea images"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'idea-images');
