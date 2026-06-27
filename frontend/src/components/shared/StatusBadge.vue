<template>
  <span :class="['inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', colorClass]">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { BookingStatus, CalendarStatus } from '@/types';

const props = defineProps<{ status: BookingStatus | CalendarStatus }>();

const colorClass = computed(() => {
  switch (props.status) {
    case 'available':  return 'bg-green-100 text-green-800';
    case 'pending':    return 'bg-yellow-100 text-yellow-800';
    case 'confirmed':  return 'bg-red-100 text-red-800';
    case 'rejected':   return 'bg-gray-100 text-gray-600';
    case 'blocked':    return 'bg-gray-100 text-gray-500';
    default:           return 'bg-gray-100 text-gray-600';
  }
});

const label = computed(() => {
  switch (props.status) {
    case 'available':  return 'متاح';
    case 'pending':    return 'في الانتظار';
    case 'confirmed':  return 'مؤكد';
    case 'rejected':   return 'مرفوض';
    case 'blocked':    return 'مغلق';
    default:           return props.status;
  }
});
</script>
