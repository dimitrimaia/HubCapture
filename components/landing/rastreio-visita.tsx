'use client'

import { useEffect } from 'react'
import { CHAVE_RASTREIO, type Rastreio, rastreioDaUrl, temRastreio, VALIDADE_RASTREIO_MS } from '@/lib/rastreio'

/** Guarda o rastreio da primeira visita que veio por link de divulgação (vale 30 dias). */
export function RastreioVisita() {
  useEffect(() => {
    const novo = rastreioDaUrl(new URLSearchParams(window.location.search))
    if (!temRastreio(novo)) return
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE_RASTREIO) ?? 'null') as { em: number } | null
      if (salvo && Date.now() - salvo.em < VALIDADE_RASTREIO_MS) return
      localStorage.setItem(CHAVE_RASTREIO, JSON.stringify({ ...novo, em: Date.now() }))
    } catch {}
  }, [])
  return null
}

/** Rastreio guardado (ou vazio), para mandar junto com o cadastro. */
export function lerRastreio(): Rastreio {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_RASTREIO) ?? 'null') as (Rastreio & { em: number }) | null
    if (!salvo || Date.now() - salvo.em > VALIDADE_RASTREIO_MS) return {}
    const { em: _em, ...rastreio } = salvo
    return rastreio
  } catch {
    return {}
  }
}
