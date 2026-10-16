import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Geist_Mono, Space_Grotesk } from 'next/font/google'
import { APP_STORE_ID, APP_STORE_URL, PLAY_STORE_URL, SITE_URL } from '@/lib/site'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
})

const title = 'Hub Capture: ganhe dinheiro gravando vídeos com o celular | Hub App e Hub Data — Código VEMHUB'
const description =
  'Hub Capture é o app da Hub Data que paga até R$ 50/h para você gravar tarefas em casa ou no trabalho com o celular. Baixe o Hub App, cadastre-se grátis com o código VEMHUB e saque via PIX.'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: '%s | Hub Capture' },
  description,
  applicationName: 'Hub Capture',
  keywords: [
    'hub capture',
    'hubcapture',
    'hub app',
    'app hub',
    'hub data',
    'hubdata',
    'hub capture app',
    'hub capture download',
    'código VEMHUB',
    'boné hubcap',
    'ganhar dinheiro gravando vídeos',
    'ganhar dinheiro com o celular',
    'renda extra em casa',
    'treinar inteligência artificial',
    'starter kit hub',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: '/',
    siteName: 'Hub Capture',
    title,
    description,
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  itunes: { appId: APP_STORE_ID },
  appLinks: {
    ios: { url: APP_STORE_URL, app_store_id: APP_STORE_ID, app_name: 'Hub Capture' },
    android: { package: 'xyz.hub.mobile', url: PLAY_STORE_URL, app_name: 'Hub Capture' },
  },
  other: { 'google-play-app': 'app-id=xyz.hub.mobile' },
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
      </body>
    </html>
  )
}
