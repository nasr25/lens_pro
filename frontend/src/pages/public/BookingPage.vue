<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />
    <div class="mx-auto max-w-xl px-4 py-10">
      <RouterLink to="/" class="text-sm text-brand-600 hover:underline flex items-center gap-1 mb-6">
        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
        العودة إلى التقويم
      </RouterLink>

      <div v-if="!slotId" class="card text-center text-gray-500">
        لم يتم اختيار موعد. <RouterLink to="/" class="text-brand-600 underline">اختر موعدًا</RouterLink>
      </div>

      <div v-else-if="slotUnavailable" class="card text-center">
        <p class="text-red-600 font-semibold mb-4">هذا الموعد لم يعد متاحًا للحجز.</p>
        <RouterLink to="/" class="btn-primary">العودة للتقويم</RouterLink>
      </div>

      <div v-else class="card">
        <div class="mb-6 p-4 bg-brand-50 rounded-lg">
          <p class="text-sm text-gray-600">الموعد المختار</p>
          <p class="text-lg font-bold text-brand-800 mt-1">{{ slotLabel }}</p>
        </div>
        <h1 class="text-xl font-bold text-gray-900 mb-6">بيانات الحجز</h1>
        <BookingForm :slot-id="slotId" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, RouterLink } from 'vue-router';
import AppHeader from '@/components/shared/AppHeader.vue';
import BookingForm from '@/components/public/BookingForm.vue';
import { useBookingStore } from '@/stores/booking';
import { slotsApi } from '@/api/slots';
import type { SlotCalendarEntry } from '@/types';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const route  = useRoute();
const store  = useBookingStore();

const slotId = computed(() => {
  const id = route.query.slotId;
  return id ? parseInt(id as string) : null;
});

const slotDetail      = ref<SlotCalendarEntry | null>(null);
const slotUnavailable = ref(false);

const slotLabel = computed(() => {
  const slot = slotDetail.value ?? store.selectedSlot;
  if (!slot) return '';
  const dateStr = format(new Date(slot.slot_date), 'EEEE d MMMM yyyy', { locale: arSA });
  return slot.slot_time ? `${dateStr} — ${slot.slot_time.slice(0, 5)}` : dateStr;
});

onMounted(async () => {
  if (!slotId.value) return;

  // Use cached slot if available
  if (store.selectedSlot?.id === slotId.value) {
    if (store.selectedSlot.calendar_status !== 'available') {
      slotUnavailable.value = true;
    }
    return;
  }

  // Otherwise fetch from calendar
  try {
    const today = format(new Date(), 'yyyy-MM');
    const res = await slotsApi.getCalendar(today);
    const found = res.data.find(s => s.id === slotId.value);
    if (!found || found.calendar_status !== 'available') {
      slotUnavailable.value = true;
    } else {
      slotDetail.value = found;
    }
  } catch {
    slotUnavailable.value = true;
  }
});
</script>
