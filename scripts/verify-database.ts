import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyDatabase() {
  console.log('Verifying database...\n');

  console.log('Fetching creators...');
  const { data: creators, error: creatorsError } = await supabase
    .from('creators')
    .select('*')
    .order('lifetime_sales_jpy', { ascending: false });

  if (creatorsError) {
    console.error('✗ Error fetching creators:', creatorsError);
    return;
  }

  console.log(`✓ Found ${creators?.length || 0} creators`);
  if (creators && creators.length > 0) {
    console.log('\nTop 3 creators by sales:');
    creators.slice(0, 3).forEach((creator, index) => {
      console.log(`  ${index + 1}. ${creator.display_name} (${creator.category}) - ¥${creator.lifetime_sales_jpy.toLocaleString()}`);
    });
  }

  console.log('\nFetching products...');
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .order('lifetime_sales_jpy', { ascending: false });

  if (productsError) {
    console.error('✗ Error fetching products:', productsError);
    return;
  }

  console.log(`✓ Found ${products?.length || 0} products`);
  if (products && products.length > 0) {
    console.log('\nTop 3 products by sales:');
    products.slice(0, 3).forEach((product, index) => {
      console.log(`  ${index + 1}. ${product.product_name} (${product.category}) - ¥${product.lifetime_sales_jpy.toLocaleString()}`);
    });
  }

  console.log('\n✓ Database verification complete!\n');
}

verifyDatabase().catch(console.error);
