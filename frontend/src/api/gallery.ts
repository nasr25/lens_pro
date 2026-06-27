import { apiClient } from './client';
import type { GalleryPhoto } from '../types';

export const galleryApi = {
  list: () => apiClient.get<GalleryPhoto[]>('/gallery'),

  // Admin
  add:    (url: string, caption_ar?: string, caption_en?: string) =>
    apiClient.post('/admin/gallery', { url, caption_ar, caption_en }),
  remove: (id: number) => apiClient.delete(`/admin/gallery/${id}`),
  reorder:(ids: number[]) => apiClient.post('/admin/gallery/reorder', { ids }),
};
