'use client';
import { useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Creator } from '@/types';
import { CreatorCard } from './creator-card';

interface AutoScrollCarouselProps {
  creators: Creator[];
}

export function AutoScrollCarousel({ creators }: AutoScrollCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: 'start',
    dragFree: false,
    containScroll: 'trimSnaps',
    skipSnaps: false,
    duration: 25,
    slidesToScroll: 1,
    startIndex: 0,
  });

  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const isInteractingRef = useRef(false);
  const wheelTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const accumulatedDeltaRef = useRef(0);

  const scrollSmooth = useCallback(() => {
    if (!emblaApi || isInteractingRef.current) return;
    emblaApi.scrollTo(emblaApi.selectedScrollSnap() + 1, true);
  }, [emblaApi]);

  const startAutoplay = useCallback(() => {
    if (autoplayRef.current) return;
    autoplayRef.current = setInterval(() => {
      scrollSmooth();
    }, 4000);
  }, [scrollSmooth]);

  const stopAutoplay = useCallback(() => {
    if (autoplayRef.current) {
      clearInterval(autoplayRef.current);
      autoplayRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!emblaApi) return;

    startAutoplay();

    const handleMouseEnter = () => {
      isInteractingRef.current = true;
      stopAutoplay();
    };

    const handleMouseLeave = () => {
      isInteractingRef.current = false;
      startAutoplay();
    };

    const handlePointerDown = () => {
      isInteractingRef.current = true;
      stopAutoplay();
    };

    const handlePointerUp = () => {
      setTimeout(() => {
        isInteractingRef.current = false;
        startAutoplay();
      }, 800);
    };

    const handleWheel = (e: WheelEvent) => {
      // 横方向のスクロールが縦方向より大きい場合のみ反応
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        
        if (wheelTimeoutRef.current) {
          clearTimeout(wheelTimeoutRef.current);
        }
        
        stopAutoplay();
        
        // スクロール量を累積
        accumulatedDeltaRef.current += e.deltaX;
        
        // 一定量（100px相当）累積したらスライドを移動
        const threshold = 100;
        if (Math.abs(accumulatedDeltaRef.current) >= threshold) {
          const slidesToMove = Math.floor(Math.abs(accumulatedDeltaRef.current) / threshold);
          
          if (accumulatedDeltaRef.current > 0) {
            for (let i = 0; i < slidesToMove; i++) {
              emblaApi.scrollNext();
            }
          } else {
            for (let i = 0; i < slidesToMove; i++) {
              emblaApi.scrollPrev();
            }
          }
          
          // 使用した分を差し引く
          accumulatedDeltaRef.current = accumulatedDeltaRef.current % threshold;
        }
        
        wheelTimeoutRef.current = setTimeout(() => {
          accumulatedDeltaRef.current = 0; // リセット
          startAutoplay();
        }, 500);
      }
    };

    const emblaNode = emblaApi.rootNode();
    emblaNode.addEventListener('mouseenter', handleMouseEnter, { passive: true });
    emblaNode.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    emblaNode.addEventListener('pointerdown', handlePointerDown, { passive: true });
    emblaNode.addEventListener('pointerup', handlePointerUp, { passive: true });
    emblaNode.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      stopAutoplay();
      if (wheelTimeoutRef.current) {
        clearTimeout(wheelTimeoutRef.current);
      }
      accumulatedDeltaRef.current = 0;
      emblaNode.removeEventListener('mouseenter', handleMouseEnter);
      emblaNode.removeEventListener('mouseleave', handleMouseLeave);
      emblaNode.removeEventListener('pointerdown', handlePointerDown);
      emblaNode.removeEventListener('pointerup', handlePointerUp);
      emblaNode.removeEventListener('wheel', handleWheel);
    };
  }, [emblaApi, startAutoplay, stopAutoplay]);

  return (
    <div className="overflow-hidden cursor-grab active:cursor-grabbing select-none" ref={emblaRef}>
      <div className="flex gap-6 pl-6 pr-6">
        {creators.map((creator, index) => (
          <div
            key={`${creator.slug}-${index}`}
            className="flex-[0_0_calc(85%-1.5rem)] min-w-0 sm:flex-[0_0_calc(45%-1.5rem)] lg:flex-[0_0_calc(30%-1.5rem)] xl:flex-[0_0_calc(23%-1.5rem)]"
          >
            <CreatorCard creator={creator} />
          </div>
        ))}
      </div>
    </div>
  );
}