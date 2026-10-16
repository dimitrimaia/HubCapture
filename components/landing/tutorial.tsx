import Image from 'next/image'
import Link from 'next/link'
import { Check, Lightbulb, RotateCcw, Smartphone, Sun, Volume2, X } from 'lucide-react'
import { CopyCodeButton } from './copy-code-button'
import { CtaLink } from './cta-link'
import { Eyebrow } from './eyebrow'
import { StoreBadges } from './store-badges'
import { ModeSwitch } from './mode-context'
import { TUTORIAIS_PATH } from '@/lib/site'

const setupTips = [
  { icon: Sun, label: 'Boa iluminação, uniforme' },
  { icon: Volume2, label: 'Ambiente calmo' },
  { icon: Smartphone, label: 'Lente limpa' },
  { icon: RotateCcw, label: 'Celular na horizontal' },
]

const approved = [
  'Vídeo estável, tarefa do começo ao fim',
  'Mãos e objetos sempre visíveis no quadro',
  'Celular inclinado cerca de 45° para baixo',
  'Ritmo natural, como você faria sem gravar',
]

const rejected = [
  'Câmera tremida, inclinada ou obstruída',
  'Mãos fora do quadro por muito tempo',
  'Movimentos encenados ou repetidos de propósito',
  'Pausas longas ou tarefa incompleta',
]

export function Tutorial() {
  return (
    <section id="tutorial" aria-labelledby="tutorial-title" className="scroll-mt-20 px-4 py-16 sm:px-6 md:py-24">
      <div className="mx-auto max-w-4xl">
        <div className="max-w-2xl">
          <Eyebrow>Tutorial completo</Eyebrow>
          <h2 id="tutorial-title" className="mt-4 text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            Como começar no Hub Capture: do cadastro ao primeiro PIX
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Siga estes 5 passos na ordem. Quem segue o tutorial tem muito mais gravações aprovadas logo na primeira
            semana.
          </p>
        </div>

        <ol className="mt-12 flex flex-col gap-4">
          <TutorialStep number={1} title="Crie sua conta com o código VEMHUB">
            <p>
              Toque em <strong className="text-foreground">Cadastrar</strong>, preencha seus dados e, no campo de
              convite, use o código oficial. Pelo link deste site ele já vem preenchido.
            </p>
            <div className="mt-4">
              <CopyCodeButton size="sm" />
            </div>
          </TutorialStep>

          <TutorialStep number={2} title="Peça seu Starter Kit grátis">
            <div className="grid gap-5 sm:grid-cols-[1fr_12rem] sm:items-center">
              <div>
                <p>Tudo o que você precisa para gravar com as mãos livres chega na sua casa, sem custo:</p>
                <ul className="mt-3 flex flex-col gap-2">
                  {['Faixa de cabeça para prender o celular', 'Suporte que encaixa no seu celular', 'Guia rápido da primeira gravação'].map(
                    (item) => (
                      <li key={item} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
                        {item}
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="relative aspect-square overflow-hidden rounded-2xl border border-border">
                <Image
                  src="/images/starter-kit.png"
                  alt="Starter Kit da Hub com faixa de cabeça e suporte para celular"
                  fill
                  sizes="12rem"
                  className="object-cover"
                />
              </div>
            </div>
          </TutorialStep>

          <TutorialStep number={3} title="Baixe o app Hub Capture e escolha o modo certo">
            <p>
              O Hub Capture é o app onde você grava e envia as tarefas. Baixe na App Store ou no Google Play e entre com
              o mesmo e-mail da sua conta Hub. Depois, em <strong className="text-foreground">Configurações → Organization</strong>, escolha:
            </p>
            <StoreBadges className="mt-4" />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <p className="font-semibold text-foreground">Residencial = Casa</p>
                <p className="mt-1 text-sm">Tarefas do dia a dia na sua casa. Até R$ 35/h.</p>
              </div>
              <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4">
                <p className="font-semibold text-foreground">Comercial = Trabalho</p>
                <p className="mt-1 text-sm">Atividades profissionais no expediente. Até R$ 50/h.</p>
              </div>
            </div>
          </TutorialStep>

          <TutorialStep number={4} title="Prepare o ambiente e posicione o celular">
            <p>
              Prenda o celular na faixa, na altura dos olhos, inclinado cerca de 45° para baixo e na horizontal. Suas
              mãos precisam aparecer no centro do quadro.
            </p>
            <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {setupTips.map((tip) => (
                <li
                  key={tip.label}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background/50 p-4 text-center text-sm"
                >
                  <tip.icon className="size-5 text-primary" aria-hidden="true" />
                  {tip.label}
                </li>
              ))}
            </ul>
          </TutorialStep>

          <TutorialStep number={5} title="Grave a tarefa de verdade e envie">
            <p>
              <ModeSwitch
                trabalho="Escolha uma tarefa do seu setor, toque em Play e trabalhe normalmente. Ao terminar, envie o vídeo para análise."
                casa="Escolha uma tarefa da casa, como cozinhar ou organizar, toque em Play e faça no seu ritmo. Ao terminar, envie o vídeo para análise."
              />
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <RuleList title="O que é aprovado" items={approved} positive />
              <RuleList title="O que é rejeitado" items={rejected} />
            </div>
            <p className="mt-4 flex gap-2 rounded-2xl bg-primary/10 p-4 text-sm text-foreground">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
              Após a aprovação, o valor entra automaticamente no painel e é pago semanalmente via PIX ou transferência.
            </p>
          </TutorialStep>
        </ol>

        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <CtaLink size="lg" withArrow>
            Começar agora com VEMHUB
          </CtaLink>
          <Link
            href={TUTORIAIS_PATH}
            className="inline-flex h-13 items-center justify-center rounded-full px-5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Ver tutoriais em vídeo
          </Link>
        </div>
      </div>
    </section>
  )
}

function TutorialStep({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="glass flex gap-4 rounded-3xl p-5 sm:gap-6 sm:p-8">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-mono font-bold text-primary-foreground">
        {number}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
        <div className="mt-3 leading-relaxed text-muted-foreground">{children}</div>
      </div>
    </li>
  )
}

function RuleList({ title, items, positive = false }: { title: string; items: string[]; positive?: boolean }) {
  const Icon = positive ? Check : X
  return (
    <div
      className={
        positive
          ? 'rounded-2xl border border-primary/30 bg-primary/5 p-4'
          : 'rounded-2xl border border-destructive/25 bg-destructive/5 p-4'
      }
    >
      <p className={positive ? 'font-semibold text-primary' : 'font-semibold text-destructive'}>{title}</p>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <Icon
              className={positive ? 'mt-0.5 size-4 shrink-0 text-primary' : 'mt-0.5 size-4 shrink-0 text-destructive'}
              aria-hidden="true"
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
