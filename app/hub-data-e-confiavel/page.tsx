import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { CADASTRO_PATH, CONFIAVEL_PATH, QUANTO_PAGA_PATH } from '@/lib/site'

const title = 'Hub Data é confiável? Análise do Hub Capture: privacidade, pagamentos e cuidados'
const description =
  'A Hub Data é confiável? Veja quem é a empresa por trás do Hub Capture, o que acontece com seus vídeos, privacidade, pagamentos via PIX e como evitar golpes.'

export const metadata: Metadata = articleMetadata(CONFIAVEL_PATH, title, description)

const faqs = [
  {
    question: 'A Hub Data é golpe?',
    answer:
      'A Hub é uma startup de inteligência artificial com sede em São Francisco e escritório em São Paulo. O cadastro é gratuito e os pagamentos são feitos via PIX ou transferência sobre horas aprovadas. Golpes costumam cobrar taxas para liberar ganhos — algo que a Hub não faz.',
  },
  {
    question: 'Meus vídeos vão para a internet?',
    answer:
      'Não. As gravações não são publicadas em redes sociais: elas viram dados de treino para modelos de IA. A câmera fica na altura dos olhos e grava as mãos e a tarefa, não o seu rosto.',
  },
  {
    question: 'Posso gravar outras pessoas?',
    answer:
      'Evite. Grave apenas a sua própria tarefa, sem mostrar rostos de terceiros, documentos ou telas com dados pessoais. No trabalho, grave só com autorização do responsável.',
  },
]

const toc = [
  { id: 'quem-e', label: 'Quem é a Hub' },
  { id: 'videos', label: 'O que acontece com os vídeos' },
  { id: 'privacidade', label: 'Privacidade e cuidados' },
  { id: 'golpes', label: 'Como evitar golpes' },
  { id: 'veredito', label: 'Vale a pena?' },
]

export default function ConfiavelPage() {
  return (
    <ArticleLayout
      path={CONFIAVEL_PATH}
      title={title}
      description={description}
      eyebrow="Confiança"
      heading="Hub Data é confiável? Análise do Hub Capture"
      intro={
        <p>
          Informações sobre funcionamento, privacidade e cuidados antes de começar a gravar no <strong>Hub Capture</strong>,
          o app da <strong>Hub Data</strong>.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="quem-e">Quem é a Hub (Hub Data)</h2>
      <p>
        A Hub é uma startup de inteligência artificial com sede em São Francisco (EUA) e escritório em São Paulo. Ela
        coleta vídeos em primeira pessoa de tarefas reais para treinar robôs e modelos de IA, e paga as pessoas que
        gravam por hora aprovada. O <strong>Hub Capture</strong> (Hub App) é o aplicativo e o painel da plataforma.
      </p>

      <h2 id="videos">O que acontece com os seus vídeos</h2>
      <ul>
        <li>As gravações viram dados de treino para inteligência artificial.</li>
        <li>Não são publicadas em redes sociais, então seguidores e curtidas não importam.</li>
        <li>A câmera grava as mãos e a tarefa, não o seu rosto.</li>
        <li>Cada vídeo passa por verificação de qualidade antes de entrar no saldo.</li>
      </ul>

      <h2 id="privacidade">Privacidade e cuidados ao gravar</h2>
      <ul>
        <li>Não grave rostos de outras pessoas, documentos, cartões ou telas com dados pessoais.</li>
        <li>No modo Comercial, grave somente com autorização do responsável pelo local.</li>
        <li>Evite mostrar endereço, fachada ou informações que identifiquem sua casa.</li>
        <li>Leia os termos e a política de privacidade no próprio app antes de aceitar.</li>
      </ul>

      <h2 id="golpes">Como evitar golpes com o nome da Hub</h2>
      <ul>
        <li>Use apenas o app oficial Hub Capture (Google Play e App Store) e o link oficial de cadastro.</li>
        <li>A Hub não cobra para liberar tarefas, aumentar valores ou fazer saques. Quem pedir dinheiro não é a Hub.</li>
        <li>Nunca passe sua senha ou códigos de verificação para terceiros.</li>
      </ul>

      <h2 id="veredito">Vale a pena?</h2>
      <p>
        Para quem quer renda extra usando o celular em tarefas que já faz, sim: o cadastro é gratuito e o pagamento é por
        hora aprovada, via PIX. É uma oportunidade variável, sem ganho garantido — o resultado depende das tarefas
        disponíveis e da qualidade das gravações. Veja <Link href={QUANTO_PAGA_PATH}>quanto a Hub Data paga</Link> e, se
        quiser começar, <Link href={CADASTRO_PATH}>cadastre-se com o código VEMHUB</Link>.
      </p>
    </ArticleLayout>
  )
}
