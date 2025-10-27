import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            // ... your PWA settings ...
        })
    ],

    server: {
        proxy: {
            '/api': {
                // This will use your .env file: VITE_BACKEND_URL
                // Switch between local and production by editing .env file
                target: process.env.VITE_BACKEND_URL || 'http://localhost:5000',
                changeOrigin: true,
                secure: false,
            }
        }
    }
})