import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg viewBox="0 0 32 32" className="size-7" aria-hidden="true">
        <path d="M16 2 28.1 9v14L16 30 3.9 23V9z" className="fill-primary" />
        <path d="M11 10v12M21 10v12M11 16h10" className="stroke-primary-foreground" strokeWidth="3" strokeLinecap="round" fill="none" />
      </svg>
      <span className="text-lg font-semibold tracking-tight">Hub</span>
    </span>
  )
}
