import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** iPhone home-screen icon, drawn from the same shapes as app/icon.svg. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#05080f',
        }}
      >
        <svg viewBox="0 0 64 64" width="150" height="150">
          <path
            d="M32 3 L56 11 V30 C56 46 45 56 32 61 C19 56 8 46 8 30 V11 Z"
            fill="#111a2e"
            stroke="#2cf58a"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="31" r="13" fill="none" stroke="#ffffff" strokeWidth="2.5" />
          <polygon points="32,26 36.76,29.45 34.94,35.05 29.06,35.05 27.24,29.45" fill="#2cf58a" />
          <line x1="32" y1="26" x2="32" y2="18" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="36.76" y1="29.45" x2="44.36" y2="26.98" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="34.94" y1="35.05" x2="39.64" y2="41.52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="29.06" y1="35.05" x2="24.36" y2="41.52" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <line x1="27.24" y1="29.45" x2="19.64" y2="26.98" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="51" r="1.6" fill="#fbbf24" />
          <circle cx="32" cy="53" r="1.6" fill="#fbbf24" />
          <circle cx="40" cy="51" r="1.6" fill="#fbbf24" />
        </svg>
      </div>
    ),
    size,
  )
}
