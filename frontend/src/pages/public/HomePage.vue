<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- Hero -->
    <section class="bg-gradient-to-bl from-purple-900 to-purple-700 text-white py-16 px-4">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="text-4xl sm:text-5xl font-bold mb-4">احجز جلستك التصويرية</h1>
        <p class="text-lg text-purple-200">
          لحظاتك تستحق أن تُخلَّد. اختر موعدك المناسب وسنكون معك.
        </p>
      </div>
    </section>

    <!-- Calendar section -->
    <section class="mx-auto max-w-2xl px-4 py-10">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">المواعيد المتاحة</h2>

        <div v-if="store.error" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {{ store.error }}
          <button class="underline mr-2" @click="reload">إعادة المحاولة</button>
        </div>

        <CalendarView
          :slots="store.slots"
          :loading="store.loading"
          @slot-selected="onSlotSelected"
          @month-changed="onMonthChanged"
        />
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        انقر على أي موعد
        <span class="inline-flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-green-200 ring-1 ring-green-400 inline-block" />
          أخضر
        </span>
        للحجز
      </p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import AppHeader from '@/components/shared/AppHeader.vue';
import CalendarView from '@/components/public/CalendarView.vue';
import { useBookingStore } from '@/stores/booking';
import type { SlotCalendarEntry } from '@/types';
import { format } from 'date-fns';

const store  = useBookingStore();
const router = useRouter();

function onMonthChanged(month: string): void {
  store.loadSlots(month);
}

function onSlotSelected(slot: SlotCalendarEntry): void {
  store.selectSlot(slot);
  router.push({ path: '/book', query: { slotId: String(slot.id) } });
}

function reload(): void {
  const month = format(new Date(), 'yyyy-MM');
  store.loadSlots(month);
}

onMounted(() => {
  const month = format(new Date(), 'yyyy-MM');
  store.loadSlots(month);
});
</script>
