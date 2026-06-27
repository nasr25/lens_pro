<template>
  <div class="space-y-6">
    <!-- Create slots -->
    <div class="card">
      <h3 class="font-bold text-gray-800 mb-4">إضافة أوقات متاحة</h3>
      <form @submit.prevent="onCreate" class="space-y-4">
        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">التواريخ</label>
          <input
            v-model="newDatesRaw"
            type="text"
            class="input-field"
            placeholder="2026-07-10, 2026-07-15"
          />
          <p class="text-xs text-gray-400 mt-1">أدخل التواريخ بالصيغة YYYY-MM-DD مفصولة بفواصل</p>
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">
            الأوقات <span class="text-gray-400 text-xs">(اختياري — اتركه فارغاً ليوم كامل)</span>
          </label>
          <input
            v-model="newTimesRaw"
            type="text"
            class="input-field"
            placeholder="09:00, 14:00, 18:00"
          />
        </div>

        <div>
          <label class="block text-sm font-semibold text-gray-700 mb-1">الحالة</label>
          <select v-model="newStatus" class="input-field">
            <option value="available">متاح</option>
            <option value="blocked">مغلق</option>
          </select>
        </div>

        <div v-if="createError" class="text-sm text-red-600">{{ createError }}</div>
        <div v-if="createSuccess" class="text-sm text-green-600">{{ createSuccess }}</div>

        <button type="submit" class="btn-primary" :disabled="creating">
          {{ creating ? 'جاري الإضافة...' : 'إضافة الأوقات' }}
        </button>
      </form>
    </div>

    <!-- Existing slots list -->
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h3 class="font-bold text-gray-800">الأوقات المضافة</h3>
        <div class="flex items-center gap-2">
          <input
            v-model="filterMonth"
            type="month"
            class="input-field py-1 text-sm w-auto"
            @change="loadSlots"
          />
        </div>
      </div>

      <div v-if="loading" class="space-y-2">
        <div v-for="i in 4" :key="i" class="h-10 bg-gray-100 animate-pulse rounded" />
      </div>

      <div v-else-if="slots.length === 0" class="text-center py-8 text-gray-400 text-sm">
        لا توجد أوقات مضافة لهذا الشهر
      </div>

      <div v-else class="overflow-x-auto rounded-lg ring-1 ring-gray-200">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 text-gray-500 text-xs">
            <tr>
              <th class="px-4 py-2 text-start">التاريخ</th>
              <th class="px-4 py-2 text-start">الوقت</th>
              <th class="px-4 py-2 text-start">الحالة</th>
              <th class="px-4 py-2 text-start">إجراء</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 bg-white">
            <tr v-for="slot in slots" :key="slot.id" class="hover:bg-gray-50">
              <td class="px-4 py-2 font-mono text-gray-700">{{ slot.slot_date }}</td>
              <td class="px-4 py-2 text-gray-600">{{ slot.slot_time?.slice(0, 5) ?? 'يوم كامل' }}</td>
              <td class="px-4 py-2">
                <StatusBadge :status="slot.calendar_status" />
              </td>
              <td class="px-4 py-2">
                <div class="flex items-center gap-2">
                  <button
                    v-if="slot.calendar_status === 'available'"
                    type="button"
                    class="text-xs text-orange-600 hover:underline"
                    @click="toggleBlock(slot.id, 'blocked')"
                  >
                    إغلاق
                  </button>
                  <button
                    v-else-if="slot.calendar_status === 'blocked'"
                    type="button"
                    class="text-xs text-green-600 hover:underline"
                    @click="toggleBlock(slot.id, 'available')"
                  >
                    فتح
                  </button>
                  <button
                    type="button"
                    class="text-xs text-red-600 hover:underline"
                    @click="removeSlot(slot.id)"
                  >
                    حذف
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import StatusBadge from '@/components/shared/StatusBadge.vue';
import { slotsApi } from '@/api/slots';
import type { SlotCalendarEntry } from '@/types';
import { format } from 'date-fns';

const slots         = ref<SlotCalendarEntry[]>([]);
const loading       = ref(false);
const creating      = ref(false);
const createError   = ref<string | null>(null);
const createSuccess = ref<string | null>(null);

const newDatesRaw = ref('');
const newTimesRaw = ref('');
const newStatus   = ref<'available' | 'blocked'>('available');
const filterMonth = ref(format(new Date(), 'yyyy-MM'));

async function loadSlots(): Promise<void> {
  loading.value = true;
  try {
    const res = await slotsApi.adminList(filterMonth.value);
    slots.value = res.data;
  } catch (e: any) {
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function onCreate(): Promise<void> {
  createError.value   = null;
  createSuccess.value = null;

  const dates = newDatesRaw.value.split(',').map(d => d.trim()).filter(Boolean);
  const times = newTimesRaw.value ? newTimesRaw.value.split(',').map(t => t.trim()).filter(Boolean) : undefined;

  if (dates.length === 0) {
    createError.value = 'أدخل تاريخاً واحداً على الأقل.';
    return;
  }

  creating.value = true;
  try {
    await slotsApi.adminCreate({ dates, times, status: newStatus.value });
    createSuccess.value = `تم إضافة الأوقات بنجاح.`;
    newDatesRaw.value = '';
    newTimesRaw.value = '';
    await loadSlots();
  } catch (e: any) {
    createError.value = e?.response?.data?.error ?? 'حدث خطأ.';
  } finally {
    creating.value = false;
  }
}

async function toggleBlock(id: number, status: 'available' | 'blocked'): Promise<void> {
  await slotsApi.adminUpdate(id, status);
  await loadSlots();
}

async function removeSlot(id: number): Promise<void> {
  if (!confirm('هل أنت متأكد من حذف هذا الوقت؟')) return;
  try {
    await slotsApi.adminDelete(id);
    await loadSlots();
  } catch (e: any) {
    alert(e?.response?.data?.error ?? 'لا يمكن الحذف');
  }
}

onMounted(loadSlots);
</script>
