import Link from 'next/link';
import Image from 'next/image';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="container mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/brand-base4.png"
              alt="BRAND BASE"
              width={1300}
              height={300}
              className="h-10 w-auto"
            />
          </Link>
          <p className="text-gray-600 text-base max-w-2xl mx-auto leading-relaxed">
            在庫ゼロからスタート。アイデアを事業に変える。
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 mb-12">
          <Link href="/creators" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            クリエイター
          </Link>
          <Link href="/products" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            商品
          </Link>
          <Link href="/ranking" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            ランキング
          </Link>
          <Link href="/service" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            仕組み
          </Link>
          <Link href="/apply" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            アイデアを応募
          </Link>
          <Link href="/faq" className="text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
            よくある質問
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            © {new Date().getFullYear()} BRAND BASE
          </p>
        </div>
      </div>
    </footer>
  );
}
