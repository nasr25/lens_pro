import { apiClient } from './client';
import type { Booking, BookingFormData, DashboardStats } from '@/types';

export const bookingsApi = {
  submit: (data: BookingFormData) =>
    apiClient.post<{ id: number; message: string }>('/bookings', data),

  adminList: (params?: { status?: string; month?: string; page?: number; limit?: number }) =>
    apiClient.get<{ bookings: Booking[]; total: number; page: number; limit: number }>(
      '/admin/bookings', { params }
    ),

  adminGet: (id: number) =>
    apiClient.get<Booking>(`/admin/bookings/${id}`),

  adminConfirm: (id: number) =>
    apiClient.patch(`/admin/bookings/${id}/confirm`),

  adminReject: (id: number, rejection_reason: string) =>
    apiClient.patch(`/admin/bookings/${id}/reject`, { rejection_reason }),

  adminDelete: (id: number) =>
    apiClient.delete(`/admin/bookings/${id}`),

  stats: () =>
    apiClient.get<DashboardStats>('/admin/bookings/stats'),
};
