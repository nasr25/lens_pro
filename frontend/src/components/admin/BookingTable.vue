<template>
  <div>
    <!-- Status filter tabs -->
    <div class="flex gap-2 mb-4 flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        type="button"
        :class="[
          'px-4 py-1.5 rounded-full text-sm font-semibold transition-colors',
          activeStatus === tab.value
            ? 'bg-purple-600 text-white'
            : 'bg-white text-gray-600 ring-1 ring-gray-200 hover:bg-gray-50',
        ]"
        @click="$emit('filterChange', tab.value)"
      >
        {{ tab.label }}
        <span
          v-if="tab.count !== undefined"
          class="mr-1 text-xs opacity-75"
        >({{ tab.count }})</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-2">
      <div v-for="i in 5" :key="i" class="h-14 bg-gray-100 animate-pulse rounded-lg" />
    </div>

    <!-- Empty state -->
    <div v-else-if="bookings.length === 0" class="text-center py-16 text-gray-400">
      <svg class="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      لا توجد حجوزات
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto rounded-lg ring-1 ring-gray-200">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th class="px-4 py-3 text-start">#</th>
            <th class="px-4 py-3 text-start">الاسم</th>
            <th class="px-4 py-3 text-start">الجوال</th>
            <th class="px-4 py-3 text-start">المناسبة</th>
            <th class="px-4 py-3 text-start">التاريخ</th>
            <th class="px-4 py-3 text-start">الحالة</th>
            <th class="px-4 py-3 text-start">إجراء</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 bg-white">
          <tr
            v-for="b in bookings"
            :key="b.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-gray-400 font-mono">{{ b.id }}</td>
            <td class="px-4 py-3 font-medium text-gray-900">{{ b.full_name }}</td>
            <td class="px-4 py-3 text-gray-600 dir-ltr font-mono">{{ b.phone_number }}</td>
            <td class="px-4 py-3 text-gray-600">{{ eventTypeLabel(b.event_type) }}</td>
            <td class="px-4 py-3 text-gray-600 whitespace-nowrap">
              {{ formatDate(b.slot_date) }}
              <span v-if="b.slot_time" class="text-gray-400 text-xs mr-1">
                {{ b.slot_time.slice(0, 5) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="b.status" />
            </td>
            <td class="px-4 py-3">
              <div v-if="b.status === 'pending'" class="flex items-center gap-2">
                <button
                  type="button"
                  class="text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-full transition-colors"
                  @click="$emit('confirm', b)"
                >
                  قبول
                </button>
                <button
                  type="button"
                  class="text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors"
                  @click="$emit('reject', b)"
                >
                  رفض
                </button>
              </div>
              <button
                v-else
                type="button"
                class="text-xs text-gray-400 hover:text-gray-700"
                @click="$emit('view', b)"
              >
                تفاصيل
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>إجمالي {{ total }} حجز</span>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
          :disabled="page <= 1"
          @click="$emit('pageChange', page - 1)"
        >‹</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button
          type="button"
          class="p-1 rounded hover:bg-gray-100 disabled:opacity-40"
          :disabled="page >= totalPages"
          @click="$emit('pageChange', page + 1)"
        >›</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import type { Booking, DashboardStats, EventType } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const props = defineProps<{
  bookings: Booking[];
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  activeStatus: string;
  stats?: DashboardStats;
}>();

defineEmits<{
  (e: 'confirm', b: Booking): void;
  (e: 'reject',  b: Booking): void;
  (e: 'view',    b: Booking): void;
  (e: 'filterChange', status: string): void;
  (e: 'pageChange', page: number): void;
}>();

const totalPages = computed(() => Math.ceil(props.total / props.limit));

const tabs = computed(() => [
  { value: 'all',       label: 'الكل',        count: props.stats?.total },
  { value: 'pending',   label: 'انتظار',       count: props.stats?.pending },
  { value: 'confirmed', label: 'مؤكدة',        count: props.stats?.confirmed },
  { value: 'rejected',  label: 'مرفوضة',       count: props.stats?.rejected },
]);

function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type as EventType] ?? type;
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'd MMM yyyy', { locale: arSA });
  } catch {
    return dateStr;
  }
}
</script>
