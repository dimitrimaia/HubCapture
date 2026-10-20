import { CONFIAVEL_PATH, GUIA_PATH, QUANTO_PAGA_PATH } from './site'

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
    title: 'Hub Data: quanto paga?',
    summary: 'Valores por hora aprovada, categorias, calendário e formas de pagamento.',
    cta: 'Entender os valores',
  },
  {
    href: CONFIAVEL_PATH,
    tag: 'Confiança',
    title: 'Hub Data é confiável?',
    summary: 'Quem é a Hub, o que acontece com os vídeos, privacidade e como evitar golpes.',
    cta: 'Ver a análise',
  },
]
