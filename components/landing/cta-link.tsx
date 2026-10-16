import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { CADASTRO_PATH, SIGNUP_URL } from '@/lib/site'
import { cn } from '@/lib/utils'

type CtaLinkProps = {
  children: React.ReactNode
  variant?: 'primary' | 'outline' | 'dark'
  size?: 'sm' | 'md' | 'lg'
  withArrow?: boolean
  /** Abre o link de indicação direto em nova aba, em vez da página /cadastro com o iframe. */
  external?: boolean
  className?: string
}

const variants = {
  primary: 'bg-primary text-primary-foreground glow hover:brightness-110',
  outline: 'border border-foreground/12 bg-foreground/[0.03] text-foreground hover:bg-foreground/[0.07]',
  dark: 'bg-background text-foreground hover:bg-background/85',
}

const sizes = {
  sm: 'h-9 px-4 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-base',
}

export function CtaLink({
  children,
  variant = 'primary',
  size = 'md',
  withArrow = false,
  external = false,
  className,
}: CtaLinkProps) {
  const classes = ctaClasses({ variant, size, className })
  const content = (
    <>
      {children}
      {withArrow && (
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
      )}
    </>
  )

  if (external) {
    return (
      <a href={SIGNUP_URL} target="_blank" rel="noopener noreferrer" className={classes}>
        {content}
      </a>
    )
  }

  return (
    <Link href={CADASTRO_PATH} className={classes}>
      {content}
    </Link>
  )
}

export function ctaClasses({
  variant = 'primary',
  size = 'md',
  className,
}: Pick<CtaLinkProps, 'variant' | 'size' | 'className'>) {
  return cn(
    'group inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all outline-none focus-visible:ring-3 focus-visible:ring-ring',
    variants[variant],
    sizes[size],
    className,
  )
}
