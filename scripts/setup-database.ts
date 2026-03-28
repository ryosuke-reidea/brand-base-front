import { createClient } from '@supabase/supabase-js';
import { creators, products } from '../lib/data';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('Setting up database...\n');

  console.log('Checking database connection...');
  const { data: testData, error: testError } = await supabase
    .from('creators')
    .select('count')
    .limit(1);

  if (testError && testError.code === '42P01') {
    console.log('\n⚠ Tables do not exist yet.');
    console.log('\nPlease run the SQL from supabase/schema.sql in your Supabase SQL Editor:');
    console.log('https://supabase.com/dashboard/project/_/sql\n');
    console.log('Then run this script again.\n');
    return;
  }

  console.log('✓ Database connection successful\n');

  console.log('Checking if data already exists...');
  const { data: existingCreators } = await supabase
    .from('creators')
    .select('slug')
    .limit(1);

  if (existingCreators && existingCreators.length > 0) {
    console.log('✓ Data already exists in the database.');
    console.log('\nDatabase setup complete!\n');
    return;
  }

  console.log('Inserting creators data...');
  const { error: creatorsError } = await supabase
    .from('creators')
    .insert(creators);

  if (creatorsError) {
    console.error('✗ Error inserting creators:', creatorsError);
    process.exit(1);
  }
  console.log(`✓ Inserted ${creators.length} creators`);

  console.log('Inserting products data...');
  const { error: productsError } = await supabase
    .from('products')
    .insert(products);

  if (productsError) {
    console.error('✗ Error inserting products:', productsError);
    process.exit(1);
  }
  console.log(`✓ Inserted ${products.length} products`);

  console.log('\n✓ Database setup complete!\n');
}

setupDatabase().catch(console.error);
