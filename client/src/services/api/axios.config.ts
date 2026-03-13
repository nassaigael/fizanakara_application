/// <reference types="vite/client" />
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

const PUBLIC_ROUTES = [
    '/login',
    '/refresh',
    '/forgot-password',
    '/reset-password',
];

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: false,
});

api.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const isPublicRoute = PUBLIC_ROUTES.some((route) => config.url?.includes(route));

        if (!isPublicRoute) {
            const token = localStorage.getItem('accessToken');
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error: unknown) => Promise.reject(error),
);

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
        const isPublicRoute = PUBLIC_ROUTES.some((route) => originalRequest.url?.includes(route));

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
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    },
);

export default api;