import { PAGINAS_TRADUZIDAS } from './i18n'
import { CONFIAVEL_PATH, GUIA_PATH, HUB_ROBOTICS_PATH, QUANTO_PAGA_PATH, TREINAR_IA_PATH } from './site'

export const guides = [
  {
    href: GUIA_PATH,
    tag: 'Hub Capture',
    title: 'Hub Capture: como funciona?',
    summary: 'Aplicativo, tarefas no Hub Capture e no Minute, celulares e requisitos para participar.',
    cta: 'Ler o guia',
  },
  {
    href: QUANTO_PAGA_PATH,
    tag: 'Pagamentos',
    title: 'Quanto a Hub paga?',
    summary: 'Valores por hora aprovada, categorias, calendário e formas de pagamento.',
    cta: 'Entender os valores',
  },
  {
    href: TREINAR_IA_PATH,
    tag: 'Renda extra',
    title: 'Ganhar dinheiro treinando IA',
    summary: 'Por que pagam para treinar robôs, como funciona pelo celular e quanto dá para ganhar.',
    cta: 'Entender como funciona',
  },
  {
    href: CONFIAVEL_PATH,
    tag: 'Confiança',
    title: 'Hub Data é confiável?',
    summary: 'Quem é a Hub, o que acontece com os vídeos, privacidade e como evitar golpes.',
    cta: 'Ver a análise',
  },
  {
    href: HUB_ROBOTICS_PATH,
    tag: 'A empresa',
    title: 'Hub Robotics: o que é?',
    summary: 'A empresa por trás do Hub Capture, o que ela faz com os vídeos e como participar.',
    cta: 'Conhecer a Hub',
  },
  {
    href: PAGINAS_TRADUZIDAS.convide.pt,
    tag: 'Indicação',
    title: 'Convide e Ganhe – Hub Data',
    summary: 'Como funciona a indicação, onde fica seu link de convite e como divulgar do jeito certo.',
    cta: 'Ver como funciona',
  },
]
