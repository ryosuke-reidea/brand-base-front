'use client';
import { useRef, useEffect, ReactNode } from 'react';
import { Creator, Product } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';

// ── 横スクロール対応コンテナ ───────────────────────────────────
function ScrollTrack({ children, speed = 0.5 }: {
  children: ReactNode;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);
  const velocity = useRef(0);
  const lastX = useRef(0);
  const lastTime = useRef(0);
  const animFrame = useRef(0);
  const autoScrollSpeed = useRef(speed);
  const isUserInteracting = useRef(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    // ── 自動スクロール ──
    let running = true;
    const autoScroll = () => {
      if (!running) return;
      if (!isUserInteracting.current && track) {
        track.scrollLeft += autoScrollSpeed.current;
        // ループ: スクロール末端に達したら先頭に戻す
        if (track.scrollLeft >= track.scrollWidth - track.clientWidth - 1) {
          track.scrollLeft = 0;
        }
      }
      animFrame.current = requestAnimationFrame(autoScroll);
    };
    animFrame.current = requestAnimationFrame(autoScroll);

    // ── マウスドラッグ ──
    const onMouseDown = (e: MouseEvent) => {
      isDragging.current = true;
      isUserInteracting.current = true;
      startX.current = e.pageX - track.offsetLeft;
      scrollLeft.current = track.scrollLeft;
      lastX.current = e.pageX;
      lastTime.current = Date.now();
      velocity.current = 0;
      track.style.cursor = 'grabbing';
      clearTimeout(resumeTimer.current);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      e.preventDefault();
      const x = e.pageX - track.offsetLeft;
      const walk = (x - startX.current) * 1.5;
      track.scrollLeft = scrollLeft.current - walk;

      const now = Date.now();
      const dt = now - lastTime.current;
      if (dt > 0) {
        velocity.current = (e.pageX - lastX.current) / dt;
      }
      lastX.current = e.pageX;
      lastTime.current = now;
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      track.style.cursor = 'grab';

      // 慣性スクロール
      let v = velocity.current * 15;
      const decelerate = () => {
        if (Math.abs(v) < 0.5) {
          resumeTimer.current = setTimeout(() => {
            isUserInteracting.current = false;
          }, 2000);
          return;
        }
        track.scrollLeft -= v;
        v *= 0.95;
        requestAnimationFrame(decelerate);
      };
      requestAnimationFrame(decelerate);
    };

    // ── ホイール（縦スクロール→横スクロールに変換）──
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        // 横方向のホイール/トラックパッド操作
        e.preventDefault();
        track.scrollLeft += e.deltaX;
      } else if (Math.abs(e.deltaY) > 0) {
        // 縦方向を横に変換
        e.preventDefault();
        track.scrollLeft += e.deltaY;
      }
      isUserInteracting.current = true;
      clearTimeout(resumeTimer.current);
      resumeTimer.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 2000);
    };

    // ── タッチ ──
    let touchStartX = 0;
    let touchScrollLeft = 0;

    const onTouchStart = (e: TouchEvent) => {
      isUserInteracting.current = true;
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = track.scrollLeft;
      clearTimeout(resumeTimer.current);
    };

    const onTouchMove = (e: TouchEvent) => {
      const x = e.touches[0].pageX;
      const walk = (x - touchStartX) * 1.5;
      track.scrollLeft = touchScrollLeft - walk;
    };

    const onTouchEnd = () => {
      resumeTimer.current = setTimeout(() => {
        isUserInteracting.current = false;
      }, 2000);
    };

    track.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    track.addEventListener('wheel', onWheel, { passive: false });
    track.addEventListener('touchstart', onTouchStart, { passive: true });
    track.addEventListener('touchmove', onTouchMove, { passive: true });
    track.addEventListener('touchend', onTouchEnd);

    return () => {
      running = false;
      cancelAnimationFrame(animFrame.current);
      clearTimeout(resumeTimer.current);
      track.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      track.removeEventListener('wheel', onWheel);
      track.removeEventListener('touchstart', onTouchStart);
      track.removeEventListener('touchmove', onTouchMove);
      track.removeEventListener('touchend', onTouchEnd);
    };
  }, [speed]);

  return (
    <div
      ref={trackRef}
      className="flex gap-6 overflow-x-hidden cursor-grab select-none scrollbar-hide"
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
      {/* 複製してループ感を出す */}
      {children}
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
    <ScrollTrack speed={0.5}>
      {creators.map((creator) => (
        <div
          key={creator.slug}
          className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
        >
          <CreatorCard creator={creator} />
        </div>
      ))}
    </ScrollTrack>
  );
}

// ── プロダクトカルーセル ────────────────────────────────────
interface ProductScrollCarouselProps {
  products: Product[];
}

export function ProductScrollCarousel({ products }: ProductScrollCarouselProps) {
  if (products.length === 0) return null;

  return (
    <ScrollTrack speed={0.5}>
      {products.map((product) => (
        <div
          key={product.slug}
          className="flex-shrink-0 w-[280px] sm:w-[300px] lg:w-[320px]"
        >
          <ProductCard product={product} />
        </div>
      ))}
    </ScrollTrack>
  );
}
