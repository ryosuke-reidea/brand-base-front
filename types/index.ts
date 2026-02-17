export type CampaignStatus = 'live' | 'funded' | 'indemand' | 'archived';

export interface Creator {
  slug: string;
  display_name: string;
  category: string;
  bio_short: string;
  bio_full?: string;
  active_since_year: number;
  lifetime_sales_jpy: number;
  lifetime_units: number;
  projects_count: number;
  avatar_seed: string;
  image_url?: string;
}

export interface Product {
  slug: string;
  product_name: string;
  category: string;
  campaign_status: CampaignStatus;
  funding_percent?: number;
  lifetime_sales_jpy: number;
  lifetime_units?: number;
  creator_slug: string;
  image_url?: string;
  description?: string;
  why_successful?: string;
}

export interface RankingEntry {
  slug: string;
  value: number;
  name?: string;
}

export interface Rankings {
  personal_lifetime: RankingEntry[];
  best_single_product: RankingEntry[];
  product_lifetime: RankingEntry[];
}

// 旧 ideas テーブル用（既存ページで使用）
export interface Idea {
  slug: string;
  idea_name: string;
  idea_description: string;
  creator_name: string;
  creator_email: string;
  ai_image_url?: string;
  status: 'pending' | 'approved' | 'rejected';
  likes_count: number;
  views_count: number;
  created_at: string;
}

// idea_products テーブルの published レコード（LP表示用）
export interface IdeaProduct {
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  created_at: string;
}