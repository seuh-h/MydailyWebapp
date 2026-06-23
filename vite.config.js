import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/MydailyWebapp/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['diary-icon.svg'],
      manifest: {
        name: '내 감정 일기장',
        short_name: '감정일기',
        description: 'AI가 감정을 분석해주는 하루 한 줄 일기장',
        theme_color: '#6c63ff',
        background_color: '#f8f7ff',
        display: 'standalone',
        icons: [
          {
            src: 'diary-icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
});
