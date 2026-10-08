import { ChevronDown } from 'lucide-react'
import { faqs } from '@/lib/site'
import { Eyebrow } from './eyebrow'

export function FaqSection() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <Eyebrow>FAQ</Eyebrow>
          <h2 id="faq-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Perguntas frequentes sobre a Hub Data
          </h2>
          <p className="mt-4 text-muted-foreground">Cadastro, código VEMHUB, gravações, aprovação e pagamentos.</p>
        </div>
        <div className="mt-10 flex flex-col gap-3">
          {faqs.map((faq) => (
            <details key={faq.question} className="glass group rounded-2xl">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5 font-semibold [&::-webkit-details-marker]:hidden">
                <h3>{faq.question}</h3>
                <ChevronDown
                  className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="px-5 pb-5 text-pretty leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
