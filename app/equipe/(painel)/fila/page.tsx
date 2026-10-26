import { obterConfig } from '@/lib/configuracoes'
import { exigirSessaoPagina } from '@/lib/equipe'
import { chamadosHoje, DIAS_ETAPA_2, DIAS_ETAPA_3, LIMITE_DIARIO_SUGERIDO, montarFila } from '@/lib/fila'
import { explicarErroBanco } from '@/lib/leads'
import { AvisoBanco } from '../aviso-banco'
import { FilaPainel } from './fila-painel'

export default async function FilaPage() {
  const sessao = await exigirSessaoPagina()
  let fila: Awaited<ReturnType<typeof montarFila>> = null
  let hoje = 0
  let erroBanco: ReturnType<typeof explicarErroBanco> | null = null
  try {
    ;[fila, hoje] = await Promise.all([montarFila(), chamadosHoje(sessao.nome)])
  } catch (error) {
    erroBanco = explicarErroBanco(error)
  }
  const modelos = await obterConfig('modelos_cadastro')

  return (
    <>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fila de chamadas</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Quem chamar agora e com qual mensagem: 1º contato, lembrete após {DIAS_ETAPA_2} dias e convite para a comunidade após mais{' '}
        {DIAS_ETAPA_3}. Toque em <strong>Abrir WhatsApp</strong>, envie e siga para o próximo.
      </p>
      {!fila ? (
        <AvisoBanco erro={erroBanco} />
      ) : (
        <FilaPainel fila={fila} modelos={modelos} atendente={sessao.nome} chamadosHoje={hoje} limiteDiario={LIMITE_DIARIO_SUGERIDO} />
      )}
    </>
  )
}
