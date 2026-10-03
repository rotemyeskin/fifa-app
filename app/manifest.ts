import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ליגת הפיפא',
    short_name: 'ליגת הפיפא',
    description: 'מעקב משחקי FIFA, טבלאות וסטטיסטיקות',
    start_url: '/',
    display: 'standalone',
    dir: 'rtl',
    lang: 'he',
    background_color: '#05080f',
    theme_color: '#05080f',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  }
}
