/*
  # Create Creators and Products Tables

  1. New Tables
    - `creators`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `display_name` (text) - Display name of creator
      - `category` (text) - Category of products
      - `bio_short` (text) - Short biography
      - `bio_full` (text) - Full biography
      - `active_since_year` (integer) - Year started
      - `lifetime_sales_jpy` (bigint) - Total sales in JPY
      - `lifetime_units` (integer) - Total units sold
      - `projects_count` (integer) - Number of projects
      - `avatar_seed` (text) - Seed for avatar generation
      - `created_at` (timestamptz) - Creation timestamp
    
    - `products`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `product_name` (text) - Product name
      - `category` (text) - Product category
      - `campaign_status` (text) - Status: live, funded, indemand, archived
      - `funding_percent` (integer) - Funding percentage
      - `lifetime_sales_jpy` (bigint) - Total sales in JPY
      - `lifetime_units` (integer) - Total units sold
      - `creator_slug` (text) - Reference to creator
      - `description` (text) - Product description
      - `why_successful` (text, nullable) - Success explanation
      - `created_at` (timestamptz) - Creation timestamp

  2. Security
    - Enable RLS on both tables
    - Allow public read access for all users
    - Allow authenticated users to insert, update, and delete records
  
  3. Indexes
    - Index on `products.creator_slug` for faster joins
    - Index on `products.category` for category filtering
    - Index on `creators.category` for category filtering
*/

-- Creators table
CREATE TABLE IF NOT EXISTS creators (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  display_name text NOT NULL,
  category text NOT NULL,
  bio_short text NOT NULL,
  bio_full text NOT NULL,
  active_since_year integer NOT NULL,
  lifetime_sales_jpy bigint NOT NULL DEFAULT 0,
  lifetime_units integer NOT NULL DEFAULT 0,
  projects_count integer NOT NULL DEFAULT 0,
  avatar_seed text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  product_name text NOT NULL,
  category text NOT NULL,
  campaign_status text NOT NULL CHECK (campaign_status IN ('live', 'funded', 'indemand', 'archived')),
  funding_percent integer NOT NULL DEFAULT 0,
  lifetime_sales_jpy bigint NOT NULL DEFAULT 0,
  lifetime_units integer NOT NULL DEFAULT 0,
  creator_slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  why_successful text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT fk_creator FOREIGN KEY (creator_slug) REFERENCES creators(slug) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view creators" ON creators;
DROP POLICY IF EXISTS "Anyone can view products" ON products;
DROP POLICY IF EXISTS "Authenticated users can insert creators" ON creators;
DROP POLICY IF EXISTS "Authenticated users can update creators" ON creators;
DROP POLICY IF EXISTS "Authenticated users can delete creators" ON creators;
DROP POLICY IF EXISTS "Authenticated users can insert products" ON products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON products;

-- Create policies for public read access
CREATE POLICY "Anyone can view creators"
  ON creators
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can view products"
  ON products
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can insert creators"
  ON creators
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update creators"
  ON creators
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete creators"
  ON creators
  FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete products"
  ON products
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_creator_slug ON products(creator_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_creators_category ON creators(category);