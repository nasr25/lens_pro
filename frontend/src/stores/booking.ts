import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { SlotCalendarEntry } from '@/types';
import { slotsApi } from '@/api/slots';

export const useBookingStore = defineStore('booking', () => {
  const slots         = ref<SlotCalendarEntry[]>([]);
  const selectedSlot  = ref<SlotCalendarEntry | null>(null);
  const loading       = ref(false);
  const error         = ref<string | null>(null);
  const lastBookingId = ref<number | null>(null);

  async function loadSlots(month: string): Promise<void> {
    loading.value = true;
    error.value   = null;
    try {
      const res = await slotsApi.getCalendar(month);
      slots.value = res.data;
    } catch (e: any) {
      error.value = e?.response?.data?.error ?? 'خطأ في تحميل المواعيد';
    } finally {
      loading.value = false;
    }
  }

  function selectSlot(slot: SlotCalendarEntry): void {
    selectedSlot.value = slot;
  }

  function clearSelection(): void {
    selectedSlot.value = null;
  }

  return { slots, selectedSlot, loading, error, lastBookingId, loadSlots, selectSlot, clearSelection };
});
