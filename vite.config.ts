import { defineConfig }    from 'vite'
import react               from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { VitePWA }         from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/*.png'],
      manifest: {
        name:             'NIDA — Gələcəyə Səsləniş',
        short_name:       'NIDA',
        description:      'Azərbaycan şagirdlərinin universitetə qəbul hazırlıq platforması',
        theme_color:      '#0F1923',
        background_color: '#0F1923',
        display:          'standalone',
        orientation:      'portrait',
        scope:            '/',
        start_url:        '/login',
        lang:             'az',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories:  ['education'],
        screenshots: [],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler:    'CacheFirst',
            options:    {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler:    'CacheFirst',
            options:    {
              cacheName: 'gstatic-fonts-cache',
              expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com\/.*/i,
            handler:    'NetworkFirst',
            options:    {
              cacheName: 'firestore-cache',
              networkTimeoutSeconds: 3,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
            },
          },
          {
            urlPattern: /^https:\/\/.*\.googleapis\.com\/identitytoolkit\/.*/i,
            handler:    'NetworkFirst',
            options:    { cacheName: 'firebase-auth', networkTimeoutSeconds: 5 },
          },
          {
            urlPattern: /\.(js|css|woff2)$/,
            handler:    'StaleWhileRevalidate',
            options:    { cacheName: 'static-assets', expiration: { maxEntries: 100 } },
          },
          {
            urlPattern: /\.(png|svg|jpg|webp|ico)$/,
            handler:    'CacheFirst',
            options:    {
              cacheName: 'image-cache',
              expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react-hot-toast': fileURLToPath(new URL('./src/lib/toast-shim.tsx', import.meta.url)),
    },
  },
})
