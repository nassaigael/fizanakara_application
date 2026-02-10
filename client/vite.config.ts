import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const backendUrl = 'https://fizanakara-application.onrender.com'

export default defineConfig({
    plugins: [react(), tailwindcss()],
    server: {
        proxy: {
            // On attrape tout ce qui commence par /api
            '/api': {
                target: backendUrl,
                changeOrigin: true,
                secure: false,
                // On s'assure que le chemin envoyé au backend contient bien /api
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