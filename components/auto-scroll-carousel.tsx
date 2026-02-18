'use client';
import { ReactNode } from 'react';
import { Creator, Product } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';

// ── 汎用マーキーコンテナ ───────────────────────────────────
function MarqueeTrack({ children, duration = 40, pauseOnHover = true }: {
  children: ReactNode;
  duration?: number;
  pauseOnHover?: boolean;
}) {
  return (
    <div className={`overflow-hidden ${pauseOnHover ? 'marquee-container' : ''}`}>
      <div
        className="marquee-track flex w-max gap-6"
        style={{
          animation: `marquee ${duration}s linear infinite`,
        }}
      >
        {children}
        {children}
      </div>
    </div>
  );
}

// ── クリエイターカルーセル ──────────────────────────────────
interface AutoScrollCarouselProps {
  creators: Creator[];
}

export function AutoScrollCarousel({ creators }: AutoScrollCarouselProps) {
  if (creators.length === 0) return null;

  return (
    <MarqueeTrack duration={creators.length * 4}>
      {creators.map((creator) => (
        <div
          key={creator.slug}
          className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
        >
          <CreatorCard creator={creator} />
        </div>
      ))}
    </MarqueeTrack>
  );
}

// ── プロダクトカルーセル ────────────────────────────────────
interface ProductScrollCarouselProps {
  products: Product[];
}

export function ProductScrollCarousel({ products }: ProductScrollCarouselProps) {
  if (products.length === 0) return null;

  return (
    <MarqueeTrack duration={products.length * 4}>
      {products.map((product) => (
        <div
          key={product.slug}
          className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </MarqueeTrack>
  );
}
