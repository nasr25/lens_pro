<template>
  <Transition name="fade">
    <div v-if="modelValue && booking" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="close" />
      <div class="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-bold text-gray-900">
            {{ mode === 'reject' ? 'رفض الحجز' : 'تفاصيل الحجز' }}
          </h3>
          <button type="button" class="p-1 text-gray-400 hover:text-gray-700" @click="close">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="p-5 space-y-3 text-sm">
          <div class="grid grid-cols-2 gap-3">
            <detail-row label="الاسم"     :value="booking.full_name" />
            <detail-row label="الجوال"    :value="booking.phone_number" ltr />
            <detail-row label="البريد"    :value="booking.email ?? '—'" ltr />
            <detail-row label="المناسبة"  :value="eventTypeLabel(booking.event_type)" />
            <detail-row label="الموقع"    :value="booking.location" />
            <detail-row label="التاريخ"   :value="formatDate(booking.slot_date)" />
            <detail-row label="الوقت"     :value="booking.slot_time?.slice(0, 5) ?? 'يوم كامل'" />
            <detail-row label="الحالة"    :value="''" />
          </div>

          <div class="mt-1">
            <StatusBadge :status="booking.status" />
          </div>

          <div v-if="booking.notes" class="mt-2">
            <p class="font-semibold text-gray-500 text-xs mb-1">ملاحظات</p>
            <p class="text-gray-700 bg-gray-50 rounded p-2 text-xs">{{ booking.notes }}</p>
          </div>

          <div v-if="booking.rejection_reason" class="mt-2">
            <p class="font-semibold text-gray-500 text-xs mb-1">سبب الرفض</p>
            <p class="text-red-600 text-xs">{{ booking.rejection_reason }}</p>
          </div>

          <!-- Reject reason input -->
          <div v-if="mode === 'reject'" class="mt-3 pt-3 border-t">
            <label class="block text-sm font-semibold text-gray-700 mb-1">
              سبب الرفض (اختياري)
            </label>
            <textarea
              v-model="rejectReason"
              rows="3"
              class="input-field resize-none"
              placeholder="يمكنك توضيح السبب للعميل..."
            />
          </div>
        </div>

        <div v-if="mode === 'reject'" class="flex items-center gap-3 justify-end p-4 border-t">
          <button type="button" class="btn-secondary px-4 py-2" @click="close">إلغاء</button>
          <button
            type="button"
            class="btn-danger px-4 py-2"
            :disabled="loading"
            @click="confirmReject"
          >
            {{ loading ? 'جاري...' : 'رفض الحجز' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, defineComponent, h } from 'vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import type { Booking, EventType } from '@/types';
import { EVENT_TYPE_LABELS } from '@/types';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const DetailRow = defineComponent({
  props: { label: String, value: String, ltr: Boolean },
  setup(props) {
    return () => h('div', [
      h('p', { class: 'text-xs text-gray-500 font-semibold' }, props.label),
      h('p', { class: `text-gray-800 ${props.ltr ? 'dir-ltr font-mono' : ''}` }, props.value),
    ]);
  },
});

const props = defineProps<{
  modelValue: boolean;
  booking: Booking | null;
  mode: 'view' | 'reject';
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'reject', id: number, reason: string): void;
}>();

const rejectReason = ref('');

function close(): void {
  rejectReason.value = '';
  emit('update:modelValue', false);
}

function confirmReject(): void {
  if (!props.booking) return;
  emit('reject', props.booking.id, rejectReason.value);
}

function eventTypeLabel(type: string): string {
  return EVENT_TYPE_LABELS[type as EventType] ?? type;
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: arSA });
  } catch {
    return dateStr;
  }
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
