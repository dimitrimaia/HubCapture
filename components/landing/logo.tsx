import { cn } from '@/lib/utils'

export const LOGO_PATH =
  'M2.50 16.00 L8.50 5.60 L14.50 16.00 L8.50 26.40Z M10.75 4.30 L22.75 4.30 L28.75 14.70 L16.75 14.70Z M16.75 17.30 L28.75 17.30 L22.75 27.70 L10.75 27.70Z'

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden="true">
      <path d={LOGO_PATH} className="fill-primary stroke-primary" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  )
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">
        Hub <span className="text-primary">Capture</span>
      </span>
    </span>
  )
}
