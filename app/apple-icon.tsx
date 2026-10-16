import { ImageResponse } from 'next/og'
import { LOGO_PATH } from '@/components/landing/logo'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b120f' }}>
        <svg width="124" height="124" viewBox="0 0 32 32">
          <path d={LOGO_PATH} fill="#1ec872" stroke="#1ec872" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  )
}
