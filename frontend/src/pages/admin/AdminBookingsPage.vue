<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />
    <main class="mx-auto max-w-6xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">إدارة الحجوزات</h1>

      <div class="card">
        <BookingTable
          :bookings="bookings"
          :loading="loading"
          :total="total"
          :page="page"
          :limit="limit"
          :active-status="activeStatus"
          :stats="stats ?? undefined"
          @confirm="onConfirm"
          @reject="b => { selectedBooking = b; modalMode = 'reject'; showModal = true }"
          @view="b => { selectedBooking = b; modalMode = 'view'; showModal = true }"
          @filter-change="onFilterChange"
          @page-change="onPageChange"
        />
      </div>
    </main>

    <BookingDetailModal
      v-model="showModal"
      :booking="selectedBooking"
      :mode="modalMode"
      :loading="actionLoading"
      @reject="doReject"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminNav from '@/components/admin/AdminNav.vue';
import BookingTable from '@/components/admin/BookingTable.vue';
import BookingDetailModal from '@/components/admin/BookingDetailModal.vue';
import { bookingsApi } from '@/api/bookings';
import type { Booking, DashboardStats } from '@/types';

const bookings       = ref<Booking[]>([]);
const stats          = ref<DashboardStats | null>(null);
const loading        = ref(false);
const actionLoading  = ref(false);
const total          = ref(0);
const page           = ref(1);
const limit          = ref(20);
const activeStatus   = ref('all');
const showModal      = ref(false);
const modalMode      = ref<'view' | 'reject'>('view');
const selectedBooking = ref<Booking | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const [bookRes, statsRes] = await Promise.all([
      bookingsApi.adminList({ status: activeStatus.value, page: page.value, limit: limit.value }),
      bookingsApi.stats(),
    ]);
    bookings.value = bookRes.data.bookings;
    total.value    = bookRes.data.total;
    stats.value    = statsRes.data;
  } finally {
    loading.value = false;
  }
}

function onFilterChange(status: string): void {
  activeStatus.value = status;
  page.value = 1;
  load();
}

function onPageChange(p: number): void {
  page.value = p;
  load();
}

async function onConfirm(b: Booking): Promise<void> {
  await bookingsApi.adminConfirm(b.id);
  await load();
}

async function doReject(id: number, reason: string): Promise<void> {
  actionLoading.value = true;
  try {
    await bookingsApi.adminReject(id, reason);
    showModal.value = false;
    await load();
  } finally {
    actionLoading.value = false;
  }
}

onMounted(load);
</script>
