import type { Metadata } from 'next'
import Link from 'next/link'
import { articleMetadata, ArticleLayout } from '@/components/landing/article-layout'
import { CONFIAVEL_PATH, QUANTO_PAGA_PATH, TUTORIAIS_PATH } from '@/lib/site'

const title = 'Hub Data: quanto paga por hora? Valores, categorias e pagamento via PIX'
const description =
  'Quanto a Hub Data paga no Hub Capture: até R$ 35/h em casa e até R$ 50/h no trabalho por hora aprovada, o que conta como hora aprovada, calendário semanal e saque via PIX.'

export const metadata: Metadata = articleMetadata(QUANTO_PAGA_PATH, title, description)

const faqs = [
  {
    question: 'Quanto a Hub Data paga por hora?',
    answer:
      'Até R$ 35 por hora aprovada em tarefas de casa (modo Residencial) e até R$ 50 por hora aprovada em atividades profissionais (modo Comercial). São valores máximos, que variam por tarefa e campanha.',
  },
  {
    question: 'Quando a Hub Data paga?',
    answer:
      'O saldo aprovado é pago semanalmente, conforme o calendário de pagamentos mostrado no painel, via PIX ou transferência bancária.',
  },
  {
    question: 'Todo tempo gravado é pago?',
    answer:
      'Não. Só o tempo aprovado na verificação de qualidade entra no saldo. Vídeos tremidos, com as mãos fora do quadro, encenados ou incompletos podem ser reprovados.',
  },
  {
    question: 'Preciso pagar algo para receber?',
    answer:
      'Não. O cadastro é gratuito e você não precisa pagar taxa, comprar planos nem indicar pessoas para receber. Desconfie de quem cobrar para "liberar" tarefas ou saques.',
  },
]

const toc = [
  { id: 'valores', label: 'Valores por hora' },
  { id: 'hora-aprovada', label: 'O que conta como hora aprovada' },
  { id: 'categorias', label: 'Categorias e setores' },
  { id: 'pagamento', label: 'Quando e como recebo' },
  { id: 'ganhar-mais', label: 'Como ganhar mais' },
]

export default function QuantoPagaPage() {
  return (
    <ArticleLayout
      path={QUANTO_PAGA_PATH}
      title={title}
      description={description}
      eyebrow="Pagamentos"
      heading="Hub Data: quanto paga por hora de gravação?"
      intro={
        <p>
          Valores por hora aprovada, o que é contado, categorias e como receber via PIX no <strong>Hub Capture</strong>.
          Oportunidade variável, sem ganho garantido: o valor depende das tarefas disponíveis e da aprovação dos vídeos.
        </p>
      }
      toc={toc}
      faqs={faqs}
    >
      <h2 id="valores">Valores por hora na Hub Data</h2>
      <ul>
        <li>
          <strong>Modo Residencial (casa):</strong> até R$ 35 por hora aprovada, em tarefas como cozinhar, lavar louça,
          dobrar roupas e organizar.
        </li>
        <li>
          <strong>Modo Comercial (trabalho):</strong> até R$ 50 por hora aprovada, gravando atividades profissionais
          reais durante o expediente.
        </li>
      </ul>
      <p>
        São valores máximos. O valor de cada tarefa aparece no app antes de você gravar e pode mudar conforme a campanha.
      </p>

      <h2 id="hora-aprovada">O que conta como hora aprovada</h2>
      <p>
        Cada vídeo passa por uma verificação de qualidade. Só o tempo aprovado entra no saldo. Para ser aprovado, o vídeo
        precisa estar estável, com as mãos e os objetos visíveis, a tarefa feita do começo ao fim e em ritmo natural.
        Veja os <Link href={TUTORIAIS_PATH}>tutoriais em vídeo</Link> para acertar desde a primeira gravação.
      </p>

      <h2 id="categorias">Categorias e setores</h2>
      <p>
        No modo Comercial são mais de 100 tarefas em 14 setores, como construção, manutenção predial, oficina mecânica,
        marcenaria, varejo, logística, restaurantes, hotéis, salões e limpeza comercial — sempre com autorização do
        responsável pelo local. Além das tarefas do Hub Capture, o app Minute libera tarefas extras somadas no mesmo
        saldo.
      </p>

      <h2 id="pagamento">Quando e como recebo</h2>
      <p>
        As horas aprovadas aparecem no saldo do painel. Os pagamentos são semanais, conforme o calendário exibido na sua
        conta, via <strong>PIX</strong> ou transferência bancária.
      </p>

      <h2 id="ganhar-mais">Como ganhar mais no Hub Capture</h2>
      <ul>
        <li>Use as duas fontes de tarefas: o app Hub Capture e o Minute.</li>
        <li>Priorize tarefas do modo Comercial, que pagam mais por hora, quando tiver autorização no trabalho.</li>
        <li>Siga o checklist de qualidade para reduzir reprovações.</li>
        <li>Grave com um suporte estável, como o Starter Kit ou o boné HubCap.</li>
      </ul>
      <p>
        Ainda com dúvida se vale a pena? Leia a análise <Link href={CONFIAVEL_PATH}>Hub Data é confiável?</Link>
      </p>
    </ArticleLayout>
  )
}
