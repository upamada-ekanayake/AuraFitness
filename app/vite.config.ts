import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      manifest: false,
      includeAssets: [
        'favicon.svg',
        'icons.svg',
        'offline.html',
        'icons/icon-192.png',
        'icons/icon-512.png',
        'icons/maskable-icon-192.png',
        'icons/maskable-icon-512.png',
        'icons/apple-touch-icon.png',
      ],
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/auth\/v1\//, /^\/rest\/v1\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.hostname.endsWith('supabase.co'),
            handler: 'NetworkOnly',
            options: {
              cacheName: 'aurafitness-supabase-network-only',
            },
          },
        ],
      },
    }),
  ],
})
