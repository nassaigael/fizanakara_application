import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
	baseURL: 'https://fizanakara-cotisation-app.onrender.com/api',
	headers: {
		'Content-Type': 'application/json',
	},
});
api.interceptors.request.use((config) => {
	const token = localStorage.getItem('accessToken');
	console.log("Request URL:", config.url, "Token present:", !!token);
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});
api.interceptors.response.use(
	(res) => res,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.clear();
			toast.error("Session expirée");
		}
		return Promise.reject(error);
	}
);

export default api;