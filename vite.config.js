import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa' // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
    // Add this line for GitHub Pages deployment
    base: '/your-repo-name/', // 👈 **** ADD THIS LINE ****

    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate', // Automatically update the PWA when new content is available
            injectRegister: 'auto',

            // Configuration for the manifest.json file
            manifest: {
                name: 'My Vite React PWA',
                short_name: 'ViteApp',
                description: 'My awesome Progressive Web App!',
                theme_color: '#ffffff',
                background_color: '#ffffff',
                display: 'standalone',
                scope: '/',
                start_url: '/', // This start_url might need adjustment with the 'base' property.
                icons: [
                    {
                        src: 'pwa-192x192.png', // Path to your app icon
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png', // Path to your app icon
                        sizes: '512x512',
                        type: 'image/png',
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable', // A 'maskable' icon ensures it looks good on all devices
                    }
                ],
            },
        })
    ],

    // 👇 ADD THIS SERVER CONFIGURATION FOR LOCAL DEVELOPMENT
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