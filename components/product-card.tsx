import Link from 'next/link';
import { Product } from '@/types';
import { formatJPY, getStatusLabel, getStatusColor } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Package } from 'lucide-react';
import { getCreatorBySlug } from '@/lib/data';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const creator = getCreatorBySlug(product.creator_slug);

  return (
    <Link href={`/products/${product.slug}`}>
      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 h-full rounded-2xl">
        <div className="aspect-video bg-gradient-to-br from-purple-100 to-pink-50 relative overflow-hidden">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2">
              <Package className="w-10 h-10 text-purple-300" />
              <span className="text-purple-300 text-xs font-medium">{product.product_name}</span>
            </div>
          )}
          <div className="absolute top-4 right-4">
            <Badge className={`${getStatusColor(product.campaign_status)} shadow-[0_4px_12px_rgba(0,0,0,0.4)] font-semibold text-sm px-4 py-1.5 ring-2 ring-white/50`}>
              {getStatusLabel(product.campaign_status)}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gray-700 transition-colors duration-300 line-clamp-1">
              {product.product_name}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 font-medium">
                {product.category}
              </Badge>
              {product.funding_percent && (
                <span className="text-xs text-gray-500 font-medium">
                  {product.funding_percent}% 達成
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {formatJPY(product.lifetime_sales_jpy)}
            </div>
            <div className="text-xs text-gray-500 font-medium tracking-wide mt-1">累計販売額</div>
          </div>

          {creator && (
            <div className="text-sm text-gray-600 mb-5 font-medium">
              by {creator.display_name}
            </div>
          )}

          <div className="flex items-center text-gray-900 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
            商品を見る
            <ArrowRight className="ml-2 w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
