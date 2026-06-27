<template>
  <header class="bg-white shadow-sm border-b border-gray-100">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <RouterLink to="/" class="flex items-center gap-2">
          <span class="text-2xl font-bold text-purple-700">Lens Pro</span>
          <span class="text-sm text-gray-500 hidden sm:block">| للتصوير</span>
        </RouterLink>
        <nav class="flex items-center gap-4">
          <RouterLink
            to="/"
            class="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors"
            active-class="text-purple-700"
          >
            الرئيسية
          </RouterLink>
          <RouterLink
            v-if="isAdmin"
            to="/admin/dashboard"
            class="text-sm font-medium text-gray-600 hover:text-purple-700"
          >
            لوحة التحكم
          </RouterLink>
          <RouterLink
            v-else
            to="/admin/login"
            class="text-xs text-gray-400 hover:text-gray-600"
          >
            تسجيل دخول الإدارة
          </RouterLink>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed } from 'vue';
import { useAdminStore } from '@/stores/admin';

const admin   = useAdminStore();
const isAdmin = computed(() => admin.isLoggedIn);
</script>
