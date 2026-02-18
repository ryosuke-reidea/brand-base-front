'use client';
import { useRef, useEffect, useState, useCallback, ReactNode } from 'react';
import { Creator, Product } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';

// ── 自動スクロール（CSS marquee）＋ホバー時横スクロール操作 ─────────
function ScrollTrack({ children, duration = 40 }: {
  children: ReactNode;
  duration?: number;
}) {
  const [hovering, setHovering] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const marqueeRef = useRef<HTMLDivElement>(null);
  const offsetRef = useRef(0);

  const onEnter = useCallback(() => {
    // marqueeの現在位置を取得してscrollLeftに引き継ぐ
    if (marqueeRef.current && scrollRef.current) {
      const style = window.getComputedStyle(marqueeRef.current);
      const matrix = new DOMMatrix(style.transform);
      const currentX = Math.abs(matrix.m41);
      scrollRef.current.scrollLeft = currentX;
      offsetRef.current = currentX;
    }
    setHovering(true);
  }, []);

  const onLeave = useCallback(() => {
    setHovering(false);
  }, []);

  // ホバー中: ホイール→横スクロール
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!hovering) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [hovering]);

  // ホバー中: ドラッグ
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: MouseEvent) => {
      if (!hovering) return;
      dragging = true;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      el.scrollLeft = startScroll - (e.pageX - startX) * 1.5;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = '';
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [hovering]);

  return (
    <div
      ref={scrollRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="overflow-hidden select-none"
      style={{ cursor: hovering ? 'grab' : 'default' }}
    >
      {/* 自動スクロール: CSS marquee（ホバー外） */}
      {!hovering && (
        <div
          ref={marqueeRef}
          className="marquee-track flex w-max gap-6"
          style={{ animation: `marquee ${duration}s linear infinite` }}
        >
          {children}
          {children}
        </div>
      )}

      {/* 手動スクロール: overflow-x-scroll（ホバー中） */}
      {hovering && (
        <div
          className="flex gap-6 overflow-x-auto scrollbar-hide"
          style={{ scrollBehavior: 'auto' }}
          ref={(el) => {
            if (el && offsetRef.current) {
              el.scrollLeft = offsetRef.current;
            }
          }}
        >
          {children}
          {children}
        </div>
      )}
    </div>
  );
}

// ── クリエイターカルーセル ──────────────────────────────────
export function AutoScrollCarousel({ creators }: { creators: Creator[] }) {
  if (creators.length === 0) return null;
  return (
    <ScrollTrack duration={creators.length * 4}>
      {creators.map((creator) => (
        <div key={creator.slug} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
          <CreatorCard creator={creator} />
        </div>
      ))}
    </ScrollTrack>
  );
}

// ── プロダクトカルーセル ────────────────────────────────────
export function ProductScrollCarousel({ products }: { products: Product[] }) {
  if (products.length === 0) return null;
  return (
    <ScrollTrack duration={products.length * 4}>
      {products.map((product) => (
        <div key={product.slug} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
          <ProductCard product={product} />
        </div>
      ))}
    </ScrollTrack>
  );
}
