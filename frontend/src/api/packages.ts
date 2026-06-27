import { apiClient } from './client';
import type { Package } from '../types';

export const packagesApi = {
  list: () => apiClient.get<Package[]>('/packages'),

  // Admin
  create: (data: Omit<Package, 'id'>) => apiClient.post('/admin/packages', data),
  update: (id: number, data: Partial<Omit<Package, 'id'>>) =>
    apiClient.patch(`/admin/packages/${id}`, data),
  remove: (id: number) => apiClient.delete(`/admin/packages/${id}`),
};
