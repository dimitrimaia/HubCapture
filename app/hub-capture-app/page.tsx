import type { Metadata } from 'next'
import Link from 'next/link'
import { CommunityLinks } from '@/components/landing/community-section'
import { CtaLink } from '@/components/landing/cta-link'
import { Eyebrow } from '@/components/landing/eyebrow'
import { SiteShell } from '@/components/landing/site-shell'
import { StoreBadges } from '@/components/landing/store-badges'
import { GUIA_PATH, HUBCAP_URL, SITE_URL, TUTORIAIS_PATH } from '@/lib/site'

const title = 'Hub Capture App: o que é, como funciona e como ganhar dinheiro (Hub Data)'
const description =
  'Guia completo do Hub Capture App (Hub App / Hub Data): como se cadastrar com o código VEMHUB, tarefas no Hub Capture e no Minute, quanto paga, como receber via PIX e se é confiável.'

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: GUIA_PATH },
  openGraph: { type: 'article', title, description, url: GUIA_PATH },
  twitter: { title, description },
}

const faqs = [
  {
    question: 'O Hub Capture App é confiável?',
    answer:
      'O Hub Capture é o app oficial da Hub (Hub Data), empresa de inteligência artificial com sede em São Francisco e escritório em São Paulo. O cadastro é gratuito, os vídeos passam por verificação de qualidade e o saldo aprovado é pago semanalmente via PIX ou transferência.',
  },
  {
    question: 'Hub Capture, Hub App e Hub Data são a mesma coisa?',
    answer:
      'Sim. Hub Data (ou HubData) é a empresa; Hub Capture, também chamado de Hub App, é o aplicativo e o painel onde você grava tarefas e acompanha seus ganhos.',
  },
  {
    question: 'Qual a diferença entre as tarefas do Hub Capture e do Minute?',
    answer:
      'São duas fontes de tarefas pagas da Hub. As tarefas do Hub Capture ficam no próprio app; o Minute é um segundo app com tarefas extras, liberado ao vincular sua conta com o mesmo e-mail e o código de convite mostrado no painel. As horas aprovadas dos dois somam no mesmo saldo.',
  },
  {
    question: 'Preciso de equipamento para usar o Hub Capture?',
    answer:
      'Só do celular. O Starter Kit (faixa de cabeça e suporte) é grátis, mas pode demorar a chegar; quem quiser começar no mesmo dia pode usar o Suporte Oficial HubCap, um boné com suporte para celular.',
  },
]

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Article',
      headline: title,
      description,
      inLanguage: 'pt-BR',
      url: `${SITE_URL}${GUIA_PATH}`,
      mainEntityOfPage: `${SITE_URL}${GUIA_PATH}`,
      publisher: { '@id': `${SITE_URL}/#organization` },
      about: ['Hub Capture', 'Hub App', 'Hub Data'],
    },
    {
      '@type': 'FAQPage',
      mainEntity: faqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
      })),
    },
  ],
}

const toc = [
  { id: 'o-que-e', label: 'O que é o Hub Capture' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'tarefas', label: 'Tarefas no Hub Capture e no Minute' },
  { id: 'quanto-paga', label: 'Quanto paga e como receber' },
  { id: 'cadastro', label: 'Como se cadastrar' },
  { id: 'dicas', label: 'Dicas para ter vídeos aprovados' },
  { id: 'perguntas', label: 'Perguntas frequentes' },
]

