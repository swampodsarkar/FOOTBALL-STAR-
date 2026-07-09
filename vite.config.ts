import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const token = env.FOOTBALL_DATA_API_KEY

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['icons/*'],
        manifest: {
          name: 'Football Career Simulator 2026',
          short_name: 'Football Career',
          description: 'Live the life of a professional football player',
          theme_color: '#030712',
          background_color: '#030712',
          display: 'standalone',
          icons: [
            { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
            { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          ],
        },
      }),
    ],
    server: {
      proxy: {
        '/api/football': {
          target: 'https://api.football-data.org',
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/football/, ''),
          headers: { 'X-Auth-Token': token ?? '' },
        },
      },
    },
  }
})
