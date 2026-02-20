'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoScrollCarousel, ProductScrollCarousel, IdeaScrollCarousel } from '@/components/auto-scroll-carousel';
import { formatJPY } from '@/lib/utils';
import { ArrowRight, TrendingUp, Package, Users, Target, ChevronDown, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Creator, Product, Rankings, IdeaProduct } from '@/types';
import { SiteSettings } from '@/lib/db-queries';
import { AvatarGenerator } from '@/components/avatar-generator';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.03,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
};

function CountUpAnimation({ end, duration = 1 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;

    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = (timestamp - startTime) / (duration * 1000);

      if (progress < 1) {
        setCount(Math.floor(end * progress));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, isInView]);

  return <span ref={ref}>{count.toLocaleString()}</span>;
}

// ── 3D プロダクトカルーセル ──────────────────────────────────────────
function Hero3DCarousel({ products }: { products: Product[] }) {
  const [active, setActive] = useState(0);
  const items = products.slice(0, 7);
  const total = items.length;
  const containerRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const interacting = useRef(false);

  // 自動再生の開始/停止
  const startAutoPlay = useCallback(() => {
    if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      if (!interacting.current) {
        setActive((p) => (p + 1) % total);
      }
    }, 3500);
  }, [total]);

  const stopAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
  }, []);

  // インデックスを安全に変更
  const goTo = useCallback((dir: number) => {
    setActive((p) => ((p + dir) % total + total) % total);
    // 操作後に自動再生を再スタート
    stopAutoPlay();
    startAutoPlay();
  }, [total, stopAutoPlay, startAutoPlay]);

  useEffect(() => {
    if (total === 0) return;
    startAutoPlay();
    return () => stopAutoPlay();
  }, [total, startAutoPlay, stopAutoPlay]);

  // タッチスワイプ
  useEffect(() => {
    const el = containerRef.current;
    if (!el || total === 0) return;

    let startX = 0;
    let startY = 0;
    let moved = false;

    const onTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      moved = false;
      interacting.current = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      // 横方向のスワイプを検知したらスクロール防止
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) {
        e.preventDefault();
        moved = true;
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      interacting.current = false;
      if (!moved) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 30) {
        goTo(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [total, goTo]);

  // マウスドラッグ
  useEffect(() => {
    const el = containerRef.current;
    if (!el || total === 0) return;

    let dragging = false;
    let startX = 0;

    const onDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.clientX;
      interacting.current = true;
      el.style.cursor = 'grabbing';
    };
    const onMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
    };
    const onUp = (e: MouseEvent) => {
      if (!dragging) return;
      dragging = false;
      interacting.current = false;
      el.style.cursor = '';
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 30) {
        goTo(dx < 0 ? 1 : -1);
      }
    };

    el.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      el.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [total, goTo]);

  // ホイール（横方向）
  useEffect(() => {
    const el = containerRef.current;
    if (!el || total === 0) return;

    let wheelTimeout: ReturnType<typeof setTimeout> | null = null;
    let accumulated = 0;

    const onWheel = (e: WheelEvent) => {
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);
      if (absX > absY && absX > 5) {
        e.preventDefault();
        accumulated += e.deltaX;
        if (wheelTimeout) clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          if (Math.abs(accumulated) > 30) {
            goTo(accumulated > 0 ? 1 : -1);
          }
          accumulated = 0;
        }, 100);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onWheel);
      if (wheelTimeout) clearTimeout(wheelTimeout);
    };
  }, [total, goTo]);

  if (total === 0) return null;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-[250px] md:h-[320px] overflow-hidden select-none cursor-grab"
      style={{ perspective: '1200px' }}
    >
      {items.map((product, i) => {
        const offset = ((i - active + total) % total) - Math.floor(total / 2);
        const absOffset = Math.abs(offset);
        const isCenter = offset === 0;
        if (absOffset > 2) return null;
        return (
          <motion.div
            key={product.slug}
            className="absolute top-1/2 left-1/2 will-change-transform"
            animate={{
              x: `calc(-50% + ${offset * 160}px)`,
              y: '-50%',
              z: isCenter ? 0 : -absOffset * 100,
              scale: isCenter ? 1 : Math.max(0.6, 1 - absOffset * 0.2),
              opacity: isCenter ? 1 : Math.max(0.3, 1 - absOffset * 0.3),
              rotateY: offset * -6,
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            style={{ transformStyle: 'preserve-3d', zIndex: total - absOffset }}
            onClick={() => { setActive(i); stopAutoPlay(); startAutoPlay(); }}
          >
            <div className={`w-[190px] md:w-[250px] rounded-2xl overflow-hidden border-2 shadow-xl transition-colors duration-300 pointer-events-none ${isCenter ? 'border-purple-400 shadow-purple-300/30' : 'border-white/60 shadow-gray-200/20'}`}>
              <div className="aspect-[4/3] bg-gradient-to-br from-purple-100 to-pink-50 relative overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.product_name} className="w-full h-full object-cover" loading="lazy" draggable={false} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-9 h-9 text-purple-300" />
                  </div>
                )}
                {isCenter && product.funding_percent && (
                  <div className="absolute top-2 right-2 bg-gradient-to-r from-purple-600 to-pink-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {product.funding_percent}%達成
                  </div>
                )}
              </div>
              <div className="bg-white/95 p-3">
                <p className="text-xs md:text-sm font-semibold text-gray-800 truncate">{product.product_name}</p>
                {isCenter && (
                  <p className="text-[10px] text-purple-600 font-medium mt-0.5">{formatJPY(product.lifetime_sales_jpy)}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────

interface HomeClientProps {
  creators: Creator[];
  products: Product[];
  rankings: Rankings;
  ideas: IdeaProduct[];
  siteSettings?: SiteSettings;
}

export function HomeClient({ creators, products, rankings, ideas, siteSettings }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'single' | 'product'>('personal');

  const heroRef = useRef(null);

  // DB自動計算値
  const creatorSales = creators.reduce((sum, c) => sum + c.lifetime_sales_jpy, 0);
  const productSales = products.reduce((sum, p) => sum + p.lifetime_sales_jpy, 0);
  const autoTotalSales = Math.max(creatorSales, productSales);
  const autoTotalProducts = products.length;
  const autoTotalCreators = creators.length;
  const autoAvgFunding = Math.round(
    products.filter((p) => p.funding_percent).reduce((sum, p) => sum + (p.funding_percent || 0), 0) /
      products.filter((p) => p.funding_percent).length || 0
  );

  // 管理画面で0以外が設定されていればそちらを優先
  const totalSales = (siteSettings?.total_sales && siteSettings.total_sales > 0) ? siteSettings.total_sales : autoTotalSales;
  const totalCreators = (siteSettings?.total_creators && siteSettings.total_creators > 0) ? siteSettings.total_creators : autoTotalCreators;
  const totalProducts = (siteSettings?.total_products && siteSettings.total_products > 0) ? siteSettings.total_products : autoTotalProducts;
  const avgFundingPercent = (siteSettings?.avg_funding_percent && siteSettings.avg_funding_percent > 0) ? siteSettings.avg_funding_percent : autoAvgFunding;




  return (
    <div className="bg-gradient-to-b from-white via-purple-50/10 to-white">
      <section ref={heroRef} className="relative overflow-hidden min-h-screen flex flex-col justify-center py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-50/50 via-transparent to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          {/* ── 上段: コピー（左）＆ カルーセル（右）──── */}
          <div className="grid md:grid-cols-2 gap-6 md:gap-12 items-center max-w-6xl mx-auto mb-12 md:mb-16">

            {/* 右（SPでは上）: 3Dカルーセル + クリエイターアバター */}
            <div className="animate-[fadeIn_0.5s_ease] md:order-2">
              <Hero3DCarousel products={products.slice(0, 7)} />
              {creators.length > 0 && (
                <div className="hidden md:flex items-center justify-center gap-3 mt-6">
                  <div className="flex -space-x-3">
                    {creators.slice(0, 5).map((c, i) => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-white shadow-md overflow-hidden bg-white" style={{ zIndex: 5 - i }}>
                        {c.image_url ? (
                          <img src={c.image_url} alt={c.display_name} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <AvatarGenerator seed={c.avatar_seed} size={40} />
                        )}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500"><span className="font-semibold text-gray-800">{totalCreators}名</span>のクリエイターが参加中</p>
                </div>
              )}
            </div>

            {/* 左（SPでは下）: テキスト + CTA */}
            <div className="text-center md:text-left animate-[fadeIn_0.7s_ease] md:order-1">
              <div className="hidden md:inline-block mb-5">
                <Badge className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 text-purple-900 border-purple-200/50 px-5 py-1.5 text-sm font-medium">
                  在庫ゼロからスタート
                </Badge>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight">
                <span className="block bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                  在庫ゼロで、
                </span>
                <span className="block bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                  ブランドを走らせる。
                </span>
              </h1>

              <div className="mb-8">
                <p className="text-gray-900 font-semibold mb-2 text-lg md:text-xl">審査を通過すれば、0円で収益化可能。</p>
                <p className="text-gray-500 text-sm md:text-base">クラファンに必要な全ての費用を当社が負担します。</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href="/apply">
                  <Button
                    size="lg"
                    className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-sm px-10 py-6 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] rounded-xl font-semibold"
                  >
                    アイデアを応募する
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/apply#call">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-2 border-purple-200 text-purple-900 hover:bg-purple-50 hover:border-purple-300 text-sm px-10 py-6 transition-all duration-300 rounded-xl font-semibold"
                  >
                    無料相談を申し込む
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* ── 下段: 実績カウンター 4列 ──── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto animate-[fadeIn_1s_ease]">
            {[
              { label: '累計売上', value: Math.round(totalSales / 10000), suffix: '万円', icon: TrendingUp, color: 'from-purple-500 to-pink-500' },
              { label: 'クリエイター数', value: totalCreators, suffix: '名', icon: Users, color: 'from-pink-500 to-rose-500' },
              { label: 'プロジェクト数', value: totalProducts, suffix: '件', icon: Package, color: 'from-violet-500 to-purple-500' },
              { label: '平均達成率', value: avgFundingPercent, suffix: '%', icon: Target, color: 'from-fuchsia-500 to-pink-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/80 rounded-2xl p-5 md:p-6 border border-purple-100/40 shadow-lg shadow-purple-100/10 text-center">
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} mb-3 shadow-md`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-br from-gray-900 to-purple-900 bg-clip-text text-transparent leading-tight">
                  <CountUpAnimation end={stat.value} duration={2} />
                  <span className="text-lg md:text-xl ml-0.5">{stat.suffix}</span>
                </div>
                <div className="text-xs text-gray-500 font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* スクロール案内 */}
          <div className="flex justify-center mt-10 animate-[fadeIn_1.2s_ease]">
            <div className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors animate-[float_2.5s_ease-in-out_infinite]">
              <span className="text-[10px] tracking-wider uppercase mb-2">スクロールして詳しく見る</span>
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div
              className="flex items-center justify-between mb-16"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">参加クリエイター</h2>
                <p className="text-gray-600 text-lg">実績あるクリエイターたちとともに</p>
              </div>
              <Link href="/creators" className="text-gray-900 hover:text-purple-600 flex items-center text-sm font-semibold group transition-colors duration-300">
                一覧を見る
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <AutoScrollCarousel creators={creators} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-purple-50/30 via-pink-50/20 to-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/40 to-pink-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-pink-200/35 to-purple-200/30 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} transition={{ duration: 0.2 }}>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:border-gray-200 transition-all duration-300 group hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <TrendingUp className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium tracking-wide">累計販売額</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 tracking-tight">{formatJPY(totalSales)}</div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.2 }}>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:border-gray-200 transition-all duration-300 group hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium tracking-wide">リリース商品数</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 tracking-tight">
                  <CountUpAnimation end={totalProducts} />商品
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.2 }}>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:border-gray-200 transition-all duration-300 group hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Users className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium tracking-wide">支援クリエイター数</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 tracking-tight">
                  <CountUpAnimation end={totalCreators} />名
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp} transition={{ duration: 0.2 }}>
              <Card className="bg-white/80 backdrop-blur-sm border border-gray-100 p-8 hover:border-gray-200 transition-all duration-300 group hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 rounded-2xl">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-gray-500 text-sm font-medium tracking-wide">平均達成率</h3>
                </div>
                <div className="text-4xl font-bold text-gray-900 tracking-tight">
                  <CountUpAnimation end={avgFundingPercent} />%
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden bg-white">
        <div className="absolute top-1/4 left-0 w-72 h-72 bg-gray-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-gray-100/40 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div
              className="flex items-center justify-between mb-12"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">注目商品</h2>
                <p className="text-gray-600 text-lg">成功事例をご覧ください</p>
              </div>
              <Link href="/products" className="text-gray-900 hover:text-purple-600 flex items-center text-sm font-semibold group transition-colors duration-300">
                一覧を見る
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <ProductScrollCarousel products={products} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-blue-50/20 to-white relative overflow-hidden">
        <div className="absolute top-1/4 right-0 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div
              className="flex items-center justify-between mb-12"
              variants={fadeInUp}
            >
              <div>
                <h2 className="text-5xl font-bold text-gray-900 mb-3 tracking-tight">応募されたIDEA</h2>
                <p className="text-gray-600 text-lg">みんなのアイデアをチェック</p>
              </div>
              <Link href="/ideas" className="text-gray-900 hover:text-blue-600 flex items-center text-sm font-semibold group transition-colors duration-300">
                一覧を見る
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </motion.div>
            <motion.div variants={fadeInUp}>
              <IdeaScrollCarousel ideas={ideas} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gray-50 relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-gray-100/40 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeIn}>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-4xl font-bold text-gray-900 tracking-tight">ランキング</h2>
              <Link href="/ranking" className="text-gray-900 hover:text-purple-600 flex items-center text-sm font-semibold group transition-colors duration-300">
                ランキングを見る
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </Link>
            </div>

            <div className="overflow-x-auto mb-6 -mx-4 px-4 scrollbar-hide">
              <div className="flex gap-2 min-w-max">
                <Button
                  variant={activeTab === 'personal' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('personal')}
                  className={activeTab === 'personal' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap' : 'text-gray-600 hover:text-purple-600 whitespace-nowrap'}
                >
                  個人販売累計額
                </Button>
                <Button
                  variant={activeTab === 'single' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('single')}
                  className={activeTab === 'single' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap' : 'text-gray-600 hover:text-purple-600 whitespace-nowrap'}
                >
                  単発商品販売額
                </Button>
                <Button
                  variant={activeTab === 'product' ? 'default' : 'ghost'}
                  onClick={() => setActiveTab('product')}
                  className={activeTab === 'product' ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 whitespace-nowrap' : 'text-gray-600 hover:text-purple-600 whitespace-nowrap'}
                >
                  商品販売累計額
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {activeTab === 'personal' &&
                rankings.personal_lifetime.slice(0, 4).map((entry, index) => {
                  const creator = creators.find((c) => c.slug === entry.slug);
                  if (!creator) return null;
                  return (
                    <Link key={entry.slug} href={`/creators/${creator.slug}`}>
                      <Card className="bg-white border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
                            #{index + 1}
                          </Badge>
                          <div className="font-semibold text-gray-900 text-sm">{creator.display_name}</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatJPY(entry.value)}</div>
                      </Card>
                    </Link>
                  );
                })}

              {activeTab === 'single' &&
                rankings.best_single_product.slice(0, 4).map((entry, index) => {
                  const product = products.find((p) => p.slug === entry.slug);
                  if (!product) return null;
                  return (
                    <Link key={entry.slug} href={`/products/${product.slug}`}>
                      <Card className="bg-white border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
                            #{index + 1}
                          </Badge>
                          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{product.product_name}</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatJPY(entry.value)}</div>
                      </Card>
                    </Link>
                  );
                })}

              {activeTab === 'product' &&
                rankings.product_lifetime.slice(0, 4).map((entry, index) => {
                  const product = products.find((p) => p.slug === entry.slug);
                  if (!product) return null;
                  return (
                    <Link key={entry.slug} href={`/products/${product.slug}`}>
                      <Card className="bg-white border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300">
                            #{index + 1}
                          </Badge>
                          <div className="font-semibold text-gray-900 text-sm line-clamp-1">{product.product_name}</div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">{formatJPY(entry.value)}</div>
                      </Card>
                    </Link>
                  );
                })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden bg-white">
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gray-100/40 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-gray-200/30 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div {...fadeIn}>
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-gray-900 mb-5 tracking-tight">仕組み</h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
                2つのフェーズで、あなたのアイデアを事業として成立させます
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-3xl p-8 mb-12 shadow-lg shadow-blue-100/50">
              <h3 className="text-2xl font-bold text-blue-900 mb-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center">
                  <Lightbulb className="w-6 h-6 text-blue-700" />
                </div>
                アイデアがない方も大歓迎
              </h3>
              <p className="text-blue-900/80 text-base leading-relaxed">
                商品アイデアをお持ちでない場合も、当社から市場調査に基づいた商品案を割り当てて進めることができます。
                あなたはプロジェクトの運営と意思決定に集中し、商品化の経験を積むことができます。
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-white border-gray-200 p-8">
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300 mb-4 text-lg px-4 py-2">
                  Phase 1
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">クラファンで検証</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  国内外のクラウドファンディングでアイデアを検証。
                  あなたは意思決定と進捗管理に集中できます。
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">商品企画・アイデアブラッシュアップ</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">OEM工場の選定</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">キャンペーンページ制作</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">プロモーション動画制作</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">広告運用</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">カスタマーサポート</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">あなたの収益</div>
                  <div className="text-xl font-bold text-gray-900">利益の10%</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ※ 売上ではなく利益からの配分
                  </div>
                </div>
              </Card>

              <Card className="bg-white border-gray-200 p-8">
                <Badge className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-300 mb-4 text-lg px-4 py-2">
                  Phase 2
                </Badge>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">継続販売で成長</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  クラファン成功後、E-bay、Amazon、楽天などでの継続販売へ。
                  販売管理はあなたが主体となり、当社はチャネル支援を行います。
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">Amazon、楽天への出店サポート</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">在庫管理・物流アドバイス</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">マーケティング戦略支援</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-gray-700 mt-0.5" />
                    <span className="text-gray-600">新チャネル開拓サポート</span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">当社手数料</div>
                  <div className="text-xl font-bold text-gray-900">売上の約20%</div>
                  <div className="text-xs text-gray-500 mt-1">
                    ※ チャネル支援・コンサルティング費用
                  </div>
                </div>
              </Card>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">審査基準</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-gray-700" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">海外で売れる可能性</h4>
                  <p className="text-sm text-gray-600">
                    グローバル市場での需要とユニークな価値提案
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Target className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">高い利益率</h4>
                  <p className="text-sm text-gray-600">
                    50〜60%以上の粗利率が見込めること
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">持続可能性</h4>
                  <p className="text-sm text-gray-600">
                    継続販売・展開できるビジネスモデル
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}