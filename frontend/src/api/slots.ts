import { apiClient } from './client';
import type { SlotCalendarEntry } from '@/types';

export const slotsApi = {
  getCalendar: (month: string) =>
    apiClient.get<SlotCalendarEntry[]>('/slots', { params: { month } }),

  adminList: (month?: string) =>
    apiClient.get<SlotCalendarEntry[]>('/admin/slots', { params: month ? { month } : {} }),

  adminCreate: (data: { dates: string[]; times?: string[]; status?: string; label?: string }) =>
    apiClient.post('/admin/slots', data),

  adminUpdate: (id: number, status: 'available' | 'blocked') =>
    apiClient.patch(`/admin/slots/${id}`, { status }),

  adminDelete: (id: number) =>
    apiClient.delete(`/admin/slots/${id}`),
};
