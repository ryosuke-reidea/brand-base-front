'use client';

import { useState } from 'react';
import { CreatorCard } from '@/components/creator-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Creator } from '@/types';

interface CreatorsClientProps {
  creators: Creator[];
}

export function CreatorsClient({ creators }: CreatorsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(creators.map((c) => c.category)))];

  const filteredCreators = creators.filter((creator) => {
    const matchesSearch =
      creator.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      creator.bio_short.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || creator.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white min-h-screen py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">クリエイター一覧</h1>
          <p className="text-gray-600">
            BRAND-BASEで活躍するクリエイターをご紹介します
          </p>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="クリエイター名で検索..."
              className="bg-white border-gray-200 text-gray-900 pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat)}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCreators.map((creator) => (
            <CreatorCard key={creator.slug} creator={creator} />
          ))}
        </div>

        {filteredCreators.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-600">該当するクリエイターが見つかりませんでした</p>
          </div>
        )}
      </div>
    </div>
  );
}
