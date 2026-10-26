import { registrarAuditoria } from '@/lib/auditoria'
import { todosColabsFiltrados } from '@/lib/colabs'
import { exigirSessaoApi, exportacaoLiberada } from '@/lib/equipe'
import { lerFiltrosLeads, todosLeadsFiltrados } from '@/lib/leads'
import { formatE164 } from '@/lib/phone'

/** Excel em português abre CSV com ";" e precisa do BOM para acentos. Datas no horário de Brasília. */
function csv(linhas: (string | number | null | undefined)[][]) {
  const celula = (valor: string | number | null | undefined) => {
    const texto = String(valor ?? '')
    // Evita fórmulas maliciosas ao abrir no Excel (=, +, -, @ no início).
    const seguro = /^[=+\-@]/.test(texto) ? `'${texto}` : texto
    return /[";\n]/.test(seguro) ? `"${seguro.replace(/"/g, '""')}"` : seguro
  }
  return '﻿' + linhas.map((linha) => linha.map(celula).join(';')).join('\r\n')
}

function data(valor: Date | null) {
  return valor ? valor.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' }) : ''
}

/** Só admin. ?tipo=cadastros (com os mesmos filtros da tabela) ou ?tipo=colab. */
export async function GET(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return new Response('Não autorizado', { status: 401 })
  // Dados pessoais: exige ter confirmado a senha nos últimos 10 minutos (/api/equipe/exportar/liberar).
  if (!(await exportacaoLiberada(sessao))) return new Response('Confirme sua senha para exportar.', { status: 403 })
  const url = new URL(request.url)
  const tipo = url.searchParams.get('tipo') === 'colab' ? 'colab' : 'cadastros'
  const hoje = new Date().toISOString().slice(0, 10)

  let conteudo: string
  if (tipo === 'colab') {
    const lista = (await todosColabsFiltrados({ status: url.searchParams.get('status') ?? undefined, busca: url.searchParams.get('q') ?? undefined })) ?? []
    conteudo = csv([
      ['Nome', 'Perfil', 'Seguidores', 'E-mail', 'WhatsApp', 'Status', 'Observação', 'Origem', 'Inscrito em', 'Chamado em', 'Chamado por'],
      ...lista.map((c) => [c.nome, c.perfil, c.seguidores, c.email, formatE164(c.whatsapp), c.status, c.observacao, c.origem, data(c.criadoEm), data(c.chamadoEm), c.chamadoPor]),
    ])
  } else {
    const filtros = lerFiltrosLeads(Object.fromEntries(url.searchParams))
    const lista = (await todosLeadsFiltrados(filtros)) ?? []
    conteudo = csv([
      ['Nome', 'WhatsApp', 'Cadastro em', 'Origem', 'Último botão', 'Chamadas', 'Último contato', 'Chamado por', 'Respondeu no WhatsApp', 'Aceitou mensagens', 'Convertido em', 'Número inválido', 'Pediu para sair', 'Etiquetas', 'Nota', 'utm_source', 'utm_medium', 'utm_campaign', 'ref'],
      ...lista.map((l) => [
        l.nome,
        formatE164(l.whatsapp),
        data(l.criadoEm),
        l.origem,
        l.ultimaAcao,
        l.chamadas,
        data(l.chamadoEm),
        l.chamadoPor,
        data(l.respondeuWhatsappEm),
        l.consentimentoWhatsapp ? 'sim' : 'não',
        data(l.convertidoEm),
        data(l.numeroInvalidoEm),
        data(l.optOutEm),
        l.etiquetas.join(', '),
        l.nota,
        l.utmSource,
        l.utmMedium,
        l.utmCampaign,
        l.ref,
      ]),
    ])
  }
  await registrarAuditoria('exportacao', sessao, { detalhe: tipo })
  return new Response(conteudo, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hubcapture-${tipo}-${hoje}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
