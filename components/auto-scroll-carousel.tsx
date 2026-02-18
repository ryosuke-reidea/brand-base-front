'use client';
import { useRef, useEffect, useCallback, ReactNode } from 'react';
import { Creator, Product } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';

// ── 自動スクロール＋ホバー時横スクロール操作対応 ──────────────────
function ScrollTrack({ children, speed = 0.5 }: {
  children: ReactNode;
  speed?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovering = useRef(false);
  const animFrame = useRef(0);

  // 自動スクロール + ループ
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let running = true;

    const tick = () => {
      if (!running) return;
      if (!isHovering.current) {
        el.scrollLeft += speed;
        // 半分を超えたら先頭に巻き戻してループ
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) {
          el.scrollLeft -= half;
        }
      }
      animFrame.current = requestAnimationFrame(tick);
    };
    animFrame.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(animFrame.current);
    };
  }, [speed]);

  // ホバー検知
  const onEnter = useCallback(() => { isHovering.current = true; }, []);
  const onLeave = useCallback(() => { isHovering.current = false; }, []);

  // ホイール → 横スクロールに変換
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (!isHovering.current) return;
      e.preventDefault();
      // 縦でも横でも横スクロールに変換
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      el.scrollLeft += delta;

      // ループ維持
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      if (el.scrollLeft <= 0) el.scrollLeft += half;
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // ドラッグ操作
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScroll = 0;

    const onDown = (e: MouseEvent) => {
      if (!isHovering.current) return;
      dragging = true;
      startX = e.pageX;
      startScroll = el.scrollLeft;
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const walk = (e.pageX - startX) * 1.5;
      el.scrollLeft = startScroll - walk;

      // ループ維持
      const half = el.scrollWidth / 2;
      if (el.scrollLeft >= half) el.scrollLeft -= half;
      if (el.scrollLeft <= 0) el.scrollLeft += half;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = 'grab';
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="flex gap-6 overflow-x-hidden cursor-grab select-none scrollbar-hide"
    >
      {children}
      {children}
    </div>
  );
}

// ── クリエイターカルーセル ──────────────────────────────────
export function AutoScrollCarousel({ creators }: { creators: Creator[] }) {
  if (creators.length === 0) return null;
  return (
    <ScrollTrack speed={0.5}>
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
    <ScrollTrack speed={0.5}>
      {products.map((product) => (
        <div key={product.slug} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
          <ProductCard product={product} />
        </div>
      ))}
    </ScrollTrack>
  );
}
