import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCreatorBySlug, getProductsByCreator, getAllCreators } from '@/lib/db-queries';
import { AvatarGenerator } from '@/components/avatar-generator';
import { ProductCard } from '@/components/product-card';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatJPY } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Package, Calendar } from 'lucide-react';

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const creators = await getAllCreators();
  return creators.map((creator) => ({
    slug: creator.slug,
  }));
}

export default async function CreatorDetailPage({ params }: PageProps) {
  const creator = await getCreatorBySlug(params.slug);

  if (!creator) {
    notFound();
  }

  const creatorProducts = await getProductsByCreator(params.slug);

  return (
    <div className="bg-gradient-to-b from-white via-purple-50/10 to-white min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          href="/creators"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-12 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          クリエイター一覧に戻る
        </Link>

        <div className="mb-16">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="flex-shrink-0">
              {creator.image_url ? (
                <img
                  src={creator.image_url}
                  alt={creator.display_name}
                  className="w-[140px] h-[140px] rounded-3xl object-cover ring-4 ring-purple-100 shadow-xl shadow-purple-200/50"
                />
              ) : (
                <div className="ring-4 ring-purple-100 rounded-3xl overflow-hidden shadow-xl shadow-purple-200/50">
                  <AvatarGenerator seed={creator.avatar_seed} size={140} />
                </div>
              )}
            </div>
            <div className="flex-1">
              <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300 mb-4 text-sm px-4 py-1.5">
                {creator.category}
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">
                {creator.display_name}
              </h1>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                {creator.bio_full || creator.bio_short}
              </p>
              <div className="flex gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">{creator.active_since_year}年から活動</span>
                </div>
                <div className="font-medium">
                  {creator.projects_count}件のプロジェクト
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-500 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium tracking-wide">累計販売額</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{formatJPY(creator.lifetime_sales_jpy)}</div>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-500 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium tracking-wide">販売個数</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{creator.lifetime_units.toLocaleString()}個</div>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:shadow-2xl hover:shadow-purple-200/30 transition-all duration-500 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-gray-500 text-sm font-medium tracking-wide">プロジェクト数</h3>
            </div>
            <div className="text-4xl font-bold text-gray-900 tracking-tight">{creator.projects_count}件</div>
          </Card>
        </div>

        {creator.bio_full && (
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-10 mb-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">ストーリー</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-lg">
              {creator.bio_full}
            </p>
          </Card>
        )}

        <div className="mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-10 tracking-tight">プロジェクト一覧</h2>
          {creatorProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {creatorProducts.map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          ) : (
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-16 text-center rounded-2xl">
              <p className="text-gray-600 text-lg">プロジェクト情報は準備中です</p>
            </Card>
          )}
        </div>

        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border border-purple-200 p-12 text-center rounded-3xl shadow-xl shadow-purple-200/50">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            あなたもクリエイターとして参加しませんか？
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            アイデアを形にし、世界に届けるサポートをします
          </p>
          <Link href="/apply">
            <Button size="lg" className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white px-10 py-7 rounded-xl shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-500 font-semibold text-base">
              アイデアを応募する
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
