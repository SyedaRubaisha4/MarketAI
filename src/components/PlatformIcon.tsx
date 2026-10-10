import { Instagram, Facebook, MessageCircle, Music2, Pin, Linkedin, type LucideIcon } from 'lucide-react'
import { cn } from '../lib/cn'
import { PLATFORM_META } from '../data/mockData'
import type { Platform } from '../types'

export const PLATFORM_ICONS: Record<Platform, LucideIcon> = {
  instagram: Instagram,
  facebook: Facebook,
  whatsapp: MessageCircle,
  tiktok: Music2,
  pinterest: Pin,
  linkedin: Linkedin,
}

export function PlatformIcon({ platform, className, iconClassName }: { platform: Platform; className?: string; iconClassName?: string }) {
  const Icon = PLATFORM_ICONS[platform]
  return (
    <span className={cn('inline-flex h-9 w-9 items-center justify-center rounded-xl text-white shrink-0', PLATFORM_META[platform].bg, className)}>
      <Icon className={cn('h-[18px] w-[18px]', iconClassName)} aria-hidden />
      <span className="sr-only">{PLATFORM_META[platform].name}</span>
    </span>
  )
}
