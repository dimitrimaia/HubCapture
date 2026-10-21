/** IP de quem fez o pedido (atrás da Vercel o primeiro valor de x-forwarded-for é o do visitante). */
export function ipDoPedido(headers: Headers) {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() || headers.get('x-real-ip') || 'desconhecido'
}
