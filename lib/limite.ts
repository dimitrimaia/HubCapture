/**
 * Limite de uso por chave (ex.: IP) numa janela de tempo, em memória da instância.
 * Sem banco: cada instância da Vercel conta separado, o que basta para conter abuso no nível gratuito.
 */
export function criarLimite({ maximo, janelaMs }: { maximo: number; janelaMs: number }) {
  const registros = new Map<string, number[]>()

  return function permitir(chave: string) {
    const agora = Date.now()
    const recentes = (registros.get(chave) ?? []).filter((t) => agora - t < janelaMs)
    if (recentes.length >= maximo) {
      registros.set(chave, recentes)
      return false
    }
    recentes.push(agora)
    registros.set(chave, recentes)
    // Limpeza ocasional para o mapa não crescer sem fim.
    if (registros.size > 5000) {
      for (const [k, v] of registros) if (!v.some((t) => agora - t < janelaMs)) registros.delete(k)
    }
    return true
  }
}
