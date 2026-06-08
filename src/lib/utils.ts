import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'CHF') {
  return new Intl.NumberFormat('de-CH', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('de-CH', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(date))
}

export const DEAL_STATUSES = [
  { value: 'pitched', label: 'Pitched', color: 'bg-slate-500' },
  { value: 'negotiating', label: 'Negotiating', color: 'bg-yellow-500' },
  { value: 'contracted', label: 'Contracted', color: 'bg-blue-500' },
  { value: 'in_production', label: 'In Production', color: 'bg-purple-500' },
  { value: 'delivered', label: 'Delivered', color: 'bg-orange-500' },
  { value: 'paid', label: 'Paid', color: 'bg-green-500' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
]

export const PLATFORMS = [
  { value: 'youtube', label: 'YouTube', icon: '▶' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'twitter', label: 'Twitter/X', icon: '𝕏' },
  { value: 'podcast', label: 'Podcast', icon: '🎙' },
  { value: 'newsletter', label: 'Newsletter', icon: '📧' },
  { value: 'other', label: 'Other', icon: '🔗' },
]
