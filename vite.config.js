import process from 'node:process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        // 배포된 백엔드로 붙이려면: API_PROXY_TARGET=https://<광고 대시보드 도메인> (VITE_API_BASE_URL 은 비워 둔다)
        target: process.env.API_PROXY_TARGET || 'http://localhost:8080',
        changeOrigin: true,
        // 프록시는 같은 출처 요청이므로 브라우저 Origin(localhost)을 빼서 백엔드 CORS 거절(403)을 피한다
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => proxyReq.removeHeader('origin'))
        },
      },
    },
  },
})
