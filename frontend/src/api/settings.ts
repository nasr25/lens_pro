import { apiClient } from './client';

export const settingsApi = {
  getTerms: () =>
    apiClient.get<{ terms: string }>('/settings/terms'),

  getPublic: () =>
    apiClient.get<Record<string, string>>('/settings/public'),

  adminGetAll: () =>
    apiClient.get<Record<string, string>>('/admin/settings'),

  adminUpdate: (key: string, value: string) =>
    apiClient.patch(`/admin/settings/${key}`, { value }),
};
