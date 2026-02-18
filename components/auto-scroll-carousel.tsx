'use client';
import { useRef, useEffect, useCallback, ReactNode } from 'react';
import { Creator, Product } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';

// ── 自動スクロール + ホバー時手動操作（単一DOM・transformベース） ────
function ScrollTrack({ children, speed = 0.5 }: {
  children: ReactNode;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);       // 現在のtranslateX (px, 正の値=左方向)
  const hovering = useRef(false);
  const raf = useRef(0);
  const halfWidth = useRef(0);

  // halfWidth を計測
  const measureHalf = useCallback(() => {
    if (trackRef.current) {
      halfWidth.current = trackRef.current.scrollWidth / 2;
    }
  }, []);

  // transform を適用
  const applyTransform = useCallback(() => {
    if (!trackRef.current) return;
    // ループ: halfWidthを超えたら巻き戻す
    const hw = halfWidth.current;
    if (hw > 0) {
      offset.current = ((offset.current % hw) + hw) % hw;
    }
    trackRef.current.style.transform = `translateX(-${offset.current}px)`;
  }, []);

  // 自動スクロール
  useEffect(() => {
    measureHalf();
    let running = true;

    const tick = () => {
      if (!running) return;
      if (!hovering.current) {
        offset.current += speed;
        applyTransform();
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);

    return () => {
      running = false;
      cancelAnimationFrame(raf.current);
    };
  }, [speed, measureHalf, applyTransform]);

  // リサイズ時に再計測
  useEffect(() => {
    const onResize = () => measureHalf();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measureHalf]);

  // ホバー検知
  const onEnter = useCallback(() => { hovering.current = true; }, []);
  const onLeave = useCallback(() => { hovering.current = false; }, []);

  // ホイール → offset操作
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (!hovering.current) return;
      e.preventDefault();
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      offset.current += delta;
      applyTransform();
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, [applyTransform]);

  // ドラッグ → offset操作
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    let dragging = false;
    let startX = 0;
    let startOffset = 0;

    const onDown = (e: MouseEvent) => {
      if (!hovering.current) return;
      dragging = true;
      startX = e.pageX;
      startOffset = offset.current;
      container.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      offset.current = startOffset - (e.pageX - startX);
      applyTransform();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      container.style.cursor = '';
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [applyTransform]);

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className="overflow-hidden select-none cursor-grab"
    >
      <div ref={trackRef} className="flex w-max gap-6 will-change-transform">
        {children}
        {children}
      </div>
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
