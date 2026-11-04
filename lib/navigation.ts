import { PAGINAS_TRADUZIDAS } from './i18n'
import { CONFIAVEL_PATH, GUIA_PATH, HUB_ROBOTICS_PATH, QUANTO_PAGA_PATH, TREINAR_IA_PATH, TUTORIAIS_PATH } from './site'

/** Atalhos para as seções da página inicial (menu do celular e rodapé). */
export const sectionLinks = [
  { href: '/#como-funciona', label: 'Como funciona' },
  { href: '/#codigo-vemhub', label: 'Código VEMHUB' },
  { href: '/#colab', label: 'Influencers' },
  { href: '/#comunidade', label: 'Comunidade' },
  { href: '/#tutorial', label: 'Tutorial' },
  { href: '/#modos', label: 'Ganhos' },
  { href: '/#guias', label: 'Guias' },
  { href: '/#faq', label: 'FAQ' },
]

/**
 * Cabeçalho: as páginas que mais trazem visitas e conversão ficam visíveis em todas as páginas.
 * Links no cabeçalho dizem ao Google quais páginas do site são as mais importantes.
 */
export const headerLinks = [
  { href: QUANTO_PAGA_PATH, label: 'Quanto paga' },
  { href: TUTORIAIS_PATH, label: 'Tutoriais' },
  { href: PAGINAS_TRADUZIDAS.convide.pt, label: 'Convide e Ganhe' },
]

/** Menu "Guias" do cabeçalho. */
export const guiaLinks = [
  { href: GUIA_PATH, label: 'Hub Capture App', resumo: 'Como funciona, download e cadastro' },
  { href: TREINAR_IA_PATH, label: 'Ganhar dinheiro treinando IA', resumo: 'Renda extra treinando robôs pelo celular' },
  { href: HUB_ROBOTICS_PATH, label: 'Hub Robotics', resumo: 'A empresa por trás do Hub Capture' },
  { href: CONFIAVEL_PATH, label: 'Hub Data é confiável?', resumo: 'Privacidade, pagamentos e cuidados' },
]
