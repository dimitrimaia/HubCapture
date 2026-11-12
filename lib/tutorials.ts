/**
 * Passos da página /tutoriais.
 *
 * COMO COLOCAR OS VÍDEOS (preencha um dos dois campos em cada passo):
 *
 * 1) YouTube (recomendado: não pesa o site)
 *    - Suba o vídeo no YouTube como "Não listado" (ou público, que ajuda no SEO).
 *    - Copie o ID: em https://www.youtube.com/watch?v=dQw4w9WgXcQ o ID é 'dQw4w9WgXcQ'
 *      (em links youtu.be/XXXX ou /shorts/XXXX, o ID é o XXXX).
 *    - Cole em youtubeId: 'dQw4w9WgXcQ'
 *
 * 2) Vídeo próprio sem anúncios (MP4)
 *    - Suba o MP4 no Vercel Blob (Vercel → Storage → Blob) e copie a URL pública.
 *    - Cole em videoUrl: 'https://....public.blob.vercel-storage.com/passo-1.mp4'
 *
 * Sem nenhum dos dois, o passo mostra "Vídeo em breve".
 */
export type TutorialStep = {
  title: string
  description: string
  youtubeId?: string
  videoUrl?: string
}

export const tutorialSteps: TutorialStep[] = [
  {
    title: 'Crie sua conta com o código VEMHUB',
    description:
      'Abra a página de cadastro do Hub Capture e crie sua conta com nome, e-mail e senha. O código de convite VEMHUB já vem aplicado pelo link oficial — confira se ele aparece antes de concluir. Guarde o e-mail que você usou: ele será o mesmo no Minute.',
    youtubeId: '',
  },
  {
    title: 'Peça o Starter Kit ou o Suporte HubCap',
    description:
      'Solicite o Starter Kit no seu painel: ele é grátis, mas pode demorar a chegar. Se preferir, adquira o Suporte HubCap (boné com suporte para celular), que chega bem mais rápido, é mais confortável e estável — garantindo vídeos de melhor qualidade e maior aprovação.',
    youtubeId: '',
  },
  {
    title: 'Baixe o app Hub Capture e conheça o painel',
    description:
      'Instale o Hub Capture no Google Play ou na App Store (ou use o painel pelo navegador em app.hub.xyz) e entre com sua conta. Em "Gravar e ganhar" você encontra as tarefas do Hub Capture e acompanha horas gravadas, aprovações e qualidade.',
    youtubeId: '',
  },
  {
    title: 'Libere as tarefas extras no Minute',
    description:
      'O Minute é um segundo app com mais tarefas pagas. No painel, em "Gravar e ganhar" → "Vincule sua conta do Minute", copie o e-mail e o código de convite pessoal que aparecem ali. Baixe o Minute pelos botões do próprio painel e entre (ou cadastre-se uma única vez) com esse mesmo e-mail e código. Não crie uma segunda conta. A vinculação aparece em até ~20 minutos após sua primeira gravação.',
    youtubeId: '',
  },
  {
    title: 'Posicione o celular corretamente',
    description:
      'Prenda o celular na altura dos olhos, na horizontal e inclinado cerca de 45° para baixo. Suas mãos precisam aparecer no centro do quadro, com boa iluminação. Vale para as tarefas dos dois apps.',
    youtubeId: '',
  },
  {
    title: 'Grave a tarefa e envie para análise',
    description:
      'Escolha uma tarefa no Hub Capture ou no Minute (Casa/Residencial ou Trabalho/Comercial), toque em gravar e faça a atividade do começo ao fim, em ritmo natural. Ao terminar, envie o vídeo para a verificação de qualidade da Hub Data.',
    youtubeId: '',
  },
  {
    title: 'Acompanhe aprovações, indicações e saque via PIX',
    description:
      'As horas aprovadas dos dois apps aparecem no saldo do painel. Na aba Indicações você acompanha quem entrou pelo seu convite. Os pagamentos são semanais, via PIX ou transferência bancária.',
    youtubeId: '',
  },
]
