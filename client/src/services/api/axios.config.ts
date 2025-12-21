/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// backend base url can be configured via Vite environment variable
// Vite exposes variables that start with VITE_ at import.meta.env
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const api = axios.create({
    baseURL: BASE_URL,
    timeout:10000,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

api.interceptors.request.use((config:InternalAxiosRequestConfig) =>
    {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log('Requête:', config.method?.toUpperCase(), config.url, config.headers); // Debug
        return config;
    },
    (error:unknown) => Promise.reject(error)
);

api.interceptors.response.use(
    (response:any) => response,
    async (error: AxiosError) => {
        console.error('Erreur réponse:', error.response?.status, error.config?.url); // Debug
        const originalRequest = error.config as InternalAxiosRequestConfig & {_retry? : boolean};

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refreshToken');
                const response = await api.post('/refresh', {refreshToken})
                const {accessToken} = response.data;
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
                return Promise.reject(refreshError)
            }
        }
        return Promise.reject(error);
    }
);

export default api;