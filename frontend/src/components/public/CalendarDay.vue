<template>
  <div
    v-if="isEmpty"
    class="aspect-square"
    aria-hidden="true"
  />
  <button
    v-else
    type="button"
    :disabled="!isClickable"
    :aria-label="`${day} - ${statusLabel}`"
    :class="[
      'aspect-square w-full rounded-lg flex flex-col items-center justify-center gap-0.5 text-sm font-semibold transition-all',
      colorClass,
      isClickable ? 'cursor-pointer hover:scale-105 hover:shadow-md' : 'cursor-default opacity-70',
      isPast && !isEmpty ? 'opacity-40' : '',
    ]"
    @click="isClickable && slot && $emit('select', slot)"
  >
    <span>{{ day }}</span>
    <span class="text-[9px] font-normal hidden sm:block">{{ shortLabel }}</span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { SlotCalendarEntry } from '@/types';

const props = defineProps<{
  day: number;
  date: string;
  slot: SlotCalendarEntry | null;
  isEmpty: boolean;
  isPast: boolean;
}>();

defineEmits<{ (e: 'select', slot: SlotCalendarEntry): void }>();

const status = computed(() => props.slot?.calendar_status ?? null);

const colorClass = computed(() => {
  if (!props.slot || props.isPast) return 'bg-gray-100 text-gray-400';
  switch (status.value) {
    case 'available': return 'bg-green-100 text-green-800 ring-2 ring-green-300';
    case 'pending':   return 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-300';
    case 'confirmed': return 'bg-red-100 text-red-700 ring-2 ring-red-300';
    case 'blocked':   return 'bg-gray-200 text-gray-500';
    default:          return 'bg-gray-100 text-gray-400';
  }
});

const statusLabel = computed(() => {
  switch (status.value) {
    case 'available': return 'متاح للحجز';
    case 'pending':   return 'في انتظار التأكيد';
    case 'confirmed': return 'محجوز';
    case 'blocked':   return 'غير متاح';
    default:          return 'غير متاح';
  }
});

const shortLabel = computed(() => {
  switch (status.value) {
    case 'available': return 'متاح';
    case 'pending':   return 'انتظار';
    case 'confirmed': return 'محجوز';
    default:          return '';
  }
});

const isClickable = computed(() =>
  !props.isPast && props.slot?.calendar_status === 'available'
);
</script>
