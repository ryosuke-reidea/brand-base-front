/*
  # Create applications table

  1. New Tables
    - `applications`
      - `id` (uuid, primary key) - Unique identifier for each application
      - `type` (text) - Type of application: 'idea' or 'consult'
      - `name` (text) - Applicant's name
      - `email` (text) - Applicant's email address
      - `phone` (text, nullable) - Applicant's phone number (optional)
      - `product_name` (text, nullable) - Product name (for idea applications)
      - `product_description` (text, nullable) - Product description (for idea applications)
      - `additional_info` (text, nullable) - Additional information (for idea applications)
      - `inquiry` (text, nullable) - Inquiry content (for consult applications)
      - `created_at` (timestamptz) - Timestamp when the application was submitted
      - `status` (text) - Application status: 'pending', 'reviewed', 'contacted'

  2. Security
    - Enable RLS on `applications` table
    - Add policy for inserting new applications (public access for form submissions)
    - Add policy for authenticated users to read all applications
*/

CREATE TABLE IF NOT EXISTS applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('idea', 'consult')),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  product_name text,
  product_description text,
  additional_info text,
  inquiry text,
  created_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'contacted'))
);

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert applications"
  ON applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications"
  ON applications
  FOR SELECT
  TO authenticated
  USING (true);