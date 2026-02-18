'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AutoScrollCarousel } from '@/components/auto-scroll-carousel';
import { ProductCard } from '@/components/product-card';
import { IdeaCard } from '@/components/idea-card';
import { formatJPY } from '@/lib/utils';
import { ArrowRight, TrendingUp, Package, Users, Target, ChevronDown, Lightbulb, CheckCircle2 } from 'lucide-react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { Creator, Product, Rankings, IdeaProduct } from '@/types';
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

// ── ヒーローに浮かぶクリエイターアバター ────────────────────────────
interface FloatingBubble {
  id: number;
  creatorIndex: number;
  x: number;
  y: number;
  size: number;
  floatY: number;    // 上下揺れの振幅
  floatDuration: number; // 揺れの周期
}

// 画面全体に散りばめるゾーン（中央テキスト周辺は避ける）
const BUBBLE_ZONES = [
  // 左帯
  { xMin: 1, xMax: 18, yMin: 5, yMax: 92 },
  // 右帯
  { xMin: 82, xMax: 99, yMin: 5, yMax: 92 },
  // 左中
  { xMin: 18, xMax: 32, yMin: 5, yMax: 30 },
  { xMin: 18, xMax: 32, yMin: 72, yMax: 95 },
  // 右中
  { xMin: 68, xMax: 82, yMin: 5, yMax: 30 },
  { xMin: 68, xMax: 82, yMin: 72, yMax: 95 },
  // 上部ワイド
  { xMin: 25, xMax: 75, yMin: 2, yMax: 15 },
  // 下部ワイド
  { xMin: 25, xMax: 75, yMin: 82, yMax: 98 },
];

function randomInZone() {
  const zone = BUBBLE_ZONES[Math.floor(Math.random() * BUBBLE_ZONES.length)];
  return {
    x: zone.xMin + Math.random() * (zone.xMax - zone.xMin),
    y: zone.yMin + Math.random() * (zone.yMax - zone.yMin),
  };
}

const SIZES = [36, 44, 52, 56, 64, 72, 80];

