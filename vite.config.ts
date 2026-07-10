import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_KEY = 'f501f01ef13346538118ac31dcb0d18c';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api/football': {
        target: 'https://api.football-data.org',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/football/, ''),
        headers: { 'X-Auth-Token': API_KEY },
      },
    },
  },
})
