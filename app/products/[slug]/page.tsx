import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProductBySlug, getCreatorBySlug, getAllProducts } from '@/lib/db-queries';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatJPY, getStatusLabel, getStatusColor } from '@/lib/utils';
import { ArrowLeft, TrendingUp, Package } from 'lucide-react';
import { AvatarGenerator } from '@/components/avatar-generator';

export const revalidate = 60;

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateStaticParams() {
  const products = await getAllProducts();
  return products.map((product) => ({
    slug: product.slug,
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  const creator = await getCreatorBySlug(product.creator_slug);

  return (
    <div className="bg-gradient-to-b from-white via-purple-50/10 to-white min-h-screen py-20">
      <div className="container mx-auto px-6 max-w-6xl">
        <Link
          href="/products"
          className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-12 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          商品一覧に戻る
        </Link>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-50 rounded-3xl overflow-hidden flex items-center justify-center shadow-xl shadow-purple-200/50">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.product_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center gap-3">
                <Package className="w-16 h-16 text-purple-300" />
                <span className="text-purple-400 text-lg font-semibold">{product.product_name}</span>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <Badge className={`${getStatusColor(product.campaign_status)} shadow-[0_4px_12px_rgba(0,0,0,0.4)] font-semibold text-sm px-4 py-1.5 ring-2 ring-white/50`}>
                {getStatusLabel(product.campaign_status)}
              </Badge>
              <Badge variant="outline" className="border-purple-300 text-purple-700 bg-purple-50">
                {product.category}
              </Badge>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              {product.product_name}
            </h1>

            {product.description && (
              <p className="text-lg text-gray-600 leading-relaxed">
                {product.description}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
          {creator && (
            <Link href={`/creators/${creator.slug}`}>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500 h-full rounded-2xl">
                <div className="flex items-center gap-4">
                  {creator.image_url ? (
                    <img
                      src={creator.image_url}
                      alt={creator.display_name}
                      className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 ring-2 ring-purple-100"
                    />
                  ) : (
                    <div className="ring-2 ring-purple-100 rounded-2xl overflow-hidden">
                      <AvatarGenerator seed={creator.avatar_seed} size={56} />
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-1 font-medium tracking-wide">クリエイター</div>
                    <div className="font-bold text-gray-900 truncate">{creator.display_name}</div>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <div className="text-xs text-gray-500 font-medium tracking-wide">累計販売額</div>
            </div>
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {formatJPY(product.lifetime_sales_jpy)}
            </div>
          </Card>

          {product.lifetime_units && (
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-purple-600" />
                <div className="text-xs text-gray-500 font-medium tracking-wide">販売個数</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {product.lifetime_units.toLocaleString()}個
              </div>
            </Card>
          )}

          {product.funding_percent && (
            <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-6 rounded-2xl hover:shadow-xl hover:shadow-purple-200/30 transition-all duration-500">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-5 h-5 text-purple-600" />
                <div className="text-xs text-gray-500 font-medium tracking-wide">達成率</div>
              </div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {product.funding_percent}%
              </div>
            </Card>
          )}
        </div>

        {product.why_successful && (
          <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-10 mb-16 rounded-2xl shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 tracking-tight">なぜ売れたか</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.why_successful}
            </p>
          </Card>
        )}

        <Card className="bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 border border-purple-200 p-12 text-center rounded-3xl shadow-xl shadow-purple-200/50">
          <h3 className="text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            あなたのアイデアも商品化しませんか？
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            在庫ゼロから始められる、新しいブランド作りをサポートします
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
