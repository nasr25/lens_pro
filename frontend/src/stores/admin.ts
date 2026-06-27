import { defineStore } from 'pinia';
import { ref } from 'vue';
import { apiClient } from '@/api/client';
import { useRouter } from 'vue-router';

export const useAdminStore = defineStore('admin', () => {
  const accessToken = ref<string | null>(null);
  const username    = ref<string | null>(null);
  const isLoggedIn  = ref(false);

  async function login(u: string, password: string): Promise<void> {
    const res = await apiClient.post<{ accessToken: string; username: string; csrfToken: string }>(
      '/admin/auth/login',
      { username: u, password }
    );
    accessToken.value = res.data.accessToken;
    username.value    = res.data.username;
    isLoggedIn.value  = true;
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.post('/admin/auth/logout');
    } catch { /* ignore errors on logout */ }
    accessToken.value = null;
    username.value    = null;
    isLoggedIn.value  = false;
  }

  async function tryRefresh(): Promise<boolean> {
    try {
      const res = await apiClient.post<{ accessToken: string; csrfToken: string }>(
        '/admin/auth/refresh'
      );
      accessToken.value = res.data.accessToken;
      isLoggedIn.value  = true;
      return true;
    } catch {
      return false;
    }
  }

  return { accessToken, username, isLoggedIn, login, logout, tryRefresh };
});
