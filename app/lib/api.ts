import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para agregar token a las peticiones
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for caching GET requests
api.interceptors.response.use(
  async (response) => {
    // Only cache GET requests that are successful
    if (response.config.method?.toLowerCase() === 'get' && response.status === 200) {
      try {
        // Dynamic import to avoid SSR issues if any
        const { cacheResponse } = await import('@/app/lib/db/offlineDB');
        // Simple cache key: URL + params
        const url = response.config.url + (response.config.params ? JSON.stringify(response.config.params) : '');
        await cacheResponse(url, response.data);
      } catch (err) {
        console.warn('Failed to cache response:', err);
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!originalRequest._retry && error.message === 'Network Error') {
      originalRequest._retry = true;
      const method = originalRequest.method?.toLowerCase();

      // GET requests: try to serve from cache
      if (method === 'get') {
        try {
          console.log('Network error detected, attempting to fetch from cache...');
          const { getCachedResponse } = await import('@/app/lib/db/offlineDB');
          const url = originalRequest.url + (originalRequest.params ? JSON.stringify(originalRequest.params) : '');
          const cachedData = await getCachedResponse(url);

          if (cachedData) {
            console.log('Serving from cache:', url);
            return Promise.resolve({
              data: cachedData,
              status: 200,
              statusText: 'OK',
              headers: {},
              config: originalRequest,
              request: {}
            });
          }
        } catch (cacheErr) {
          console.error('Error fetching from cache:', cacheErr);
        }
      }

      // Mutations (POST/PUT/DELETE/PATCH): queue for later
      if (method === 'post' || method === 'put' || method === 'delete' || method === 'patch') {
        try {
          console.log('🔄 Network error on mutation, queuing operation...');
          const { addOperation } = await import('@/app/lib/db/offlineDB');

          const operationId = await addOperation(
            originalRequest.url || '',
            method.toUpperCase() as any,
            originalRequest.data
          );

          console.log('✅ Operation queued with ID:', operationId);

          // Return success response with queued flag
          return Promise.resolve({
            data: {
              success: true,
              queued: true,
              message: 'Operación guardada. Se sincronizará cuando recuperes la conexión.',
              operationId
            },
            status: 202, // Accepted
            statusText: 'Queued',
            headers: {},
            config: originalRequest,
            request: {}
          });
        } catch (queueErr) {
          console.error('❌ Error queuing operation:', queueErr);
        }
      }
    }

    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;