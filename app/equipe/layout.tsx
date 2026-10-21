import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Equipe · Hub Capture' },
  robots: { index: false, follow: false },
}

export default function EquipeLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-background text-foreground">{children}</div>
}