function FloatingCreatorBubbles({ creators }: { creators: Creator[] }) {
  const [bubbles, setBubbles] = useState<FloatingBubble[]>([]);
  const counterRef = useRef(0);

  const spawnBubble = useCallback(() => {
    if (creators.length === 0) return;
    const pos = randomInZone();
    const bubble: FloatingBubble = {
      id: counterRef.current++,
      creatorIndex: Math.floor(Math.random() * creators.length),
      x: pos.x,
      y: pos.y,
      size: SIZES[Math.floor(Math.random() * SIZES.length)],
      floatY: 6 + Math.random() * 10,
      floatDuration: 2.5 + Math.random() * 2,
    };
    setBubbles((prev) => [...prev.slice(-11), bubble]); // 最大12個
  }, [creators]);

  useEffect(() => {
    if (creators.length === 0) return;
    // 初期表示: すぐに8個ばらまく
    const timers: NodeJS.Timeout[] = [];
    for (let i = 0; i < 8; i++) {
      timers.push(setTimeout(() => spawnBubble(), i * 200));
    }
    // 以降は短い間隔で追加
    const interval = setInterval(spawnBubble, 1400);
    return () => {
      timers.forEach(clearTimeout);
      clearInterval(interval);
    };
  }, [spawnBubble, creators.length]);

  return (
    <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden>
      <AnimatePresence>
        {bubbles.map((b) => {
          const creator = creators[b.creatorIndex];
          return (
            <motion.div
              key={b.id}
              initial={{ opacity: 0, scale: 0, y: 20 }}
              animate={{
                opacity: [0, 0.85, 0.85, 0],
                scale: [0.3, 1, 1, 0.6],
                y: [20, 0, 0, -10],
              }}
              transition={{
                duration: 5,
                times: [0, 0.12, 0.8, 1],
                ease: 'easeInOut',
              }}
              onAnimationComplete={() => {
                setBubbles((prev) => prev.filter((p) => p.id !== b.id));
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${b.x}%`, top: `${b.y}%` }}
            >
              {/* ゆっくり上下にフロート */}
              <motion.div
                animate={{ y: [-b.floatY / 2, b.floatY / 2] }}
                transition={{
                  duration: b.floatDuration,
                  repeat: Infinity,
                  repeatType: 'reverse',
                  ease: 'easeInOut',
                }}
              >
                <div
                  className="rounded-full border-[3px] border-white/90 shadow-xl shadow-purple-300/30 overflow-hidden bg-white ring-2 ring-purple-100/40"
                  style={{ width: b.size, height: b.size }}
                >
                  {creator.image_url ? (
                    <img
                      src={creator.image_url}
                      alt={creator.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AvatarGenerator seed={creator.avatar_seed} size={b.size} />
                  )}
                </div>
                <div className="mt-1.5 text-center">
                  <span className="text-[10px] font-semibold text-purple-700/80 bg-white/90 backdrop-blur-sm rounded-full px-2.5 py-0.5 shadow-md shadow-purple-200/30 whitespace-nowrap border border-purple-100/50">
                    {creator.display_name}
                  </span>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────

interface HomeClientProps {
  creators: Creator[];
  products: Product[];
  rankings: Rankings;
  ideas: IdeaProduct[];
}

export function HomeClient({ creators, products, rankings, ideas }: HomeClientProps) {
  const [activeTab, setActiveTab] = useState<'personal' | 'single' | 'product'>('personal');

  const heroRef = useRef(null);

  const totalSales = creators.reduce((sum, c) => sum + c.lifetime_sales_jpy, 0);
  const totalProducts = products.length;
  const totalCreators = creators.length;
  const avgFundingPercent = Math.round(
    products.filter((p) => p.funding_percent).reduce((sum, p) => sum + (p.funding_percent || 0), 0) /
      products.filter((p) => p.funding_percent).length || 0
  );

  const featuredProducts = products.slice(0, 4);
  const featuredIdeas = ideas.slice(0, 4);



  return (
    <div className="bg-gradient-to-b from-white via-purple-50/10 to-white">
      <section ref={heroRef} className="relative overflow-hidden h-screen flex items-center justify-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-100/30 via-pink-50/10 to-transparent" />

        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(168, 85, 247, 0.03) 1px, transparent 1px)',
          backgroundSize: '80px 80px',
        }} />

        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-purple-200/30 to-pink-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-[700px] h-[700px] bg-gradient-to-tr from-violet-200/25 to-purple-200/20 rounded-full blur-3xl" />

        {/* クリエイターアバターのポップアップ */}
        <FloatingCreatorBubbles creators={creators} />

        <motion.div className="container mx-auto px-4 relative z-10">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div
              className="inline-block mb-8"
              variants={fadeInUp}
              transition={{ duration: 0.2 }}
            >
              <Badge className="bg-gradient-to-r from-purple-100 via-pink-50 to-purple-100 text-purple-900 border-purple-200/50 px-6 py-2 text-sm font-medium shadow-sm shadow-purple-200/50">
                在庫ゼロからスタート
              </Badge>
            </motion.div>

            <motion.h1
              className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight"
              variants={fadeInUp}
              transition={{ duration: 0.25, delay: 0.03 }}
            >
              <span className="inline-block bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 bg-clip-text text-transparent">
                在庫ゼロで、
              </span>
              <br />
              <span className="inline-block bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                ブランドを走らせる。
              </span>
            </motion.h1>

            <motion.div
              className="text-lg md:text-xl text-gray-600 mb-16 leading-relaxed max-w-2xl mx-auto"
              variants={fadeInUp}
              transition={{ duration: 0.25, delay: 0.06 }}
            >
              <p className="text-gray-900 font-semibold mb-3 text-xl md:text-2xl">審査を通過すれば、0円で収益化可能。</p>
              <p className="text-gray-600">クラファンに必要な全ての費用を当社が負担します。</p>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-5 justify-center mb-20"
              variants={fadeInUp}
              transition={{ duration: 0.25, delay: 0.09 }}
            >
              <Link href="/apply">
                <Button
                  size="lg"
                  className="bg-gradient-to-br from-purple-600 via-pink-600 to-purple-600 hover:from-purple-700 hover:via-pink-700 hover:to-purple-700 text-white text-base px-12 py-7 shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-[1.02] rounded-xl font-semibold"
                >
                  アイデアを応募する
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/apply#call">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-purple-200 text-purple-900 hover:bg-purple-50 hover:border-purple-300 text-base px-12 py-7 transition-all duration-300 rounded-xl font-semibold backdrop-blur-sm"
                >
                  無料相談を申し込む
                </Button>
              </Link>
            </motion.div>

            <motion.div
              className="flex justify-center"
              variants={fadeInUp}
              transition={{ duration: 0.25, delay: 0.12 }}
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                className="flex flex-col items-center text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
              >
                <span className="text-xs tracking-wider uppercase mb-3">スクロールして詳しく見る</span>
                <ChevronDown className="w-5 h-5" />
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
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
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
            >
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product.slug}
                  variants={fadeInUp}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
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
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
              variants={staggerContainer}
            >
              {featuredIdeas.map((idea, index) => (
                <motion.div
                  key={idea.slug}
                  variants={fadeInUp}
                  transition={{ duration: 0.2, delay: index * 0.03 }}
                >
                  <IdeaCard idea={idea} />
                </motion.div>
              ))}
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