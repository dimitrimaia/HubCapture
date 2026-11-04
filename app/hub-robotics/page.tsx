import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { CADASTRO_PATH, CONFIAVEL_PATH, GUIA_PATH, HUB_OFICIAL_URL, HUB_ROBOTICS_PATH, QUANTO_PAGA_PATH, TREINAR_IA_PATH } from '@/lib/site'

const title = 'Hub Robotics: o que é a empresa por trás do Hub Capture'
const description =
  'Hub Robotics (Hub, Hub Data) coleta vídeos de tarefas reais em casas e empresas para treinar robôs e IA. Entenda a empresa, o app Hub Capture e como participar e ganhar por hora.'

export const metadata: Metadata = articleMetadata(HUB_ROBOTICS_PATH, title, description)

const faqs = [
  {
    question: 'Hub Robotics, Hub Data e Hub Capture são a mesma empresa?',
    answer:
      'Hub Robotics é a empresa (site oficial hub.xyz), também chamada de Hub ou Hub Data. Hub Capture é o aplicativo dela onde as pessoas gravam tarefas e recebem por hora aprovada.',
  },
  {
    question: 'O que a Hub Robotics faz com os vídeos?',
    answer:
      'Segundo o site oficial, a Hub coleta dados egocêntricos (gravados do ponto de vista de quem faz a tarefa) em ambientes comerciais e residenciais para treinar modelos de mundo e IA incorporada, que é a inteligência que controla robôs.',
  },
  {
    question: 'Como trabalhar para a Hub Robotics?',
    answer:
      'Você participa pelo app Hub Capture: cria uma conta, grava tarefas do dia a dia com o celular preso na cabeça e recebe pelas horas aprovadas. O cadastro é grátis.',
  },
  {
    question: 'Este site é da Hub Robotics?',
    answer:
      'Não. Este é um site parceiro de divulgação, com guias e o código de convite. Informações oficiais estão em hub.xyz.',
  },
]

const toc = [
  { id: 'o-que-e', label: 'O que é a Hub Robotics' },
  { id: 'por-que', label: 'Por que ela precisa de vídeos' },
  { id: 'hub-capture', label: 'Onde entra o Hub Capture' },
  { id: 'participar', label: 'Como participar' },
]

export default function HubRoboticsPage() {
  return (
    <ArticleLayout
      path={HUB_ROBOTICS_PATH}
      title={title}
      description={description}
      eyebrow="A empresa"
      heading="Hub Robotics: a empresa por trás do Hub Capture"
      intro={
        <p>
          A <strong>Hub Robotics</strong>, também chamada de <strong>Hub</strong> ou <strong>Hub Data</strong>, é a empresa
          que paga pessoas para gravar tarefas reais e usa esses vídeos para treinar robôs. O app em que você grava é o{' '}
          <strong>Hub Capture</strong>.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="o-que-e">O que é a Hub Robotics</h2>
      <p>
        No <a href={HUB_OFICIAL_URL} target="_blank" rel="noopener noreferrer">site oficial (hub.xyz)</a>, a Hub se
        apresenta como uma empresa que coleta <strong>dados egocêntricos</strong> em ambientes comerciais e residenciais
        para treinar <strong>modelos de mundo</strong> e <strong>IA incorporada</strong>. Em outras palavras: vídeos
        gravados do ponto de vista de quem faz a tarefa, que ensinam robôs a usar as mãos no mundo real.
      </p>

      <h2 id="por-que">Por que ela precisa de vídeos de pessoas comuns</h2>
      <p>
        Um robô só aprende a cozinhar, organizar ou fazer uma manutenção vendo muitos exemplos reais. Esses exemplos não
        existem prontos: precisam ser gravados em casas e locais de trabalho de verdade. Por isso a Hub paga por hora de
        gravação aprovada. Entenda melhor em <Link href={TREINAR_IA_PATH}>como ganhar dinheiro treinando IA</Link>.
      </p>

      <h2 id="hub-capture">Onde entra o Hub Capture</h2>
      <p>
        O <strong>Hub Capture</strong> (ou Hub App) é o aplicativo da Hub Robotics para Android e iPhone. É nele que você
        escolhe a tarefa, grava com o celular na cabeça e acompanha as horas aprovadas. Veja o{' '}
        <Link href={GUIA_PATH}>guia completo do app</Link>, <Link href={QUANTO_PAGA_PATH}>quanto a Hub paga</Link> e a
        análise <Link href={CONFIAVEL_PATH}>Hub Data é confiável?</Link>
      </p>

      <h2 id="participar">Como participar</h2>
      <p>
        Crie sua conta grátis na <Link href={CADASTRO_PATH}>página de cadastro</Link>, baixe o Hub Capture, peça o Starter
        Kit e faça sua primeira gravação. Os pagamentos são semanais, via PIX.
      </p>
    </ArticleLayout>
  )
}
