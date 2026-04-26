import axios from 'axios';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const { refreshToken, setAuth, clearAuth, user } = useAuthStore.getState();

      if (!refreshToken) {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data.data;
        setAuth(user!, accessToken, newRefreshToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch {
        clearAuth();
        window.location.href = '/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);