// app/ideas/page.tsx
import { IdeasClient } from '@/components/ideas-client';
import { getPublishedIdeas } from '@/lib/ideas';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '応募されたIDEA',
  description: 'みんなが投稿した商品アイデアをチェック。あなたのアイデアも応募してみませんか？',
};

// ISR: 60秒ごとに再生成（管理側で公開 → 最大60秒でLPに反映）
export const revalidate = 60;

export default async function IdeasPage() {
  const ideas = await getPublishedIdeas();

  return <IdeasClient ideas={ideas} />;
}