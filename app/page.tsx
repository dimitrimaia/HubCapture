import { DifferenceSection } from '@/components/landing/difference-section'
import { EarningModes } from '@/components/landing/earning-modes'
import { FinalCta } from '@/components/landing/final-cta'
import { Hero } from '@/components/landing/hero'
import { HowItWorks } from '@/components/landing/how-it-works'
import { SiteFooter } from '@/components/landing/site-footer'
import { SiteHeader } from '@/components/landing/site-header'

export default function Page() {
  return (
    <div className="relative min-h-screen overflow-x-clip">
      <div aria-hidden="true" className="bg-grid pointer-events-none fixed inset-0 -z-10" />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[40rem] bg-[radial-gradient(ellipse_at_top,oklch(0.8_0.2_152/0.12),transparent_65%)]"
      />
      <SiteHeader />
      <main>
        <Hero />
        <DifferenceSection />
        <HowItWorks />
        <EarningModes />
        <FinalCta />
      </main>
      <SiteFooter />
    </div>
  )
}
