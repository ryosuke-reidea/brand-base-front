'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/70 backdrop-blur-2xl">
      <div className="container mx-auto flex h-20 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3 hover:opacity-70 transition-all duration-300" onClick={closeMenu}>
          <Image
            src="/brand-base4.png"
            alt="BRAND BASE"
            width={1300}
            height={300}
            className="h-9 w-auto"
            priority
          />
        </Link>

        <nav className="hidden md:flex items-center gap-10">
          <Link href="/creators" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group">
            クリエイター
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/products" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group">
            商品
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/ideas" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group">
            応募されたIDEA
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/ranking" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group">
            ランキング
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/service" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-all duration-300 relative group">
            仕組み
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gray-900 group-hover:w-full transition-all duration-300"></span>
          </Link>
          <Link href="/apply">
            <Button size="sm" className="bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-5 rounded-xl shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 font-semibold">
              応募
            </Button>
          </Link>
        </nav>

        <button
          className="md:hidden text-gray-900 p-2 hover:bg-gray-50 rounded-xl transition-all duration-300"
          onClick={toggleMenu}
          aria-label="メニュー"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isMenuOpen && (
  <div className="md:hidden absolute top-20 left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-100 shadow-2xl shadow-gray-200/50">
          <nav className="container mx-auto px-6 py-8 flex flex-col gap-2">
            <Link
              href="/creators"
              className="text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 py-3 px-4 rounded-xl"
              onClick={closeMenu}
            >
              クリエイター
            </Link>
            <Link
              href="/products"
              className="text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 py-3 px-4 rounded-xl"
              onClick={closeMenu}
            >
              商品
            </Link>
            <Link
              href="/ideas"
              className="text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 py-3 px-4 rounded-xl"
              onClick={closeMenu}
            >
              応募されたIDEA
            </Link>
            <Link
              href="/ranking"
              className="text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 py-3 px-4 rounded-xl"
              onClick={closeMenu}
            >
              ランキング
            </Link>
            <Link
              href="/service"
              className="text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-all duration-300 py-3 px-4 rounded-xl"
              onClick={closeMenu}
            >
              仕組み
            </Link>
            <Link href="/apply" onClick={closeMenu} className="mt-4">
              <Button className="w-full bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-6 rounded-xl shadow-lg shadow-purple-500/20 font-semibold">
                応募
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}