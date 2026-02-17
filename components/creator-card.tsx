import { memo } from 'react';
import Link from 'next/link';
import { Creator } from '@/types';
import { AvatarGenerator } from './avatar-generator';
import { formatJPY } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';

interface CreatorCardProps {
  creator: Creator;
}

export const CreatorCard = memo(function CreatorCard({ creator }: CreatorCardProps) {
  return (
    <Link href={`/creators/${creator.slug}`}>
      <Card className="group relative overflow-hidden bg-white/80 backdrop-blur-sm border border-gray-100 hover:border-gray-200 transition-all duration-500 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 h-full will-change-[border-color,box-shadow,transform] rounded-2xl">
        <div className="p-8">
          <div className="flex items-start gap-5 mb-6">
            {creator.image_url ? (
              <img
                src={creator.image_url}
                alt={creator.display_name}
                className="w-16 h-16 rounded-2xl object-cover flex-shrink-0 ring-2 ring-gray-100"
                loading="lazy"
              />
            ) : (
              <div className="ring-2 ring-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                <AvatarGenerator seed={creator.avatar_seed} size={64} className="flex-shrink-0" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-bold text-gray-900 mb-2 truncate group-hover:text-gray-700 transition-colors duration-300">
                {creator.display_name}
              </h3>
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600 font-medium">
                {creator.category}
              </Badge>
            </div>
          </div>

          <p className="text-gray-600 text-sm mb-6 line-clamp-2 leading-relaxed">
            {creator.bio_short}
          </p>

          <div className="space-y-3 mb-6">
            <div>
              <div className="text-3xl font-bold text-gray-900 tracking-tight">
                {formatJPY(creator.lifetime_sales_jpy)}
              </div>
              <div className="text-xs text-gray-500 font-medium tracking-wide mt-1">累計販売額</div>
            </div>
            <div className="flex gap-6 text-sm">
              <div>
                <span className="text-gray-900 font-semibold">{creator.projects_count}件</span>
                <span className="text-gray-500 ml-1.5">プロジェクト</span>
              </div>
              <div>
                <span className="text-gray-900 font-semibold">{creator.active_since_year}年</span>
                <span className="text-gray-500">〜</span>
              </div>
            </div>
          </div>

          <div className="flex items-center text-gray-900 text-sm font-semibold group-hover:translate-x-2 transition-transform duration-300">
            プロフィールを見る
            <ArrowRight className="ml-2 w-4 h-4" />
          </div>
        </div>
      </Card>
    </Link>
  );
});
