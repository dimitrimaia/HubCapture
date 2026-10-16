import { APP_STORE_URL, PLAY_STORE_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

function GooglePlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#34A853" d="M3.6 1.8 13.5 12l-9.9 10.2c-.4-.2-.6-.7-.6-1.2V3c0-.5.2-1 .6-1.2Z" />
      <path fill="#FBBC04" d="m16.8 8.6-3.3 3.4 3.3 3.4 3.8-2.2c1-.6 1-1.8 0-2.4l-3.8-2.2Z" />
      <path fill="#4285F4" d="M3.6 22.2 13.5 12l3.3 3.4L5.2 22c-.6.3-1.2.4-1.6.2Z" />
      <path fill="#EA4335" d="M3.6 1.8c.4-.2 1-.1 1.6.2l11.6 6.6-3.3 3.4L3.6 1.8Z" />
    </svg>
  )
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.2-1.7-3-1.9-3.6-2-1.5-.2-3 .9-3.8.9-.8 0-2-.9-3.3-.9-1.7 0-3.3 1-4.1 2.5-1.8 3.1-.5 7.6 1.3 10.1.8 1.2 1.8 2.6 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.5 1-1.4 1.4-2.8 1.4-2.8s-2.6-1-2.6-4ZM14 5.1c.7-.8 1.1-1.9 1-3.1-1 0-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4Z"
      />
    </svg>
  )
}

const stores = [
  { href: PLAY_STORE_URL, icon: GooglePlayIcon, overline: 'Disponível no', label: 'Google Play', aria: 'Baixar o app Hub Capture no Google Play' },
  { href: APP_STORE_URL, icon: AppleIcon, overline: 'Baixar na', label: 'App Store', aria: 'Baixar o app Hub Capture na App Store' },
]

export function StoreBadges({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  return (
    <div className={cn('flex gap-3', stacked ? 'flex-col' : 'flex-wrap', className)}>
      {stores.map((store) => (
        <a
          key={store.label}
          href={store.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={store.aria}
          className={cn(
            'inline-flex h-12 items-center gap-3 rounded-xl border border-foreground/15 bg-foreground/[0.04] px-4 text-foreground transition-colors outline-none hover:border-primary/50 hover:bg-foreground/[0.08] focus-visible:ring-3 focus-visible:ring-ring',
            stacked && 'w-full',
          )}
        >
          <store.icon className="size-6 shrink-0" />
          <span className="flex flex-col leading-none">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{store.overline}</span>
            <span className="mt-0.5 text-base font-semibold">{store.label}</span>
          </span>
        </a>
      ))}
    </div>
  )
}
