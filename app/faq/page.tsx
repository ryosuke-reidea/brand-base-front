import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';

export default function FAQPage() {
  const faqs = [
    {
      category: '応募について',
      items: [
        {
          q: '応募に費用はかかりますか？',
          a: 'いいえ、応募は完全無料です。審査も無料で行います。',
        },
        {
          q: 'どんなアイデアでも応募できますか？',
          a: '物販商品であれば基本的にご応募いただけますが、法規制がある商品（医薬品など）や、海外配送が困難な商品は対象外となります。詳しくは無料相談でご確認ください。',
        },
        {
          q: '審査にはどのくらい時間がかかりますか？',
          a: '通常2〜4週間程度です。当社がPhase1の全費用を負担するため、市場性、利益率、持続可能性の観点から厳正に審査させていただきます。応募内容によってはヒアリングをさせていただく場合があります。',
        },
        {
          q: '審査は厳しいですか？',
          a: 'はい。当社がクラウドファンディングに必要な全ての費用（OEM、製造、広告、制作など）を負担するため、商品アイデアは厳正に審査させていただきます。特に海外市場での需要、高い利益率（粗利50〜60%以上）、継続販売の可能性を重視しています。その代わり、審査を通過すればあなたの金銭的負担は完全にゼロです。',
        },
        {
          q: 'すでに試作品がありますが大丈夫ですか？',
          a: 'はい、問題ありません。むしろ試作品がある方が審査がスムーズに進みます。現在の進捗状況を応募フォームでお知らせください。',
        },
      ],
    },
    {
      category: 'Phase1（クラウドファンディング）について',
      items: [
        {
          q: '初期費用はかかりますか？',
          a: 'いいえ、審査を通過すれば初期費用は一切かかりません。Phase1ではOEM開発費用、製造費用、広告運用費用、ページ制作費用、動画制作費用、配送費用など、クラウドファンディングに必要な全ての経費を当社が負担します。あなたの金銭的負担は完全にゼロです。',
        },
        {
          q: 'どのくらいの収益が見込めますか？',
          a: 'Phase1では利益の10%があなたの収益となります。例えば、利益が1,000万円の場合、100万円があなたの収益です。商品や市場によって異なるため、審査通過後に詳細なシミュレーションをご提示します。',
        },
        {
          q: '失敗した場合、費用を請求されますか？',
          a: 'いいえ、クラウドファンディングが目標未達の場合でも、費用をご請求することは一切ありません。OEM開発、製造、広告、制作など全ての費用は当社が負担し、失敗時のリスクも当社が負います。あなたのリスクは完全にゼロです。',
        },
        {
          q: 'どのプラットフォームを使いますか？',
          a: '主に国内外のクラウドファンディングなど海外大手プラットフォームを使用します。商品特性に合わせて最適なプラットフォームを選定します。',
        },
      ],
    },
    {
      category: 'Phase2（継続販売）について',
      items: [
        {
          q: 'Phase2に進まないこともできますか？',
          a: 'はい、Phase1で終了することも可能です。ただし、継続販売することでブランドとして成長できるため、Phase2への移行を推奨しています。',
        },
        {
          q: '在庫管理は自分で行う必要がありますか？',
          a: 'はい、Phase2では基本的にあなたが主体となって販売管理を行います。ただし、在庫管理や物流についてもアドバイスやサポートを提供します。',
        },
        {
          q: '手数料20%は高くないですか？',
          a: 'Phase2では販売先の開拓、マーケティング支援、継続的なコンサルティングを提供します。また、20%は売上に対する手数料のため、販売が増えるほどあなたの利益も増加します。',
        },
      ],
    },
    {
      category: '権利・契約について',
      items: [
        {
          q: '商品の権利は誰のものになりますか？',
          a: '商品の知的財産権はあなたに帰属します。当社はあくまで販売支援を行うパートナーです。',
        },
        {
          q: '契約期間はありますか？',
          a: 'Phase1とPhase2でそれぞれ契約を結びます。Phase2では通常1〜3年の契約期間を設定し、更新は協議の上で決定します。',
        },
        {
          q: '他のプラットフォームでも販売できますか？',
          a: 'Phase2移行後は基本的に可能ですが、契約内容によって制限がある場合があります。詳細は審査通過後にご説明します。',
        },
      ],
    },
    {
      category: 'その他',
      items: [
        {
          q: '地方在住でも大丈夫ですか？',
          a: 'はい、問題ありません。打ち合わせはオンラインで行うため、全国どこからでもご参加いただけます。',
        },
        {
          q: '副業として取り組めますか？',
          a: 'はい、多くのクリエイターが副業から始めています。ただし、商品開発や意思決定には時間を割いていただく必要があります。',
        },
        {
          q: '個人ではなく法人でも応募できますか？',
          a: 'はい、法人でもご応募いただけます。個人・法人問わず、同じ条件で審査させていただきます。',
        },
      ],
    },
  ];

  return (
    <div className="bg-[#0B0B0E] min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">よくある質問</h1>
          <p className="text-gray-400">
            個人クラファン.comについてのよくある質問をまとめました
          </p>
        </div>

        <div className="space-y-8">
          {faqs.map((category, categoryIndex) => (
            <Card key={categoryIndex} className="bg-[#1A1A1F] border-white/10 p-6">
              <h2 className="text-xl font-bold text-white mb-4">{category.category}</h2>
              <Accordion type="single" collapsible className="w-full">
                {category.items.map((item, itemIndex) => (
                  <AccordionItem
                    key={itemIndex}
                    value={`item-${categoryIndex}-${itemIndex}`}
                    className="border-white/10"
                  >
                    <AccordionTrigger className="text-left text-white hover:text-purple-400">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-gray-400 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Card>
          ))}
        </div>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-600/10 border-purple-500/30 p-8 text-center mt-12">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            その他のご質問はありますか？
          </h3>
          <p className="text-gray-300 mb-6">
            不明点があれば、お気軽に無料相談フォームからお問い合わせください
          </p>
          <Link href="/apply#call">
            <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white">
              無料相談を申し込む
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
