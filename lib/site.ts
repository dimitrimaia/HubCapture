export const REFERRAL_CODE = 'VEMHUB'

export const SIGNUP_URL = 'https://ai.hub.xyz/r/VEMHUB'
export const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=xyz.hub.mobile&hl=pt_BR'
export const APP_STORE_URL = 'https://apps.apple.com/br/app/hub-capture/id6772285040'
export const APP_STORE_ID = '6772285040'
export const INSTAGRAM_URL = 'https://instagram.com/hubcapture'
export const HUBCAP_URL = 'https://www.mercadolivre.com.br/up/MLBU5339859880'
export const HUBCAP_IMAGE_URL = 'https://http2.mlstatic.com/D_NQ_NP_2X_974149-MLA117444981018_102026-F-bone-hubcap.webp'

export const CADASTRO_PATH = '/cadastro'
export const TUTORIAIS_PATH = '/tutoriais'

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000'

export const faqs = [
  {
    question: 'O que é o Hub Capture?',
    answer:
      'Hub Capture é o app oficial da Hub (Hub Data) para gravar tarefas em primeira pessoa com o celular e ganhar por hora aprovada. Também é chamado de Hub App. Você instala o app, grava a tarefa com o celular preso na cabeça e acompanha os pagamentos pelo painel.',
  },
  {
    question: 'Onde baixar o app Hub Capture?',
    answer:
      'O Hub Capture (Hub App) é gratuito no Google Play para Android e na App Store para iPhone. Os links oficiais de download estão no menu e no rodapé deste site.',
  },
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
      'Não. O cadastro é gratuito e o Starter Kit (faixa de cabeça e suporte para celular) é enviado sem custo. Se não quiser esperar o kit, o boné HubCap é opcional. Você não precisa indicar amigos, assistir anúncios nem comprar nada para receber.',
  },
  {
    question: 'Preciso aparecer nos vídeos ou ter seguidores?',
    answer:
      'Não. A câmera fica na altura dos olhos e grava suas mãos e a tarefa, não o seu rosto. Os vídeos não são publicados em redes sociais, então seguidores e curtidas não importam.',
  },
  {
    question: 'Qual celular preciso para gravar?',
    answer:
      'Um smartphone Android ou iPhone com câmera traseira em bom estado, espaço livre de armazenamento e bateria carregada. Você grava pelo app Hub Capture, disponível na App Store e no Google Play.',
  },
  {
    question: 'Posso gravar no meu trabalho?',
    answer:
      'Sim, no modo Comercial. Grave atividades profissionais reais durante o expediente, sempre com autorização do responsável pelo local. A plataforma tem mais de 100 tarefas em 14 setores, como construção, manutenção, oficina, varejo, restaurantes e limpeza.',
  },
]
