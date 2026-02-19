import { getAllCreators, getAllProducts, getRankings, getPublishedIdeas, getSiteSettings } from '@/lib/db-queries';
import { HomeClient } from '@/components/home-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BRAND-BASE | 在庫ゼロでブランドを走らせる',
  description: '審査を通過すれば0円で収益化可能。OEM開発・製造・広告運用まで全て当社負担。',
};

export const revalidate = 60;

export default async function HomePage() {
  const [creators, products, rankings, ideas, siteSettings] = await Promise.all([
    getAllCreators(),
    getAllProducts(),
    getRankings(),
    getPublishedIdeas(),
    getSiteSettings(),
  ]);

  return (
    <HomeClient
      creators={creators}
      products={products}
      rankings={rankings}
      ideas={ideas}
      siteSettings={siteSettings}
    />
  );
}