import { getAllCreators, getAllProducts, getRankings } from '@/lib/db-queries';
import { RankingClient } from '@/components/ranking-client';

export const revalidate = 60;

export default async function RankingPage() {
  const rankings = await getRankings();
  const creators = await getAllCreators();
  const products = await getAllProducts();

  return <RankingClient rankings={rankings} creators={creators} products={products} />;
}
