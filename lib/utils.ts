import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CampaignStatus } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatJPY(amount: number): string {
  return `¥${amount.toLocaleString('ja-JP')}`;
}

export function calcMargin(price: number, cost: number): number {
  if (price === 0) return 0;
  return Math.round(((price - cost) / price) * 1000) / 10;
}

export function getStatusLabel(status: CampaignStatus): string {
  const labels: Record<CampaignStatus, string> = {
    live: '公開中',
    funded: '達成',
    indemand: '継続販売',
    archived: '終了',
  };
  return labels[status];
}

export function getStatusColor(status: CampaignStatus): string {
  const colors: Record<CampaignStatus, string> = {
    live: 'bg-green-500 text-white border-green-600',
    funded: 'bg-blue-500 text-white border-blue-600',
    indemand: 'bg-amber-500 text-white border-amber-600',
    archived: 'bg-gray-700 text-white border-gray-800',
  };
  return colors[status];
}
