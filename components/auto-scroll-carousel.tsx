'use client';
import { useRef, useEffect, useCallback, ReactNode } from 'react';
import { Creator, Product, IdeaProduct } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';
import { IdeaCard } from './idea-card';

// ── 自動スクロール + ホバー時滑らか横スクロール ─────────────────
function ScrollTrack({ children, speed = 0.5 }: {
  children: ReactNode;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);       // 慣性用の速度
  const hovering = useRef(false);
  const raf = useRef(0);
  const halfWidth = useRef(0);

  const measureHalf = useCallback(() => {
    if (trackRef.current) {
      halfWidth.current = trackRef.current.scrollWidth / 2;
    }
  }, []);

  const applyTransform = useCallback(() => {
    if (!trackRef.current) return;
    const hw = halfWidth.current;
    if (hw > 0) {
      offset.current = ((offset.current % hw) + hw) % hw;
    }
    trackRef.current.style.transform = `translateX(-${offset.current}px)`;
  }, []);

  // メインループ: 自動スクロール + 慣性処理を統合
  useEffect(() => {
    measureHalf();
    let running = true;

    const tick = () => {
      if (!running) return;

      if (hovering.current) {
        // ホバー中: 慣性を減衰させながら適用
        if (Math.abs(velocity.current) > 0.1) {
          offset.current += velocity.current;
          velocity.current *= 0.92; // 減衰係数（滑らかさ調整）
          applyTransform();
        } else {
          velocity.current = 0;
        }
      } else {
        // 自動スクロール
        velocity.current = 0;
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
  const onEnter = useCallback(() => {
    hovering.current = true;
    velocity.current = 0;
  }, []);
  const onLeave = useCallback(() => {
    hovering.current = false;
    velocity.current = 0;
  }, []);

  // ホイール・トラックパッド → velocity に加算（滑らか）
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      if (!hovering.current) return;

      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > absY && absX > 1) {
        e.preventDefault();
        // velocityに加算（連続スワイプで加速）
        velocity.current += e.deltaX * 0.3;
        // 速度制限
        velocity.current = Math.max(-30, Math.min(30, velocity.current));
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // ドラッグ → offset直接操作
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    let dragging = false;
    let startX = 0;
    let startOffset = 0;
    let lastX = 0;
    let lastTime = 0;

    const onDown = (e: MouseEvent) => {
      if (!hovering.current) return;
      dragging = true;
      startX = e.pageX;
      lastX = e.pageX;
      lastTime = Date.now();
      startOffset = offset.current;
      velocity.current = 0;
      container.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const now = Date.now();
      const dt = now - lastTime;
      if (dt > 0) {
        velocity.current = (lastX - e.pageX) / dt * 16; // px/frame
      }
      lastX = e.pageX;
      lastTime = now;
      offset.current = startOffset - (e.pageX - startX);
      applyTransform();
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      container.style.cursor = '';
      // velocityはtickループ内で減衰処理
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

  // タッチ横スワイプ（慣性付き）
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    let touchStartX = 0;
    let touchStartOffset = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      lastTouchX = touchStartX;
      lastTouchTime = Date.now();
      touchStartOffset = offset.current;
      velocity.current = 0;
      hovering.current = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].clientX;
      const dx = x - touchStartX;
      if (Math.abs(dx) > 5) {
        e.preventDefault();
        const now = Date.now();
        const dt = now - lastTouchTime;
        if (dt > 0) {
          velocity.current = (lastTouchX - x) / dt * 16;
        }
        lastTouchX = x;
        lastTouchTime = now;
        offset.current = touchStartOffset - dx;
        applyTransform();
      }
    };
    const onTouchEnd = () => {
      hovering.current = false;
      // velocityはtickで減衰 → 0になったら自動スクロール再開
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    container.addEventListener('touchend', onTouchEnd);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      container.removeEventListener('touchend', onTouchEnd);
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

// ── IDEAカルーセル ─────────────────────────────────────────
export function IdeaScrollCarousel({ ideas }: { ideas: IdeaProduct[] }) {
  if (ideas.length === 0) return null;
  return (
    <ScrollTrack speed={0.5}>
      {ideas.map((idea) => (
        <div key={idea.slug} className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]">
          <IdeaCard idea={idea} />
        </div>
      ))}
    </ScrollTrack>
  );
}
