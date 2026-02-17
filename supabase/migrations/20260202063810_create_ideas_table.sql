/*
  # Create ideas table

  ## New Tables
  
  ### ideas
  - `id` (uuid, primary key) - Unique identifier for each idea
  - `slug` (text, unique) - URL-friendly identifier
  - `idea_name` (text) - Name of the idea/product
  - `idea_description` (text) - Description of the idea
  - `creator_name` (text) - Name of the person who submitted the idea
  - `creator_email` (text) - Email of the submitter
  - `ai_image_url` (text, nullable) - URL of the AI-generated image
  - `status` (text) - Status of the idea (pending, approved, rejected)
  - `likes_count` (integer, default 0) - Number of likes
  - `views_count` (integer, default 0) - Number of views
  - `created_at` (timestamptz) - Timestamp of creation
  
  ## Security
  - Enable RLS on ideas table
  - Allow public read access for approved ideas
  - Allow authenticated users to insert new ideas
  - Only authenticated users can update/delete ideas

  ## Notes
  This table stores user-submitted ideas with optional AI-generated images.
  Ideas are displayed publicly after approval.
*/

CREATE TABLE IF NOT EXISTS ideas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  idea_name text NOT NULL,
  idea_description text NOT NULL,
  creator_name text NOT NULL,
  creator_email text NOT NULL,
  ai_image_url text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  likes_count integer NOT NULL DEFAULT 0,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view approved ideas" ON ideas;
DROP POLICY IF EXISTS "Authenticated users can insert ideas" ON ideas;
DROP POLICY IF EXISTS "Authenticated users can update ideas" ON ideas;
DROP POLICY IF EXISTS "Authenticated users can delete ideas" ON ideas;

CREATE POLICY "Anyone can view approved ideas"
  ON ideas
  FOR SELECT
  TO anon, authenticated
  USING (status = 'approved');

CREATE POLICY "Authenticated users can insert ideas"
  ON ideas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update ideas"
  ON ideas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete ideas"
  ON ideas
  FOR DELETE
  TO authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at DESC);
