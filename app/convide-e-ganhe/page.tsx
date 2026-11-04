import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { alternatesIdiomas, PAGINAS_TRADUZIDAS } from '@/lib/i18n'
import { CADASTRO_PATH, CONFIAVEL_PATH, QUANTO_PAGA_PATH, REFERRAL_CODE, SIGNUP_URL } from '@/lib/site'

const caminho = PAGINAS_TRADUZIDAS.convide.pt
const title = 'Convide e Ganhe – Hub Data: como funciona a indicação no Hub Capture'
const description = `Como funciona o Convide e Ganhe da Hub Data: onde fica seu link de convite no painel do Hub Capture, como acompanhar suas indicações e como entrar com o código ${REFERRAL_CODE}.`

export const metadata: Metadata = { ...articleMetadata(caminho, title, description), alternates: alternatesIdiomas('convide', 'pt') }

const faqs = [
  {
    question: 'Preciso convidar pessoas para ganhar na Hub Data?',
    answer: 'Não. O ganho principal vem das horas de gravação aprovadas. Convidar é opcional e as regras do programa aparecem no seu painel.',
  },
  {
    question: 'Onde vejo meu link de convite e minhas indicações?',
    answer: 'No painel do Hub Capture, na área de indicações (Convide e Ganhe). Lá você copia seu link pessoal e acompanha quem entrou pelo seu convite.',
  },
  {
    question: 'Quanto ganho por indicação?',
    answer: 'As regras e os valores do Convide e Ganhe são definidos pela Hub e podem mudar. Consulte sempre o seu painel antes de divulgar, e nunca prometa valores fixos a ninguém.',
  },
  {
    question: 'Preciso pagar algo para participar?',
    answer: 'Não. Cadastro, convite e saque são gratuitos. Desconfie de quem cobrar taxa para entrar ou para liberar indicações.',
  },
  {
    question: `Como entro pelo convite ${REFERRAL_CODE}?`,
    answer: `Use o link oficial ${SIGNUP_URL.replace('https://', '')}: o código ${REFERRAL_CODE} já vem aplicado. Depois é só baixar o app Hub Capture e entrar com o mesmo e-mail.`,
  },
]

const toc = [
  { id: 'o-que-e', label: 'O que é o Convide e Ganhe' },
  { id: 'como-convidar', label: 'Como convidar' },
  { id: 'regras', label: 'Regras e valores' },
  { id: 'entrar', label: 'Como entrar por um convite' },
  { id: 'dicas', label: 'Como divulgar do jeito certo' },
]

export default function ConvideEGanhePage() {
  return (
    <ArticleLayout
      path={caminho}
      title={title}
      description={description}
      eyebrow="Convide e Ganhe"
      heading="Convide e Ganhe – Hub Data: como funciona a indicação"
      intro={
        <p>
          O <strong>Convide e Ganhe</strong> (Invite & Earn) é o programa de indicação da <strong>Hub Data</strong>: quem já
          grava no <strong>Hub Capture</strong> pode convidar outras pessoas com um link pessoal e acompanhar quem entrou.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="o-que-e">O que é o Convide e Ganhe</h2>
      <p>
        Além de ganhar pelas horas de gravação aprovadas, a Hub permite convidar amigos e seguidores para o programa. Cada
        pessoa tem um <strong>link de convite pessoal</strong>, e as indicações aparecem no painel da sua conta.
      </p>

      <h2 id="como-convidar">Como convidar</h2>
      <ol>
        <li>Entre no painel do Hub Capture (app ou app.hub.xyz).</li>
        <li>Abra a área de indicações (Convide e Ganhe).</li>
        <li>Copie seu link ou código pessoal e compartilhe.</li>
        <li>Acompanhe no próprio painel quem se cadastrou pelo seu convite.</li>
      </ol>

      <h2 id="regras">Regras e valores</h2>
      <p>
        Quem define as regras e os valores do Convide e Ganhe é a Hub, e eles podem mudar com o tempo. Por isso não
        publicamos valores aqui: <strong>confira sempre o seu painel</strong>. O ganho principal continua sendo as horas
        aprovadas, como explicamos em <Link href={QUANTO_PAGA_PATH}>quanto a Hub paga</Link>.
      </p>

      <h2 id="entrar">Como entrar por um convite</h2>
      <p>
        Ainda não tem conta? Entre pela <Link href={CADASTRO_PATH}>página de cadastro com o código {REFERRAL_CODE}</Link>: o
        código já vem aplicado no link oficial. Depois baixe o app Hub Capture e peça o Starter Kit.
      </p>

      <h2 id="dicas">Como divulgar do jeito certo</h2>
      <ul>
        <li>Explique que é um trabalho de verdade: gravar tarefas, com verificação de qualidade.</li>
        <li>Nunca prometa valores fixos ou ganho garantido.</li>
        <li>Mande para quem tem interesse, sem spam em grupos.</li>
        <li>
          Indique a leitura <Link href={CONFIAVEL_PATH}>Hub Data é confiável?</Link> para quem tiver dúvidas.
        </li>
      </ul>
    </ArticleLayout>
  )
}
