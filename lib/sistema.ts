import 'server-only'
import { sql } from 'drizzle-orm'
import { getDb } from '@/db'
import { explicarErroBanco } from './leads'

/** Variáveis que o sistema usa. A página mostra só SE existem, nunca o valor. */
export const VARIAVEIS = [
  { nome: 'DATABASE_URL', para: 'Banco (painel, leads, colab)', obrigatoria: true },
  { nome: 'EQUIPE_SENHA', para: 'Chave de instalação e assinatura das sessões', obrigatoria: true },
  { nome: 'GEMINI_API_KEY', para: 'Assistente do chat e do WhatsApp', obrigatoria: true },
  { nome: 'CADASTRO_WEBHOOK_URL', para: 'Planilha de usuários (ou COLAB_WEBHOOK_URL)', alternativa: 'COLAB_WEBHOOK_URL' },
  { nome: 'PLANILHA_LEITURA_TOKEN', para: 'Importar da planilha de usuários' },
  { nome: 'INFLUENCER_WEBHOOK_URL', para: 'Planilha de influencers' },
  { nome: 'INFLUENCER_LEITURA_TOKEN', para: 'Importar da planilha de influencers (opcional)' },
  { nome: 'NEXT_PUBLIC_WHATSAPP_ATENDIMENTO', para: 'Botão "Tirar dúvidas no WhatsApp"' },
  { nome: 'WHATSAPP_TOKEN', para: 'Atendimento automático (Meta)' },
  { nome: 'WHATSAPP_PHONE_NUMBER_ID', para: 'Atendimento automático (Meta)' },
  { nome: 'WHATSAPP_APP_SECRET', para: 'Atendimento automático (Meta)' },
  { nome: 'WHATSAPP_VERIFY_TOKEN', para: 'Verificação do webhook (Meta)' },
  { nome: 'CRON_SECRET', para: 'Agendador dos lembretes automáticos' },
  { nome: 'LEMBRETES_WHATSAPP', para: '"ligado" ativa os lembretes pagos' },
  { nome: 'WHATSAPP_MODELO_LEMBRETE_1', para: 'Modelo aprovado do 1º lembrete' },
  { nome: 'WHATSAPP_MODELO_LEMBRETE_2', para: 'Modelo aprovado do 2º lembrete' },
  { nome: 'RESEND_API_KEY', para: 'Alerta de erro por e-mail (Resend, grátis)' },
  { nome: 'ALERTA_EMAIL', para: 'E-mail que recebe os alertas' },
] as const

export function estadoVariaveis() {
  return VARIAVEIS.map((v) => ({
    nome: v.nome,
    para: v.para,
    obrigatoria: 'obrigatoria' in v && v.obrigatoria,
    definida: Boolean(process.env[v.nome]?.trim()) || ('alternativa' in v && Boolean(process.env[v.alternativa]?.trim())),
  }))
}

export async function statusBanco() {
  const db = getDb()
  if (!db) return { ok: false as const, configurado: false }
  const inicio = Date.now()
  try {
    const [linha] = await db.execute<{ leads: number; colabs: number; usuarios: number; erros24h: number }>(sql`
      select
        (select count(*)::int from leads) as leads,
        (select count(*)::int from colabs) as colabs,
        (select count(*)::int from usuarios_equipe) as usuarios,
        (select count(*)::int from erros_sistema where criado_em > now() - interval '24 hours') as "erros24h"
    `)
    return { ok: true as const, ms: Date.now() - inicio, ...linha }
  } catch (error) {
    return { ok: false as const, configurado: true, erro: explicarErroBanco(error) }
  }
}

/** Confere o token e o número na API da Meta (sem enviar mensagem). */
export async function testarWhatsapp() {
  const { WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID } = process.env
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) return { ok: false, erro: 'WHATSAPP_TOKEN e WHATSAPP_PHONE_NUMBER_ID não configurados.' }
  const versao = process.env.WHATSAPP_API_VERSION || 'v23.0'
  const base = process.env.WHATSAPP_API_BASE || 'https://graph.facebook.com'
  try {
    const resposta = await fetch(`${base}/${versao}/${WHATSAPP_PHONE_NUMBER_ID}?fields=display_phone_number,verified_name,quality_rating`, {
      headers: { Authorization: `Bearer ${WHATSAPP_TOKEN}` },
      cache: 'no-store',
      signal: AbortSignal.timeout(10000),
    })
    const dados = await resposta.json().catch(() => null)
    if (!resposta.ok) return { ok: false, erro: String(dados?.error?.message ?? `Erro ${resposta.status}`) }
    return { ok: true, numero: dados.display_phone_number, nome: dados.verified_name, qualidade: dados.quality_rating }
  } catch (error) {
    return { ok: false, erro: String(error).slice(0, 200) }
  }
}
