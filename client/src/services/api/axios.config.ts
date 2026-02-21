/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Liste des routes publiques qui ne nécessitent PAS de token
const PUBLIC_ROUTES = [
    '/login',
    // '/register',  // ❌ RETIRÉ - maintenant nécessite un token SUPERADMIN
    '/refresh',
    '/forgot-password',
    '/reset-password'
];

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: false
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    // Vérifier si l'URL est une route publique
    const isPublicRoute = PUBLIC_ROUTES.some(route => config.url?.includes(route));
    
    // N'ajouter le token que si ce n'est pas une route publique
    if (!isPublicRoute) {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('📤 Route protégée - avec token:', config.url);
    } else {
        console.log('📤 Route publique - pas de token:', config.url);
    }
    
    return config;
}, (error: unknown) => Promise.reject(error));

api.interceptors.response.use(
    (response: any) => {
        console.log('📥 Réponse:', {
            status: response.status,
            url: response.config.url,
            data: response.data
        });
        return response;
    },
    async (error: AxiosError) => {
        console.error('❌ Erreur réponse:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
            headers: error.response?.headers
        });
        
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isPublicRoute = PUBLIC_ROUTES.some(route => originalRequest.url?.includes(route));
        
        if (error.response?.status === 401 && !originalRequest._retry && !isPublicRoute) {
            originalRequest._retry = true;
            
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                const response = await api.post('/refresh', { refreshToken });
                const { accessToken } = response.data;
                
                localStorage.setItem('accessToken', accessToken);

                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                }
                
                return api(originalRequest);

            } catch (refreshError) {
                console.warn('Refresh token failed', refreshError);
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export default api;