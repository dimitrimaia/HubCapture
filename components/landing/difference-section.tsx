import { Check, Database, Eye, X } from 'lucide-react'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'

const socialApps = [
  'Paga centavos por visualização em apps de vídeos curtos',
  'Metas de pontos e limites diários para sacar',
  'Ganho depende de seguidores, curtidas e anúncios',
  'O conteúdo já existe e o valor é dividido entre milhões',
]

const hub = [
  'Você não posta nada: os vídeos não vão para redes sociais',
  'Gera dados estruturados em primeira pessoa para treinar IA',
  'Pagamento por hora gravada e aprovada, não por audiência',
  'Verificação de qualidade e crédito automático no painel',
]

export function DifferenceSection() {
  return (
    <section id="diferenca" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <Eyebrow>Por que isso é diferente?</Eyebrow>
          <h2 className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Isso não é rede social. É venda de dados para inteligência artificial.
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Robôs e modelos de IA precisam aprender como humanos fazem tarefas reais — e esses registros ainda não
            existem. Você grava, a Hub organiza os dados e você é pago pelo tempo aprovado.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <article className="rounded-3xl border border-destructive/20 bg-destructive/[0.04] p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
                <Eye className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-destructive">Assistir ou postar vídeos</h3>
                <p className="text-sm text-muted-foreground">Modelo de recompensa por visualização</p>
              </div>
            </div>
            <ul className="mt-6 flex flex-col gap-3">
              {socialApps.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                  <X className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="relative overflow-hidden rounded-3xl border border-primary/30 bg-primary/[0.06] p-6 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 -right-24 size-64 rounded-full bg-primary/20 blur-3xl"
            />
            <div className="relative flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <Database className="size-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-semibold text-primary">Gravar dados para a Hub</h3>
                <p className="text-sm text-muted-foreground">Plataforma que paga por dados de treino de IA</p>
              </div>
            </div>
            <ul className="relative mt-6 flex flex-col gap-3">
              {hub.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-foreground/85">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="glass mt-4 flex flex-col gap-4 rounded-3xl p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground">
            A Hub é uma startup de IA com sede em São Francisco e escritório em São Paulo. A missão: abrir novas fontes
            de renda pagando pessoas reais para ajudar a treinar robôs.
          </p>
          <CtaLink withArrow className="shrink-0">
            Quero participar
          </CtaLink>
        </div>
      </div>
    </section>
  )
}
