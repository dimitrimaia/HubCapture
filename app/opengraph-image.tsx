import { ImageResponse } from 'next/og'
import { LOGO_PATH } from '@/components/landing/logo'

export const alt = 'Hub Capture — ganhe dinheiro gravando vídeos com o celular. Código VEMHUB'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'radial-gradient(circle at 15% 0%, #12402a 0%, #0b120f 55%)',
          color: '#eef6f1',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <svg width="72" height="72" viewBox="0 0 32 32">
            <path d={LOGO_PATH} fill="#1ec872" stroke="#1ec872" strokeWidth="2" strokeLinejoin="round" />
          </svg>
          <div style={{ display: 'flex', fontSize: 44, fontWeight: 700 }}>
            Hub <span style={{ color: '#1ec872', marginLeft: 12 }}>Capture</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', fontSize: 72, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>
            Filmou, ganhou.
          </div>
          <div style={{ display: 'flex', fontSize: 38, color: '#a9bdb2', maxWidth: 950 }}>
            Ganhe até R$ 50/h gravando vídeos com o celular no Hub App da Hub Data.
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 30 }}>
          <div style={{ display: 'flex', padding: '12px 24px', borderRadius: 999, background: '#1ec872', color: '#0b120f', fontWeight: 700 }}>
            Código VEMHUB
          </div>
          <div style={{ display: 'flex', color: '#a9bdb2' }}>Cadastro grátis · Saque via PIX</div>
        </div>
      </div>
    ),
    size,
  )
}
