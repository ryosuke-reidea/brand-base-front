'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Lightbulb,
  TrendingUp,
  Package,
  Target,
  Rocket,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  initial: {},
  whileInView: {
    transition: {
      staggerChildren: 0.1,
    },
  },
  viewport: { once: true, margin: "-50px" }
};

export default function ServicePage() {
  return (
    <div className="bg-gradient-to-b from-white via-gray-50/30 to-white min-h-screen py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-100/30 via-transparent to-transparent pointer-events-none" />

      <motion.div
        className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/30 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-20 left-1/4 w-96 h-96 bg-gradient-to-tr from-indigo-100/30 to-transparent rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      />

      <div className="container mx-auto px-4 max-w-5xl relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-6 py-2 text-sm font-medium mb-6 shadow-sm">
            How It Works
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 tracking-tight">仕組み</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            在庫ゼロから始める、新しいブランド作り
          </p>
        </motion.div>

        <motion.div {...fadeInUp}>
          <Card className="bg-gradient-to-br from-blue-50 via-white to-indigo-50/30 border-gray-200 p-10 mb-20 text-center shadow-lg hover:shadow-xl transition-shadow rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-200/30 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <Sparkles className="w-12 h-12 text-gray-700 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                アイデアの成形から継続販売まで、<br />トータルサポート
              </h2>
              <p className="text-gray-600 leading-relaxed max-w-2xl mx-auto text-lg">
                BRAND-BASEは、あなたのアイデアをクラウドファンディングで検証し、
                継続販売へと成長させるプラットフォームです。
                0円で収益化可能、在庫リスクゼロで、スモールブランドを事業として成立させます。
              </p>
            </div>
          </Card>
        </motion.div>

        <motion.div className="mb-20" {...fadeInUp}>
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">2つのフェーズ</h2>
          <motion.div className="grid md:grid-cols-2 gap-8" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            <motion.div variants={fadeInUp}>
              <Card className="bg-white border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 rounded-2xl h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">1</span>
                  </div>
                  <Badge className="bg-blue-100 text-blue-900 border-blue-200 text-base px-4 py-1.5">
                    Phase 1
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">クラファンで検証</h3>

                <p className="text-gray-600 mb-6 leading-relaxed">
                  Kickstarter、Indiegogoなどクラウドファンディングでアイデアを検証。
                  あなたは意思決定と進捗管理に集中できます。
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    '商品企画・アイデアブラッシュアップ',
                    'OEM工場の選定',
                    'キャンペーンページ制作',
                    'プロモーション動画制作',
                    '広告運用',
                    'カスタマーサポート'
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-xl p-5 border border-blue-100">
                  <div className="text-sm text-gray-600 mb-1 font-medium">あなたの収益</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">利益の10%</div>
                  <div className="text-xs text-gray-500">
                    ※ 売上ではなく利益からの配分
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Card className="bg-white border-gray-200 p-8 shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-1 rounded-2xl h-full">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">2</span>
                  </div>
                  <Badge className="bg-green-100 text-green-900 border-green-200 text-base px-4 py-1.5">
                    Phase 2
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">継続販売で成長</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  クラファン成功後、Amazon、楽天などでの継続販売へ。
                  販売管理はあなたが主体となり、当社はチャネル支援を行います。
                </p>

                <div className="space-y-3 mb-6">
                  {[
                    'Amazon、楽天への出店サポート',
                    '在庫管理・物流アドバイス',
                    'マーケティング戦略支援',
                    '新チャネル開拓サポート'
                  ].map((item, i) => (
                    <motion.div
                      key={i}
                      className="flex items-start gap-3"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{item}</span>
                    </motion.div>
                  ))}
                </div>

                <div className="bg-gradient-to-br from-green-50 to-emerald-50/50 rounded-xl p-5 border border-green-100">
                  <div className="text-sm text-gray-600 mb-1 font-medium">当社手数料</div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">売上の約20%</div>
                  <div className="text-xs text-gray-500">
                    ※ チャネル支援・コンサルティング費用
                  </div>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div className="mb-20" {...fadeInUp}>
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">審査基準</h2>
          <Card className="bg-white border-gray-200 p-10 shadow-lg rounded-2xl">
            <motion.div className="grid md:grid-cols-3 gap-10" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
              {[
                { icon: Rocket, title: '海外で売れる可能性', desc: 'グローバル市場での需要があり、ユニークな価値提案ができること。特に英語圏での市場性を重視します。', color: 'from-blue-100 to-indigo-100' },
                { icon: TrendingUp, title: '高い利益率', desc: '粗利率50〜60%以上が見込めること。広告費を含めても利益が残るビジネスモデルであることが重要です。', color: 'from-green-100 to-emerald-100' },
                { icon: Target, title: '持続可能性', desc: '一発屋ではなく、継続販売・シリーズ展開できるビジネスモデル。ブランドとして成長できるポテンシャルを評価します。', color: 'from-amber-100 to-orange-100' }
              ].map((item, i) => (
                <motion.div key={i} className="text-center" variants={fadeInUp}>
                  <motion.div
                    className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-sm`}
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <item.icon className="w-10 h-10 text-gray-700" />
                  </motion.div>
                  <h3 className="font-bold text-gray-900 mb-3 text-lg">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>

        <motion.div className="mb-20" {...fadeInUp}>
          <h2 className="text-4xl font-bold text-gray-900 mb-12 text-center tracking-tight">こんな方におすすめ</h2>
          <motion.div className="grid md:grid-cols-2 gap-6" variants={staggerContainer} initial="initial" whileInView="whileInView" viewport={{ once: true }}>
            {[
              { icon: Package, title: 'アイデアがなくても始められる', desc: '当社が企画した商品を割り当て、あなたのブランドとして販売できます。商品企画から参加可能です', featured: true },
              { icon: Lightbulb, title: 'アイデアはあるが実現方法がわからない', desc: '商品化のプロセス、OEM工場の探し方、クラファンの運営など、すべてサポートします' },
              { icon: Package, title: '在庫リスクを負いたくない', desc: 'クラファンで需要を検証してから生産するため、在庫リスクを最小化できます' },
              { icon: TrendingUp, title: '初期費用をかけられない', desc: '審査を通過すれば、Phase1の全費用を当社が負担。あなたの初期投資は完全ゼロです' },
              { icon: Target, title: 'グローバル市場で勝負したい', desc: 'クラファンでの販売実績があり、グローバル展開のノウハウを提供します' }
            ].map((item, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <Card className={`${item.featured ? 'bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-100' : 'bg-white border-gray-200'} p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 rounded-xl`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-xl ${item.featured ? 'bg-blue-200/50' : 'bg-gray-100'} flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-6 h-6 text-gray-700" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div {...fadeInUp}>
          <Card className="bg-white border-gray-200 p-8 mb-16 shadow-lg rounded-2xl">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-7 h-7 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-gray-900 mb-4 text-2xl">審査について</h3>
                <div className="bg-gradient-to-br from-amber-50 to-orange-50/30 border border-amber-200 rounded-xl p-5 mb-5">
                  <p className="text-amber-900 font-bold mb-2 text-lg">
                    審査は厳正に行わせていただきます
                  </p>
                  <p className="text-amber-800 text-sm leading-relaxed">
                    当社がクラウドファンディングに必要な全ての費用（OEM開発、製造、広告運用、ページ・動画制作、配送など）を負担するため、
                    商品アイデアの市場性・利益率・持続可能性を厳しく審査させていただきます。
                  </p>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  審査には通常2〜4週間程度かかります。特に重視するのは以下の3点です：
                </p>
                <ul className="text-gray-700 space-y-2 mb-5 ml-6">
                  <li className="list-disc">海外市場（特に英語圏）での需要とユニーク性</li>
                  <li className="list-disc">粗利率50〜60%以上を見込める価格設定</li>
                  <li className="list-disc">継続販売・シリーズ展開できるポテンシャル</li>
                </ul>
                <p className="text-gray-600 leading-relaxed">
                  審査を通過した案件については、担当者より詳細なヒアリングとプラン提案をさせていただきます。
                  厳しい審査ですが、通過すればあなたの金銭的負担は完全にゼロです。まずはお気軽にご応募ください。
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div {...fadeInUp}>
          <Card className="bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700 p-12 text-center shadow-2xl rounded-3xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold text-white mb-5">
                まずはアイデアを<br />聞かせてください
              </h2>
              <p className="text-gray-300 mb-10 max-w-xl mx-auto text-lg leading-relaxed">
                応募は無料。審査を通過した方には、担当者から詳細なプランをご提案します。
              </p>
              <Link href="/apply">
                <Button size="lg" className="bg-white hover:bg-gray-100 text-gray-900 text-lg px-12 py-7 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold rounded-xl">
                  アイデアを応募する
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
