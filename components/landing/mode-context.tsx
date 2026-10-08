'use client'

import { createContext, useContext, useState } from 'react'

export type Mode = 'trabalho' | 'casa'

type ModeContextValue = {
  mode: Mode
  setMode: (mode: Mode) => void
}

const ModeContext = createContext<ModeContextValue | null>(null)

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>('trabalho')

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      <div
        data-mode={mode}
        className="relative min-h-screen overflow-x-clip bg-background text-foreground transition-colors duration-500"
      >
        {children}
      </div>
    </ModeContext.Provider>
  )
}

export function useMode() {
  const context = useContext(ModeContext)
  if (!context) throw new Error('useMode must be used within ModeProvider')
  return context
}

export function ModeSwitch({ trabalho, casa }: { trabalho: React.ReactNode; casa: React.ReactNode }) {
  const { mode } = useMode()
  return <>{mode === 'casa' ? casa : trabalho}</>
}
