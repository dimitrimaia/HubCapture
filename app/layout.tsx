import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Space_Grotesk } from 'next/font/google'
import { SITE_URL } from '@/lib/site'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const title = 'Hub Data: ganhe dinheiro gravando vídeos com o celular | Código VEMHUB'
const description =
  'Ganhe até R$ 50/h gravando tarefas em casa ou no trabalho com o celular. Cadastro grátis na Hub com o código oficial VEMHUB, Starter Kit grátis e saque via PIX.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  applicationName: 'Hub Data',
  keywords: [
    'hub',
    'hub data',
    'hubdata',
    'hub ia',
    'código VEMHUB',
    'ganhar dinheiro gravando vídeos',
    'ganhar dinheiro com o celular',
    'renda extra em casa',
    'trabalho em casa',
    'treinar inteligência artificial',
    'app Minute',
    'starter kit hub',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Hub Data',
    title,
    description,
    images: [{ url: '/images/hero-recording.png', alt: 'Pessoa gravando tarefa com celular na faixa de cabeça' }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: ['/images/hero-recording.png'],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0b120f',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className={`${spaceGrotesk.variable} ${geistMono.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
        <SpeedInsights />
      </body>
    </html>
  )
}
