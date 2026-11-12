import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { CADASTRO_PATH, GUIA_PATH, HUBCAP_URL, TUTORIAIS_PATH } from '@/lib/site'

const title = 'Hub Capture App: como funciona, download e cadastro grátis'
const description =
  'O Hub Capture paga você para gravar sua rotina com o celular. Veja como funciona o app, onde baixar no Android e no iPhone, requisitos, tarefas no Minute e como criar sua conta grátis.'

export const metadata: Metadata = articleMetadata(GUIA_PATH, title, description)

const faqs = [
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
    question: 'Qual celular preciso para usar o Hub Capture?',
    answer:
      'Um Android ou iPhone com câmera traseira em bom estado, espaço livre de armazenamento, bateria carregada e internet para enviar os vídeos. Não é preciso um celular top de linha.',
  },
  {
    question: 'Preciso de equipamento para gravar?',
    answer:
      'Só do celular e de um suporte de cabeça. O Starter Kit é grátis, mas pode demorar a chegar; quem quiser começar no mesmo dia pode usar o Suporte HubCap, um boné com suporte para celular.',
  },
]

const toc = [
  { id: 'o-que-e', label: 'O que é o Hub Capture' },
  { id: 'como-funciona', label: 'Como funciona' },
  { id: 'tarefas', label: 'Tarefas no Hub Capture e no Minute' },
  { id: 'requisitos', label: 'Requisitos e celulares compatíveis' },
  { id: 'cadastro', label: 'Como se cadastrar' },
  { id: 'dicas', label: 'Dicas para ter vídeos aprovados' },
]

export default function GuiaPage() {
  return (
    <ArticleLayout
      path={GUIA_PATH}
      title={title}
      description={description}
      eyebrow="Hub Capture: como funciona"
      heading="Hub Capture: como funciona o app que paga para gravar tarefas"
      intro={
        <p>
          Tudo sobre o <strong>Hub Capture</strong> — também chamado de <strong>Hub App</strong> — o aplicativo da{' '}
          <strong>Hub Data</strong> que paga por hora para você gravar tarefas do dia a dia com o celular.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="o-que-e">O que é o Hub Capture?</h2>
      <p>
        O Hub Capture é o app oficial da Hub, startup de inteligência artificial conhecida como Hub Data. Ele paga
        pessoas reais para gravar, em primeira pessoa, tarefas que já fazem no dia a dia — cozinhar, organizar, limpar,
        consertar ou montar. Esses vídeos viram dados de treino para robôs e modelos de IA aprenderem como humanos usam
        as mãos.
      </p>
      <p>
        Diferente de apps que pagam para assistir vídeos, no Hub Capture você não posta nada, não aparece o rosto e não
        precisa de seguidores: é pago pela <strong>hora de gravação aprovada</strong>.
      </p>

      <h2 id="como-funciona">Como funciona o Hub App</h2>
      <ul>
        <li>Você cria a conta gratuita com o código de convite VEMHUB.</li>
        <li>Prende o celular na cabeça, na altura dos olhos, com o Starter Kit ou o boné HubCap.</li>
        <li>Escolhe uma tarefa no modo Residencial (casa) ou Comercial (trabalho) e grava do começo ao fim.</li>
        <li>A Hub Data verifica a qualidade e credita as horas aprovadas no seu saldo.</li>
      </ul>
      <p>
        No painel do Hub Capture (app ou navegador) ficam as abas <strong>Gravar e ganhar</strong>, com horas gravadas,
        aprovações e qualidade, e <strong>Indicações</strong>, para acompanhar quem entrou pelo seu convite.
      </p>

      <h2 id="tarefas">Tarefas no Hub Capture e no Minute</h2>
      <p>Existem duas fontes de tarefas pagas, e as horas aprovadas das duas somam no mesmo saldo:</p>
      <h3>1. Tarefas do app Hub Capture</h3>
      <p>Ficam no próprio app, em Gravar e ganhar. É por onde a maioria das pessoas começa.</p>
      <h3>2. Tarefas extras no app Minute</h3>
      <p>
        No painel, em <strong>Vincule sua conta do Minute</strong>, copie o e-mail e o código de convite pessoal. Baixe
        o Minute pelos botões do painel e entre (ou cadastre-se uma única vez) com esse mesmo e-mail e código — não crie
        uma segunda conta. A vinculação aparece em até cerca de 20 minutos após a primeira gravação.
      </p>

      <h2 id="requisitos">Requisitos e celulares compatíveis</h2>
      <ul>
        <li>Celular Android ou iPhone com câmera traseira em bom estado e lente limpa.</li>
        <li>Espaço livre de armazenamento para os vídeos antes do envio.</li>
        <li>Bateria carregada e internet (de preferência Wi-Fi) para enviar as gravações.</li>
        <li>Suporte de cabeça: Starter Kit grátis ou o Suporte HubCap.</li>
        <li>No modo Comercial, autorização do responsável pelo local de trabalho.</li>
      </ul>

      <h2 id="cadastro">Como se cadastrar no Hub Capture com o código VEMHUB</h2>
      <ul>
        <li>
          Acesse a <Link href={CADASTRO_PATH}>página de cadastro</Link> — o código VEMHUB já vem aplicado.
        </li>
        <li>
          Peça o Starter Kit grátis no painel ou adquira o{' '}
          <a href={HUBCAP_URL} target="_blank" rel="noopener noreferrer">
            Suporte HubCap
          </a>
          , que chega mais rápido.
        </li>
        <li>Baixe o app Hub Capture e, se quiser mais tarefas, vincule o Minute.</li>
      </ul>
      <p>
        Prefere ver na prática? Assista aos <Link href={TUTORIAIS_PATH}>tutoriais em vídeo passo a passo</Link>.
      </p>

      <h2 id="dicas">Dicas para ter mais vídeos aprovados</h2>
      <ul>
        <li>Celular na horizontal, inclinado cerca de 45° para baixo.</li>
        <li>Mãos e objetos sempre visíveis no centro do quadro.</li>
        <li>Boa iluminação, lente limpa e ambiente calmo.</li>
        <li>Tarefa completa, em ritmo natural, sem pausas longas ou movimentos encenados.</li>
      </ul>
    </ArticleLayout>
  )
}
