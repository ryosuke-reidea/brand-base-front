'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';
import { IdeaProduct } from '@/types';

interface IdeaCardProps {
  idea: IdeaProduct;
}

function formatMonth(isoString: string): string {
  const d = new Date(isoString);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

export function IdeaCard({ idea }: IdeaCardProps) {
  return (
    <Card className="bg-white border-gray-100 overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-100/40 transition-all duration-300 group rounded-2xl flex flex-col h-full">
      {/* サムネイル */}
      <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden shrink-0">
        {idea.image_url ? (
          <img
            src={idea.image_url}
            alt={idea.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-blue-300">
            <Lightbulb className="w-12 h-12" />
            <span className="text-xs text-blue-400 font-medium">IDEA</span>
          </div>
        )}

        {/* オーバーレイグラデーション */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* IDEAバッジ */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-blue-600/90 text-white border-0 text-xs font-semibold px-2.5 py-1 backdrop-blur-sm shadow-sm">
            <Lightbulb className="w-3 h-3 mr-1 inline" />
            IDEA
          </Badge>
        </div>
      </div>

      {/* カード本文 */}
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base leading-snug line-clamp-2 mb-2 group-hover:text-blue-700 transition-colors duration-200">
          {idea.name}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed flex-1">
          {idea.description || 'アイデアの詳細は審査中です。'}
        </p>

        {/* フッター（日付のみ） */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
          <div className="text-xs text-gray-400">
            {formatMonth(idea.created_at)}
          </div>
        </div>
      </div>
    </Card>
  );
}