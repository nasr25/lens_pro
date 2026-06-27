<template>
  <div class="select-none">
    <!-- Month navigation -->
    <div class="flex items-center justify-between mb-6">
      <button
        type="button"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        :disabled="loading"
        @click="prev"
        aria-label="الشهر السابق"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <h2 class="text-lg font-bold text-gray-800">{{ monthLabel }}</h2>

      <button
        type="button"
        class="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
        :disabled="loading"
        @click="next"
        aria-label="الشهر التالي"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Day headers (Sat → Fri) -->
    <div class="grid grid-cols-7 mb-2">
      <div
        v-for="dayName in weekDayHeaders"
        :key="dayName"
        class="text-center text-xs font-semibold text-gray-500 py-1"
      >
        {{ dayName }}
      </div>
    </div>

    <!-- Calendar grid -->
    <div v-if="loading" class="grid grid-cols-7 gap-1.5">
      <div
        v-for="i in 35"
        :key="i"
        class="aspect-square rounded-lg bg-gray-100 animate-pulse"
      />
    </div>

    <div v-else class="grid grid-cols-7 gap-1.5">
      <CalendarDay
        v-for="(cell, idx) in calendarDays"
        :key="idx"
        :day="cell.day"
        :date="cell.date"
        :slot="cell.slot"
        :is-empty="cell.isEmpty"
        :is-past="!cell.isEmpty && isPast(cell.date)"
        @select="$emit('slotSelected', $event)"
      />
    </div>

    <!-- Legend -->
    <div class="flex flex-wrap items-center gap-4 mt-5 text-xs text-gray-500">
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-green-200 ring-1 ring-green-400 inline-block" />
        متاح
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-yellow-200 ring-1 ring-yellow-400 inline-block" />
        في الانتظار
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-red-200 ring-1 ring-red-400 inline-block" />
        محجوز
      </span>
      <span class="flex items-center gap-1.5">
        <span class="w-3 h-3 rounded-sm bg-gray-200 inline-block" />
        غير متاح
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import CalendarDay from './CalendarDay.vue';
import { useCalendar } from '@/composables/useCalendar';
import type { SlotCalendarEntry } from '@/types';

const props = defineProps<{
  slots: SlotCalendarEntry[];
  loading: boolean;
}>();

const emit = defineEmits<{
  (e: 'slotSelected', slot: SlotCalendarEntry): void;
  (e: 'monthChanged', month: string): void;
}>();

const { monthLabel, weekDayHeaders, calendarDays, prevMonth, nextMonth, isPast, currentMonth } =
  useCalendar({ value: props.slots });

// Sync slots ref with prop
watch(() => props.slots, () => {}, { immediate: true });

function prev(): void {
  prevMonth();
  emit('monthChanged', currentMonth.value);
}

function next(): void {
  nextMonth();
  emit('monthChanged', currentMonth.value);
}

// Emit initial month
emit('monthChanged', currentMonth.value);
</script>
