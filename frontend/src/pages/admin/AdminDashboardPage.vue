<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">لوحة التحكم</h1>

      <!-- Stats cards -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div class="card text-center">
          <p class="text-3xl font-bold text-gray-900">{{ stats?.total ?? '—' }}</p>
          <p class="text-sm text-gray-500 mt-1">إجمالي الحجوزات</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-yellow-600">{{ stats?.pending ?? '—' }}</p>
          <p class="text-sm text-gray-500 mt-1">في الانتظار</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-green-600">{{ stats?.confirmed ?? '—' }}</p>
          <p class="text-sm text-gray-500 mt-1">مؤكدة</p>
        </div>
        <div class="card text-center">
          <p class="text-3xl font-bold text-gray-400">{{ stats?.rejected ?? '—' }}</p>
          <p class="text-sm text-gray-500 mt-1">مرفوضة</p>
        </div>
      </div>

      <!-- Recent bookings -->
      <div class="card">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-bold text-gray-800">آخر الحجوزات</h2>
          <RouterLink to="/admin/bookings" class="text-sm text-purple-600 hover:underline">
            عرض الكل
          </RouterLink>
        </div>
        <BookingTable
          :bookings="recentBookings"
          :loading="loading"
          :total="recentBookings.length"
          :page="1"
          :limit="10"
          active-status="all"
          @confirm="onConfirm"
          @reject="selectedForReject = $event; showRejectModal = true"
          @view="selectedForView = $event; showViewModal = true"
          @filter-change="() => {}"
          @page-change="() => {}"
        />
      </div>
    </main>

    <!-- Reject modal -->
    <BookingDetailModal
      v-model="showRejectModal"
      :booking="selectedForReject"
      mode="reject"
      :loading="actionLoading"
      @reject="doReject"
    />
    <BookingDetailModal
      v-model="showViewModal"
      :booking="selectedForView"
      mode="view"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import AdminNav from '@/components/admin/AdminNav.vue';
import BookingTable from '@/components/admin/BookingTable.vue';
import BookingDetailModal from '@/components/admin/BookingDetailModal.vue';
import { bookingsApi } from '@/api/bookings';
import type { Booking, DashboardStats } from '@/types';

const stats           = ref<DashboardStats | null>(null);
const recentBookings  = ref<Booking[]>([]);
const loading         = ref(false);
const actionLoading   = ref(false);
const showRejectModal = ref(false);
const showViewModal   = ref(false);
const selectedForReject = ref<Booking | null>(null);
const selectedForView   = ref<Booking | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [statsRes, bookingsRes] = await Promise.all([
      bookingsApi.stats(),
      bookingsApi.adminList({ limit: 10 }),
    ]);
    stats.value          = statsRes.data;
    recentBookings.value = bookingsRes.data.bookings;
  } finally {
    loading.value = false;
  }
}

async function onConfirm(b: Booking): Promise<void> {
  await bookingsApi.adminConfirm(b.id);
  await load();
}

async function doReject(id: number, reason: string): Promise<void> {
  actionLoading.value = true;
  try {
    await bookingsApi.adminReject(id, reason);
    showRejectModal.value = false;
    await load();
  } finally {
    actionLoading.value = false;
  }
}

onMounted(load);
</script>