export default function GuiaPage() {
  return (
    <SiteShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
      <article className="px-4 pt-10 pb-16 sm:px-6 md:pt-16 md:pb-24">
        <div className="mx-auto max-w-3xl">
          <Eyebrow>Guia completo</Eyebrow>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Hub Capture App: o que é, como funciona e como ganhar dinheiro
          </h1>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground sm:text-lg">
            Tudo sobre o <strong className="text-foreground">Hub Capture</strong> — também chamado de{' '}
            <strong className="text-foreground">Hub App</strong> — o aplicativo da{' '}
            <strong className="text-foreground">Hub Data</strong> que paga por hora para você gravar tarefas do dia a
            dia com o celular.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <CtaLink size="lg" withArrow>
              Cadastrar com VEMHUB
            </CtaLink>
            <StoreBadges />
          </div>

          <nav aria-label="Neste guia" className="glass mt-10 rounded-2xl p-5">
            <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-primary">Neste guia</p>
            <ol className="mt-3 grid list-decimal gap-1.5 pl-5 text-sm text-muted-foreground sm:grid-cols-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a href={`#${item.id}`} className="transition-colors hover:text-foreground">
                    {item.label}
                  </a>
                </li>
              ))}
            </ol>
          </nav>

          <div className="mt-10 flex flex-col gap-5 leading-relaxed text-muted-foreground [&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:text-balance [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground [&_h3]:mt-4 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground">
            <h2 id="o-que-e">O que é o Hub Capture?</h2>
            <p>
              O Hub Capture é o app oficial da Hub, startup de inteligência artificial conhecida como Hub Data. Ele paga
              pessoas reais para gravar, em primeira pessoa, tarefas que já fazem no dia a dia — cozinhar, organizar,
              limpar, consertar ou montar. Esses vídeos viram dados de treino para robôs e modelos de IA aprenderem como
              humanos usam as mãos.
            </p>
            <p>
              Diferente de apps que pagam para assistir vídeos, no Hub Capture você não posta nada, não aparece o rosto
              e não precisa de seguidores: é pago pela <strong>hora de gravação aprovada</strong>.
            </p>

            <h2 id="como-funciona">Como funciona o Hub App</h2>
            <ul>
              <li>Você cria a conta gratuita com o código de convite VEMHUB.</li>
              <li>Prende o celular na cabeça, na altura dos olhos, com o Starter Kit ou o boné HubCap.</li>
              <li>Escolhe uma tarefa no modo Residencial (casa) ou Comercial (trabalho) e grava do começo ao fim.</li>
              <li>A Hub Data verifica a qualidade e credita as horas aprovadas no seu saldo.</li>
            </ul>
            <p>
              No painel do Hub Capture (app ou navegador) ficam as abas <strong>Gravar e ganhar</strong>, com horas
              gravadas, aprovações e qualidade, e <strong>Indicações</strong>, para acompanhar quem entrou pelo seu
              convite.
            </p>

            <h2 id="tarefas">Tarefas no Hub Capture e no Minute</h2>
            <p>Existem duas fontes de tarefas pagas, e as horas aprovadas das duas somam no mesmo saldo:</p>
            <h3>1. Tarefas do app Hub Capture</h3>
            <p>Ficam no próprio app, em Gravar e ganhar. É por onde a maioria das pessoas começa.</p>
            <h3>2. Tarefas extras no app Minute</h3>
            <p>
              No painel, em <strong>Vincule sua conta do Minute</strong>, copie o e-mail e o código de convite pessoal.
              Baixe o Minute pelos botões do painel e entre (ou cadastre-se uma única vez) com esse mesmo e-mail e
              código — não crie uma segunda conta. A vinculação aparece em até cerca de 20 minutos após a primeira
              gravação.
            </p>

            <h2 id="quanto-paga">Quanto o Hub Capture paga e como receber</h2>
            <p>
              Os valores são por hora de gravação aprovada: até <strong>R$ 35/h</strong> em tarefas de casa e até{' '}
              <strong>R$ 50/h</strong> em atividades profissionais, podendo variar por tarefa e campanha. O saldo
              aprovado é pago semanalmente via <strong>PIX</strong> ou transferência bancária.
            </p>

            <h2 id="cadastro">Como se cadastrar no Hub Capture com o código VEMHUB</h2>
            <ul>
              <li>
                Acesse a <Link href="/cadastro" className="text-primary underline-offset-4 hover:underline">página de cadastro</Link>{' '}
                — o código VEMHUB já vem aplicado.
              </li>
              <li>Peça o Starter Kit grátis no painel ou adquira o <a href={HUBCAP_URL} target="_blank" rel="noopener noreferrer" className="text-primary underline-offset-4 hover:underline">Suporte Oficial HubCap</a>, que chega mais rápido.</li>
              <li>Baixe o app Hub Capture e, se quiser mais tarefas, vincule o Minute.</li>
            </ul>
            <p>
              Prefere ver na prática? Assista aos{' '}
              <Link href={TUTORIAIS_PATH} className="text-primary underline-offset-4 hover:underline">
                tutoriais em vídeo passo a passo
              </Link>
              .
            </p>

            <h2 id="dicas">Dicas para ter mais vídeos aprovados</h2>
            <ul>
              <li>Celular na horizontal, inclinado cerca de 45° para baixo.</li>
              <li>Mãos e objetos sempre visíveis no centro do quadro.</li>
              <li>Boa iluminação, lente limpa e ambiente calmo.</li>
              <li>Tarefa completa, em ritmo natural, sem pausas longas ou movimentos encenados.</li>
            </ul>

            <h2 id="perguntas">Perguntas frequentes sobre o Hub Capture</h2>
            {faqs.map((faq) => (
              <div key={faq.question}>
                <h3>{faq.question}</h3>
                <p className="mt-1">{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className="glass mt-12 flex flex-col gap-4 rounded-3xl p-6 text-center sm:p-8">
            <h2 className="text-xl font-semibold tracking-tight">Ficou com dúvida? Fale comigo</h2>
            <CommunityLinks className="grid gap-3 sm:grid-cols-2" />
          </div>
        </div>
      </article>
    </SiteShell>
  )
}
