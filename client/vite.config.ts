import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = 'http://localhost:3001';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            // only forward calls targeting the API namespace
            // we avoid proxying `/login`, `/forgot-password`, etc. because
            // those are client-side routes and must return index.html.
            '/api': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
                rewrite: (path) => path.startsWith('/api') ? path : `/api${path}`,
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq) => {
                        proxyReq.setHeader('Origin', backendUrl);
                    });
                }
            }
        }
    }
})