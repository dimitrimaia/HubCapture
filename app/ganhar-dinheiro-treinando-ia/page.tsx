import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { CADASTRO_PATH, CONFIAVEL_PATH, GUIA_PATH, QUANTO_PAGA_PATH, REFERRAL_CODE, TREINAR_IA_PATH, TUTORIAIS_PATH } from '@/lib/site'

const title = 'Ganhar dinheiro treinando IA e robôs pelo celular | Hub Capture'
const description =
  'Como funciona o treinamento de robôs remunerado da Hub Data: grave tarefas do dia a dia com o celular, ajude a treinar inteligência artificial e receba por hora aprovada via PIX. Código VEMHUB.'

export const metadata: Metadata = articleMetadata(TREINAR_IA_PATH, title, description)

const faqs = [
  {
    question: 'Dá mesmo para ganhar dinheiro treinando inteligência artificial?',
    answer:
      'Sim. Empresas de robótica e IA precisam de vídeos de pessoas fazendo tarefas reais para treinar seus modelos. No Hub Capture, da Hub Data, você grava essas tarefas com o celular e recebe por hora de gravação aprovada. O valor varia por tarefa e não há ganho garantido.',
  },
  {
    question: 'O que é o treinamento de robôs remunerado?',
    answer:
      'É gravar, em primeira pessoa, atividades como cozinhar, dobrar roupas ou fazer uma manutenção. Os vídeos mostram para os robôs como uma pessoa usa as mãos e os objetos. Você não programa nada: só grava a tarefa do começo ao fim.',
  },
  {
    question: 'Preciso entender de tecnologia para treinar IA?',
    answer:
      'Não. Basta um celular com câmera, boa iluminação e um suporte de cabeça (o Starter Kit é grátis). O app mostra cada tarefa e como gravar.',
  },
  {
    question: 'Treinar IA é golpe?',
    answer:
      'O Hub Capture é o app oficial da Hub Data, gratuito e disponível no Google Play e na App Store. Você nunca precisa pagar para começar nem para sacar. Desconfie de quem cobrar taxa para "liberar" tarefas.',
  },
  {
    question: 'Como me cadastrar para treinar IA?',
    answer: `Crie sua conta grátis pelo link oficial com o código ${REFERRAL_CODE}, baixe o app Hub Capture, peça o Starter Kit e faça sua primeira gravação seguindo os tutoriais.`,
  },
]

const toc = [
  { id: 'por-que', label: 'Por que pagam para treinar robôs' },
  { id: 'como-funciona', label: 'Como funciona na prática' },
  { id: 'quanto-paga', label: 'Quanto dá para ganhar' },
  { id: 'o-que-precisa', label: 'O que você precisa' },
  { id: 'comecar', label: 'Como começar hoje' },
]

export default function TreinarIaPage() {
  return (
    <ArticleLayout
      path={TREINAR_IA_PATH}
      title={title}
      description={description}
      eyebrow="Renda extra com inteligência artificial"
      heading="Como ganhar dinheiro treinando IA e robôs com o celular"
      intro={
        <p>
          Robôs e sistemas de <strong>inteligência artificial</strong> aprendem vendo pessoas de verdade trabalhando. Com
          o <strong>Hub Capture</strong>, app da <strong>Hub Data</strong>, você grava tarefas do seu dia a dia e recebe por
          isso: uma <strong>renda extra pelo celular</strong>, sem precisar entender de tecnologia.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="por-que">Por que empresas pagam para treinar robôs</h2>
      <p>
        Para um robô aprender a dobrar uma roupa ou montar uma peça, ele precisa de milhares de exemplos de mãos humanas
        fazendo isso no mundo real. Esse material não existe pronto na internet: alguém precisa gravar. É aí que entra o{' '}
        <strong>treinamento de robôs remunerado</strong>: a Hub Data paga pessoas comuns para gravar essas tarefas em
        primeira pessoa e usa os vídeos aprovados para treinar inteligência artificial.
      </p>

      <h2 id="como-funciona">Como funciona na prática</h2>
      <ol>
        <li>
          Crie sua conta grátis com o código <strong>{REFERRAL_CODE}</strong>.
        </li>
        <li>Prenda o celular na cabeça, na altura dos olhos, com o Starter Kit ou o boné HubCap.</li>
        <li>Escolha uma tarefa no app (em casa ou no trabalho) e grave do começo ao fim, em ritmo natural.</li>
        <li>Envie o vídeo. Depois da verificação de qualidade, as horas aprovadas entram no seu saldo.</li>
      </ol>
      <p>
        Quer ver cada passo? Os <Link href={TUTORIAIS_PATH}>tutoriais em vídeo</Link> mostram do cadastro ao primeiro PIX,
        e o <Link href={GUIA_PATH}>guia do Hub Capture</Link> explica o app em detalhes.
      </p>

      <h2 id="quanto-paga">Quanto dá para ganhar treinando IA</h2>
      <p>
        As tarefas pagam <strong>até R$ 35 por hora aprovada</strong> no modo casa e <strong>até R$ 50 por hora</strong> no
        modo trabalho. São valores máximos, que mudam conforme a tarefa e a campanha, e só o tempo aprovado conta. Os
        pagamentos são semanais, via PIX. Veja os detalhes em <Link href={QUANTO_PAGA_PATH}>Hub Data: quanto paga</Link>.
      </p>

      <h2 id="o-que-precisa">O que você precisa para trabalhar com IA pelo celular</h2>
      <ul>
        <li>Um celular Android ou iPhone com câmera em bom estado e espaço livre.</li>
        <li>Boa iluminação e um ambiente calmo.</li>
        <li>Um suporte de cabeça: o Starter Kit é grátis (pode demorar a chegar) e o boné HubCap chega mais rápido.</li>
        <li>Internet para enviar os vídeos.</li>
      </ul>
      <p>
        Ainda com o pé atrás? Leia a análise <Link href={CONFIAVEL_PATH}>Hub Data é confiável?</Link>, com privacidade,
        pagamentos e como evitar golpes.
      </p>

      <h2 id="comecar">Como começar hoje</h2>
      <p>
        O cadastro leva poucos minutos. Use a <Link href={CADASTRO_PATH}>página de cadastro com o código {REFERRAL_CODE}</Link>
        , baixe o app e faça sua primeira gravação ainda hoje.
      </p>
    </ArticleLayout>
  )
}
