'use client';
import { useRef, useEffect, useCallback, ReactNode } from 'react';
import { Creator, Product, IdeaProduct } from '@/types';
import { CreatorCard } from './creator-card';
import { ProductCard } from './product-card';
import { IdeaCard } from './idea-card';

// ── 自動スクロール + ホバー/タッチ時滑らか横スクロール ─────────────────
function ScrollTrack({ children, speed = 0.5 }: {
  children: ReactNode;
  speed?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const offset = useRef(0);
  const velocity = useRef(0);
  const hovering = useRef(false);
  const touching = useRef(false);
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

      const isInteracting = hovering.current || touching.current;

      if (isInteracting) {
        // 操作中: 慣性を減衰させながら適用
        if (Math.abs(velocity.current) > 0.15) {
          offset.current += velocity.current;
          // SP（タッチ）は減衰を緩やかにして慣性を長くする
          const decay = touching.current ? 0.96 : 0.93;
          velocity.current *= decay;
          applyTransform();
        } else {
          velocity.current = 0;
        }
      } else {
        // 自動スクロール（慣性が残っていれば減衰しながら移行）
        if (Math.abs(velocity.current) > 0.5) {
          offset.current += velocity.current;
          velocity.current *= 0.9;
          applyTransform();
        } else {
          velocity.current = 0;
          offset.current += speed;
          applyTransform();
        }
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

  // ホバー検知（PC）
  const onEnter = useCallback(() => {
    hovering.current = true;
    velocity.current = 0;
  }, []);
  const onLeave = useCallback(() => {
    hovering.current = false;
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
        velocity.current += e.deltaX * 0.35;
        velocity.current = Math.max(-35, Math.min(35, velocity.current));
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => container.removeEventListener('wheel', onWheel);
  }, []);

  // ドラッグ → offset直接操作（PC）
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
        velocity.current = (lastX - e.pageX) / dt * 16;
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

  // タッチ横スワイプ（改善版: 方向ロック + 速度履歴で滑らか慣性）
  useEffect(() => {
    const container = trackRef.current?.parentElement;
    if (!container) return;

    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartOffset = 0;
    let directionLocked: 'h' | 'v' | null = null;
    // 速度履歴（直近数フレームの平均をとる）
    const velocityHistory: { v: number; t: number }[] = [];

    const onTouchStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchStartOffset = offset.current;
      directionLocked = null;
      velocityHistory.length = 0;
      velocity.current = 0;
      touching.current = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;

      // 方向ロック判定（最初の大きな動きで決定）
      if (!directionLocked) {
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          directionLocked = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
        } else {
          return; // まだ判定できない
        }
      }

      // 縦スクロールならタッチ解除
      if (directionLocked === 'v') return;

      // 横スワイプ確定
      e.preventDefault();

      const now = Date.now();
      // 速度計算 (px/frame @60fps = px/16.67ms)
      if (velocityHistory.length > 0) {
        const last = velocityHistory[velocityHistory.length - 1];
        const dt = now - last.t;
        if (dt > 0) {
          const v = (last.v - touch.clientX) / dt * 16;
          velocityHistory.push({ v: touch.clientX, t: now });
          // 直近50ms分だけ保持
          while (velocityHistory.length > 1 && now - velocityHistory[0].t > 50) {
            velocityHistory.shift();
          }
          velocity.current = v;
        }
      } else {
        velocityHistory.push({ v: touch.clientX, t: now });
      }

      offset.current = touchStartOffset - dx;
      applyTransform();
    };

    const onTouchEnd = () => {
      // 速度履歴から平均velocityを算出してセット（滑らかな慣性のため）
      if (velocityHistory.length >= 2) {
        const first = velocityHistory[0];
        const last = velocityHistory[velocityHistory.length - 1];
        const dt = last.t - first.t;
        if (dt > 0) {
          velocity.current = (first.v - last.v) / dt * 16;
          // 速度制限
          velocity.current = Math.max(-40, Math.min(40, velocity.current));
        }
      }
      // touchingはtrueのまま → tickループで慣性減衰
      // 慣性が0になったらtouchingをfalseにする（tickで判定）
      setTimeout(() => {
        touching.current = false;
      }, 2000); // 最大2秒後に自動スクロール再開
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
