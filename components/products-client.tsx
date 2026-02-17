'use client';

import { useState } from 'react';
import { ProductCard } from '@/components/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { CampaignStatus, Product } from '@/types';

interface ProductsClientProps {
  products: Product[];
}

export function ProductsClient({ products }: ProductsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<CampaignStatus | 'all'>('all');

  const categories = ['all', ...Array.from(new Set(products.map((p) => p.category)))];
  const statuses: Array<CampaignStatus | 'all'> = ['all', 'live', 'funded', 'indemand', 'archived'];

  const statusLabels = {
    all: 'すべて',
    live: '公開中',
    funded: '達成',
    indemand: '継続販売',
    archived: '終了',
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || product.campaign_status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">商品一覧</h1>
          <p className="text-gray-600">
            クラウドファンディングで成功した商品をご紹介します
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="商品名で検索..."
              className="bg-white border-gray-200 text-gray-900 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(cat)}
                  size="sm"
                  className={
                    selectedCategory === cat
                      ? 'bg-gray-900 hover:bg-gray-800 whitespace-nowrap'
                      : 'border-gray-200 text-gray-600 hover:text-gray-900 whitespace-nowrap'
                  }
                >
                  {cat === 'all' ? 'すべて' : cat}
                </Button>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto">
              {statuses.map((status) => (
                <Button
                  key={status}
                  variant={selectedStatus === status ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus(status)}
                  size="sm"
                  className={
                    selectedStatus === status
                      ? 'bg-gray-900 hover:bg-gray-800 whitespace-nowrap'
                      : 'border-gray-200 text-gray-600 hover:text-gray-900 whitespace-nowrap'
                  }
                >
                  {statusLabels[status]}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600">該当する商品が見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
