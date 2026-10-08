export const REFERRAL_CODE = 'VEMHUB'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'

export const faqs = [
  {
    question: 'O que é a Hub Data?',
    answer:
      'A Hub (também conhecida como Hub Data ou HubData) é uma startup de inteligência artificial com sede em São Francisco e escritório em São Paulo. A plataforma paga pessoas reais para gravar tarefas do dia a dia em primeira pessoa, com o celular preso a uma faixa de cabeça. Esses vídeos viram dados de treino para robôs e modelos de IA.',
  },
  {
    question: 'Quanto a Hub Data paga por hora?',
    answer:
      'Até R$ 35 por hora aprovada em tarefas em casa (modo Residencial) e até R$ 50 por hora aprovada em atividades profissionais (modo Comercial). Só o tempo aprovado na verificação de qualidade é pago. Os valores são máximos e podem variar por tarefa.',
  },
  {
    question: 'O que é o código VEMHUB?',
    answer:
      'VEMHUB é o código de convite oficial para se cadastrar na Hub. Ao criar sua conta com o código VEMHUB, você entra com acesso ao Starter Kit grátis e participa dos sorteios exclusivos divulgados neste site.',
  },
  {
    question: 'Como recebo o pagamento?',
    answer:
      'O tempo aprovado entra no seu saldo e você saca via PIX ou transferência bancária, conforme o calendário de pagamentos semanais mostrado na sua conta.',
  },
  {
    question: 'Preciso pagar alguma coisa para participar?',
    answer:
      'Não. O cadastro é gratuito e o Starter Kit (faixa de cabeça e suporte para celular) é enviado sem custo. Você não precisa indicar amigos, assistir anúncios nem comprar nada para receber.',
  },
  {
    question: 'Preciso aparecer nos vídeos ou ter seguidores?',
    answer:
      'Não. A câmera fica na altura dos olhos e grava suas mãos e a tarefa, não o seu rosto. Os vídeos não são publicados em redes sociais, então seguidores e curtidas não importam.',
  },
  {
    question: 'Qual celular preciso para gravar?',
    answer:
      'Um smartphone Android ou iPhone com câmera traseira em bom estado, espaço livre de armazenamento e bateria carregada. Você grava pelo app Minute, disponível na App Store e no Google Play.',
  },
  {
    question: 'Posso gravar no meu trabalho?',
    answer:
      'Sim, no modo Comercial. Grave atividades profissionais reais durante o expediente, sempre com autorização do responsável pelo local. A plataforma tem mais de 100 tarefas em 14 setores, como construção, manutenção, oficina, varejo, restaurantes e limpeza.',
  },
]
