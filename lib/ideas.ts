// lib/ideas.ts
import { IdeaProduct } from '@/types';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const STORAGE_BUCKET = 'product-images';

interface IdeaProductRow {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

/**
 * Storage path（例: "ai-generated/xxx.png"）を公開URLに変換する。
 * 既にhttp(s)で始まる外部URLはそのまま返す。
 */
function toPublicUrl(imageUrlOrPath: string | null): string | null {
  if (!imageUrlOrPath) return null;
  if (imageUrlOrPath.startsWith('http')) return imageUrlOrPath;
  return `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}/${imageUrlOrPath}`;
}

export async function getPublishedIdeas(): Promise<IdeaProduct[]> {
  try {
    const params = new URLSearchParams({
      select: 'id,name,description,image_url,created_at',
      status: 'eq.published',
      order: 'created_at.desc',
    });

    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/idea_products?${params.toString()}`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 60 },
      }
    );

    if (!res.ok) {
      console.error('Failed to fetch ideas:', res.status, await res.text());
      return [];
    }

    const rows: IdeaProductRow[] = await res.json();
    return rows.map((row) => ({
      slug: row.id,
      name: row.name,
      description: row.description,
      image_url: toPublicUrl(row.image_url),
      created_at: row.created_at,
    }));
  } catch (error) {
    console.error('getPublishedIdeas error:', error);
    return [];
  }
}