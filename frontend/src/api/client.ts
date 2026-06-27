import axios from 'axios';
import { useAdminStore } from '@/stores/admin';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

// Attach CSRF token and Bearer token on every mutating request
apiClient.interceptors.request.use(config => {
  const method = config.method?.toLowerCase() ?? '';
  if (['post', 'patch', 'put', 'delete'].includes(method)) {
    const csrf = getCookie('csrf-token');
    if (csrf) config.headers['X-CSRF-Token'] = csrf;
  }

  try {
    const admin = useAdminStore();
    if (admin.accessToken) {
      config.headers['Authorization'] = `Bearer ${admin.accessToken}`;
    }
  } catch { /* store not ready yet */ }

  return config;
});

// Auto-logout on 401 (token expired)
apiClient.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401 && err.config?.url?.includes('/admin/')) {
      try {
        const admin = useAdminStore();
        await admin.logout();
      } catch { /* ignore */ }
    }
    return Promise.reject(err);
  }
);
