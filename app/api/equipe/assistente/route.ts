import { testarAssistente, variavelDaChave } from '@/lib/assistente'
import { exigirSessaoApi } from '@/lib/equipe'

export const maxDuration = 60

/** Testa o Gemini com a configuração desta implantação e devolve o erro real do Google (só para a equipe). */
export async function POST(request: Request) {
  const sessao = await exigirSessaoApi(request, 'admin')
  if (!sessao) return Response.json({ ok: false }, { status: 401 })

  const resultado = await testarAssistente()
  return Response.json({ ...resultado, variavel: variavelDaChave() })
}
