import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#05080f',
        card: '#0c1220',
        card2: '#121a2b',
        line: '#1c2740',
        muted: '#7d8aa5',
        neon: {
          DEFAULT: '#2cf58a',
          dim: '#1fb866',
        },
        volt: '#c6ff3d',
        violet: '#8b5cf6',
        gold: '#fbbf24',
        danger: '#f43f5e',
      },
      fontFamily: {
        sans: ['var(--font-rubik)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        neon: '0 0 24px -4px rgba(44, 245, 138, 0.55)',
        gold: '0 0 28px -6px rgba(251, 191, 36, 0.6)',
        violet: '0 0 24px -6px rgba(139, 92, 246, 0.6)',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2.8s ease-in-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
