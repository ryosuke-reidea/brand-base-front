import { supabase } from './supabase';
import { Creator, Product, Idea, IdeaProduct } from '@/types';

export async function getAllCreators(): Promise<Creator[]> {
  const [creatorsRes, productsRes] = await Promise.all([
    supabase.from('creators').select('*').order('lifetime_sales_jpy', { ascending: false }),
    supabase.from('products').select('creator_slug, lifetime_sales_jpy, lifetime_units'),
  ]);
  if (creatorsRes.error) {
    console.error('Error fetching creators:', creatorsRes.error);
    return [];
  }
  const creators = creatorsRes.data || [];
  const products = productsRes.data || [];

  // productsテーブルからクリエイターごとの集計値を計算してマージ
  const salesByCreator: Record<string, { sales: number; units: number; count: number }> = {};
  for (const p of products) {
    if (!p.creator_slug) continue;
    if (!salesByCreator[p.creator_slug]) {
      salesByCreator[p.creator_slug] = { sales: 0, units: 0, count: 0 };
    }
    salesByCreator[p.creator_slug].sales += p.lifetime_sales_jpy;
    salesByCreator[p.creator_slug].units += p.lifetime_units;
    salesByCreator[p.creator_slug].count += 1;
  }

  return creators
    .map(c => {
      const agg = salesByCreator[c.slug];
      return {
        ...c,
        lifetime_sales_jpy: agg ? Math.max(agg.sales, c.lifetime_sales_jpy) : c.lifetime_sales_jpy,
        lifetime_units: agg ? Math.max(agg.units, c.lifetime_units) : c.lifetime_units,
        projects_count: agg ? Math.max(agg.count, c.projects_count) : c.projects_count,
      };
    })
    .sort((a, b) => b.lifetime_sales_jpy - a.lifetime_sales_jpy);
}

export async function getCreatorBySlug(slug: string): Promise<Creator | null> {
  const [creatorRes, productsRes] = await Promise.all([
    supabase.from('creators').select('*').eq('slug', slug).maybeSingle(),
    supabase.from('products').select('lifetime_sales_jpy, lifetime_units').eq('creator_slug', slug),
  ]);
  if (creatorRes.error) {
    console.error('Error fetching creator:', creatorRes.error);
    return null;
  }
  if (!creatorRes.data) return null;

  const products = productsRes.data || [];
  const salesTotal = products.reduce((sum, p) => sum + p.lifetime_sales_jpy, 0);
  const unitsTotal = products.reduce((sum, p) => sum + p.lifetime_units, 0);

  return {
    ...creatorRes.data,
    lifetime_sales_jpy: Math.max(salesTotal, creatorRes.data.lifetime_sales_jpy),
    lifetime_units: Math.max(unitsTotal, creatorRes.data.lifetime_units),
    projects_count: Math.max(products.length, creatorRes.data.projects_count),
  };
}

export async function getAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('lifetime_sales_jpy', { ascending: false });
  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }
  return data || [];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('Error fetching product:', error);
    return null;
  }
  return data;
}

export async function getProductsByCreator(creatorSlug: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('creator_slug', creatorSlug)
    .order('lifetime_sales_jpy', { ascending: false });
  if (error) {
    console.error('Error fetching products by creator:', error);
    return [];
  }
  return data || [];
}

export async function getRankings() {
  const creators = await getAllCreators();
  const products = await getAllProducts();

  // getAllCreators()が既にproductsから動的集計済み
  const personal_lifetime = creators
    .map(c => ({ slug: c.slug, value: c.lifetime_sales_jpy }))
    .sort((a, b) => b.value - a.value);

  const product_lifetime = products
    .map(p => ({ slug: p.slug, value: p.lifetime_sales_jpy }))
    .sort((a, b) => b.value - a.value);

  const productsByCreator = creators
    .map(creator => {
      const creatorProducts = products.filter(p => p.creator_slug === creator.slug);
      const maxSales = Math.max(...creatorProducts.map(p => p.lifetime_sales_jpy), 0);
      return {
        slug: creatorProducts.find(p => p.lifetime_sales_jpy === maxSales)?.slug || '',
        value: maxSales,
      };
    })
    .filter(item => item.slug !== '')
    .sort((a, b) => b.value - a.value);

  return {
    personal_lifetime,
    best_single_product: productsByCreator,
    product_lifetime,
  };
}

export async function submitApplication(applicationData: {
  type: 'idea' | 'consult';
  name: string;
  email: string;
  phone?: string;
  product_name?: string;
  product_description?: string;
  additional_info?: string;
  inquiry?: string;
}) {
  const { data, error } = await supabase
    .from('applications')
    .insert([applicationData])
    .select()
    .maybeSingle();
  if (error) {
    console.error('Error submitting application:', error);
    throw error;
  }
  return data;
}

// ─── 旧テーブル用（既存ページで使っている場合のため残す） ───────────────────
export async function getAllIdeas(): Promise<Idea[]> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('status', 'approved')
    .order('created_at', { ascending: false });
  if (error) {
    console.error('Error fetching ideas:', error);
    return [];
  }
  return data || [];
}

export async function getIdeaBySlug(slug: string): Promise<Idea | null> {
  const { data, error } = await supabase
    .from('ideas')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();
  if (error) {
    console.error('Error fetching idea:', error);
    return null;
  }
  return data;
}

// ─── idea_products テーブルから公開済みIDEAを取得（LP表示用） ────────────────
const SUPABASE_STORAGE_URL = 'https://wojgjqikqlmlccfkfanj.supabase.co/storage/v1/object/public/product-images';

function toPublicImageUrl(imageUrlOrPath: string | null): string | null {
  if (!imageUrlOrPath) return null;
  if (imageUrlOrPath.startsWith('http')) return imageUrlOrPath;
  return `${SUPABASE_STORAGE_URL}/${imageUrlOrPath}`;
}

export async function getPublishedIdeas(): Promise<IdeaProduct[]> {
  const { data, error } = await supabase
    .from('idea_products')
    .select('id, name, description, image_url, created_at')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching published ideas:', error);
    return [];
  }

  return (data || []).map(row => ({
    slug: row.id,
    name: row.name,
    description: row.description,
    image_url: toPublicImageUrl(row.image_url),
    created_at: row.created_at,
  }));
}