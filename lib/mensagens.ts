import { REFERRAL_CODE, SIGNUP_URL, SITE_URL, TUTORIAIS_PATH, WHATSAPP_COMMUNITY_URL } from './site'

/**
 * Mensagens prontas para a equipe chamar pelo WhatsApp (wa.me, envio manual e grátis).
 * Editáveis em /equipe/mensagens; estes são os textos padrão.
 * Marcadores: {nome} {atendente} {cadastro} {comunidade} {tutoriais} {codigo}
 */
export type ModeloMensagem = { id: string; rotulo: string; texto: string }

export const MARCADORES = ['{nome}', '{atendente}', '{cadastro}', '{comunidade}', '{tutoriais}', '{codigo}']

/** A fila de chamadas usa os 3 primeiros, na ordem: 1º contato, 2º contato, 3º contato. */
export const MODELOS_CADASTRO_PADRAO: ModeloMensagem[] = [
  {
    id: 'boas-vindas',
    rotulo: 'Boas-vindas',
    texto:
      'Oi, {nome}! Aqui é {atendente}, do Hub Capture 👋 Vi que você se cadastrou no site. Quer ajuda para criar sua conta com o código {codigo}? É por aqui: {cadastro}',
  },
  {
    id: 'lembrete',
    rotulo: 'Lembrete do cadastro',
    texto:
      'Oi, {nome}! {atendente} do Hub Capture aqui. Passando para lembrar que falta só criar sua conta com o código {codigo} para começar a gravar: {cadastro} Ficou alguma dúvida? Me responde aqui 🙂',
  },
  {
    id: 'comunidade',
    rotulo: 'Convite para a comunidade',
    texto:
      'Oi, {nome}! Aqui é {atendente}, do Hub Capture. Temos uma comunidade no WhatsApp com dicas para ter os vídeos aprovados e suporte direto. Entra com a gente: {comunidade}',
  },
]

export const MODELOS_COLAB_PADRAO: ModeloMensagem[] = [
  {
    id: 'colab-contato',
    rotulo: 'Primeiro contato',
    texto:
      'Oi, {nome}! Aqui é {atendente}, do Hub Capture 👋 Recebi sua inscrição para a Colab com Influencers. Podemos conversar sobre a parceria para divulgar o código {codigo}?',
  },
  {
    id: 'colab-retorno',
    rotulo: 'Retomar conversa',
    texto: 'Oi, {nome}! {atendente} do Hub Capture de novo. Ainda tem interesse na parceria? Posso te mandar os detalhes por aqui.',
  },
]

export function primeiroNome(nome: string) {
  const primeiro = nome.trim().split(/\s+/)[0] ?? ''
  return primeiro.charAt(0).toUpperCase() + primeiro.slice(1).toLowerCase()
}

/** Troca os marcadores pelos valores (nome já reduzido ao primeiro nome). */
export function preencherMensagem(texto: string, dados: { nome: string; atendente: string }) {
  const valores: Record<string, string> = {
    '{nome}': primeiroNome(dados.nome),
    '{atendente}': dados.atendente,
    '{cadastro}': SIGNUP_URL,
    '{comunidade}': WHATSAPP_COMMUNITY_URL,
    '{tutoriais}': `${SITE_URL}${TUTORIAIS_PATH}`,
    '{codigo}': REFERRAL_CODE,
  }
  return texto.replace(/\{(nome|atendente|cadastro|comunidade|tutoriais|codigo)\}/g, (marcador) => valores[marcador] ?? marcador)
}

/** Valida uma lista de modelos vinda do editor do painel. */
export function validarModelos(entrada: unknown): ModeloMensagem[] | null {
  if (!Array.isArray(entrada) || entrada.length === 0 || entrada.length > 12) return null
  const modelos = entrada.map((item, i) => ({
    id: String(item?.id || `modelo-${i + 1}`).replace(/[^a-z0-9-]/gi, '').slice(0, 40) || `modelo-${i + 1}`,
    rotulo: String(item?.rotulo ?? '').trim().slice(0, 40),
    texto: String(item?.texto ?? '').trim().slice(0, 1000),
  }))
  if (modelos.some((m) => !m.rotulo || m.texto.length < 10)) return null
  if (new Set(modelos.map((m) => m.id)).size !== modelos.length) return null
  return modelos
}
