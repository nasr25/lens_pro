<template>
  <header class="bg-white shadow-sm border-b border-gray-100">
    <div class="mx-auto max-w-6xl px-4">
      <div class="flex h-14 items-center justify-between">
        <div class="flex items-center gap-6">
          <span class="font-bold text-purple-700">Lens Pro — إدارة</span>
          <nav class="hidden sm:flex items-center gap-1 text-sm">
            <RouterLink
              v-for="link in links"
              :key="link.to"
              :to="link.to"
              class="px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
              active-class="bg-purple-50 text-purple-700 font-semibold"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span class="text-sm text-gray-500 hidden sm:block">{{ admin.username }}</span>
          <button
            type="button"
            class="text-sm text-red-600 hover:underline"
            @click="onLogout"
          >
            خروج
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const admin  = useAdminStore();
const router = useRouter();

const links = [
  { to: '/admin/dashboard', label: 'الرئيسية' },
  { to: '/admin/bookings',  label: 'الحجوزات' },
  { to: '/admin/slots',     label: 'الأوقات' },
  { to: '/admin/settings',  label: 'الإعدادات' },
];

async function onLogout(): Promise<void> {
  await admin.logout();
  router.push('/admin/login');
}
</script>
