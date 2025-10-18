import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    // The 'base' line is now GONE. This is correct.

    plugins: [
        react(),
        VitePWA({
            // ... your PWA settings ...
        })
    ],

    // This 'server' section is PERFECT for local dev (npm run dev)
    // KEEP THIS!
    server: {
        proxy: {
            '/api': {
                target: 'http://13.60.188.141:5000',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        }
    }
})