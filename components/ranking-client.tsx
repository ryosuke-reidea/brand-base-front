'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatJPY } from '@/lib/utils';
import { AvatarGenerator } from '@/components/avatar-generator';
import { Trophy } from 'lucide-react';
import { Creator, Product, Rankings } from '@/types';

interface RankingClientProps {
  rankings: Rankings;
  creators: Creator[];
  products: Product[];
}

export function RankingClient({ rankings, creators, products }: RankingClientProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'single' | 'product'>('personal');

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-gray-700" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">ランキング</h1>
          <p className="text-gray-600">
            BRAND-BASEの実績トップランキング
          </p>
        </div>

        <div className="overflow-x-auto mb-12 -mx-4 px-4 scrollbar-hide">
          <div className="flex justify-center gap-2 min-w-max">
            <Button
              variant={activeTab === 'personal' ? 'default' : 'outline'}
              onClick={() => setActiveTab('personal')}
              className={
                activeTab === 'personal'
                  ? 'bg-gray-900 hover:bg-gray-800 whitespace-nowrap'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 whitespace-nowrap'
              }
            >
              個人販売累計額
            </Button>
            <Button
              variant={activeTab === 'single' ? 'default' : 'outline'}
              onClick={() => setActiveTab('single')}
              className={
                activeTab === 'single'
                  ? 'bg-gray-900 hover:bg-gray-800 whitespace-nowrap'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 whitespace-nowrap'
              }
            >
              単発商品販売額
            </Button>
            <Button
              variant={activeTab === 'product' ? 'default' : 'outline'}
              onClick={() => setActiveTab('product')}
              className={
                activeTab === 'product'
                  ? 'bg-gray-900 hover:bg-gray-800 whitespace-nowrap'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 whitespace-nowrap'
              }
            >
              商品販売累計額
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {activeTab === 'personal' &&
            rankings.personal_lifetime.slice(0, 10).map((entry, index) => {
              const creator = creators.find((c) => c.slug === entry.slug);
              if (!creator) return null;

              return (
                <Link key={entry.slug} href={`/creators/${creator.slug}`}>
                  <Card
                    className={`bg-white border-gray-200 hover:border-gray-400 transition-all p-4 md:p-6 ${
                      index < 3 ? 'hover:shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                      <Badge
                        className={`text-lg sm:text-xl md:text-2xl font-bold min-w-[48px] sm:min-w-[56px] md:min-w-[60px] h-[48px] sm:h-[56px] md:h-[60px] flex items-center justify-center flex-shrink-0 ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        #{index + 1}
                      </Badge>

                      {creator.image_url ? (
                        <img
                          src={creator.image_url}
                          alt={creator.display_name}
                          className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-[60px] md:h-[60px] rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="flex-shrink-0">
                          <AvatarGenerator seed={creator.avatar_seed} size={48} className="sm:hidden" />
                          <AvatarGenerator seed={creator.avatar_seed} size={56} className="hidden sm:block md:hidden" />
                          <AvatarGenerator seed={creator.avatar_seed} size={60} className="hidden md:block" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1 truncate">
                          {creator.display_name}
                        </div>
                        <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                          {creator.category}
                        </Badge>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
                          {formatJPY(entry.value)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500 mt-1 whitespace-nowrap">
                          {creator.projects_count}件
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}

          {activeTab === 'single' &&
            rankings.best_single_product.slice(0, 10).map((entry, index) => {
              const product = products.find((p) => p.slug === entry.slug);
              const creator = product ? creators.find((c) => c.slug === product.creator_slug) : null;
              if (!product) return null;

              return (
                <Link key={entry.slug} href={`/products/${product.slug}`}>
                  <Card
                    className={`bg-white border-gray-200 hover:border-gray-400 transition-all p-4 md:p-6 ${
                      index < 3 ? 'hover:shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                      <Badge
                        className={`text-lg sm:text-xl md:text-2xl font-bold min-w-[48px] sm:min-w-[56px] md:min-w-[60px] h-[48px] sm:h-[56px] md:h-[60px] flex items-center justify-center flex-shrink-0 ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        #{index + 1}
                      </Badge>

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl sm:text-xl md:text-2xl text-gray-400 font-bold">
                            {product.product_name.substring(0, 1)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1 line-clamp-1">
                          {product.product_name}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                            {product.category}
                          </Badge>
                          {creator && (
                            <span className="text-xs sm:text-sm text-gray-500 truncate">by {creator.display_name}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
                          {formatJPY(entry.value)}
                        </div>
                        {product.funding_percent && (
                          <div className="text-xs sm:text-sm text-gray-500 mt-1 whitespace-nowrap">
                            {product.funding_percent}% 達成
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}

          {activeTab === 'product' &&
            rankings.product_lifetime.slice(0, 10).map((entry, index) => {
              const product = products.find((p) => p.slug === entry.slug);
              const creator = product ? creators.find((c) => c.slug === product.creator_slug) : null;
              if (!product) return null;

              return (
                <Link key={entry.slug} href={`/products/${product.slug}`}>
                  <Card
                    className={`bg-white border-gray-200 hover:border-gray-400 transition-all p-4 md:p-6 ${
                      index < 3 ? 'hover:shadow-lg' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                      <Badge
                        className={`text-lg sm:text-xl md:text-2xl font-bold min-w-[48px] sm:min-w-[56px] md:min-w-[60px] h-[48px] sm:h-[56px] md:h-[60px] flex items-center justify-center flex-shrink-0 ${
                          index === 0
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
                            : index === 1
                            ? 'bg-gray-100 text-gray-700 border-gray-300'
                            : index === 2
                            ? 'bg-orange-100 text-orange-700 border-orange-300'
                            : 'bg-gray-100 text-gray-700 border-gray-300'
                        }`}
                      >
                        #{index + 1}
                      </Badge>

                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.product_name}
                          className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-16 md:h-16 rounded-xl object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-[48px] h-[48px] sm:w-[56px] sm:h-[56px] md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl sm:text-xl md:text-2xl text-gray-400 font-bold">
                            {product.product_name.substring(0, 1)}
                          </span>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-base sm:text-lg md:text-xl text-gray-900 mb-1 line-clamp-1">
                          {product.product_name}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs border-gray-300 text-gray-700">
                            {product.category}
                          </Badge>
                          {creator && (
                            <span className="text-xs sm:text-sm text-gray-500 truncate">by {creator.display_name}</span>
                          )}
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 whitespace-nowrap">
                          {formatJPY(entry.value)}
                        </div>
                        {product.lifetime_units && (
                          <div className="text-xs sm:text-sm text-gray-500 mt-1 whitespace-nowrap">
                            {product.lifetime_units.toLocaleString()}個販売
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
        </div>
      </div>
    </div>
  );
}
