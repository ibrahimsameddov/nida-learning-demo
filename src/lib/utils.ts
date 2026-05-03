import { clsx, type ClassValue } from 'clsx'
import { twMerge }               from 'tailwind-merge'

// Tailwind class merge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Vaxt formatı
export function formatTime(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}s ${m % 60}d ${s % 60}san`
  if (m > 0) return `${m}d ${s % 60}san`
  return `${s}san`
}

// İnitialslar
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

// Uğur faizi rəngi
export function getSuccessColor(rate: number): string {
  if (rate >= 70) return 'var(--color-success)'
  if (rate >= 40) return 'var(--color-warning)'
  return 'var(--color-danger)'
}

// Tarix format
export function formatDate(iso: string, locale = 'az-AZ'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric'
  }).format(new Date(iso))
}

// Dəqiqə sayacı
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} dəq`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h} saat ${m} dəq` : `${h} saat`
}
