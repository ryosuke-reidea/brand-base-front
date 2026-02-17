/*
  # Add image_url column to applications table

  1. Changes
    - Add `image_url` column to `applications` table
      - Type: text (nullable)
      - Stores the storage path of the AI-generated image (e.g., "ai-generated/xxx.png")

  2. Notes
    - Column is nullable to maintain backward compatibility
    - Existing rows will have NULL for this column
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'applications' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE applications ADD COLUMN image_url text;
  END IF;
END $$;
