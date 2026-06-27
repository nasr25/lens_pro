<template>
  <header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 items-center justify-between">
        <!-- Logo -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <img
            v-if="settings.logoUrl"
            :src="settings.logoUrl"
            alt="Lens Pro"
            class="h-10 w-auto object-contain"
          />
          <span v-else class="text-2xl font-bold text-purple-700">Lens Pro</span>
        </RouterLink>

        <!-- Nav links -->
        <nav class="hidden sm:flex items-center gap-5">
          <a href="#about"    class="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors cursor-pointer">{{ t('nav_about') }}</a>
          <a href="#work"     class="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors cursor-pointer">{{ t('nav_work') }}</a>
          <a href="#packages" class="text-sm font-medium text-gray-600 hover:text-purple-700 transition-colors cursor-pointer">{{ t('nav_packages') }}</a>
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
            تسجيل الدخول
          </RouterLink>
        </nav>

        <!-- Lang toggle -->
        <button
          @click="locale.toggleLocale()"
          class="ms-4 rounded-full border border-purple-300 px-3 py-1 text-sm font-semibold text-purple-700 hover:bg-purple-50 transition-colors"
        >
          {{ t('lang_toggle') }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { computed } from 'vue';
import { useAdminStore } from '@/stores/admin';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from '@/composables/useI18n';

const admin    = useAdminStore();
const settings = useSettingsStore();
const { t, locale } = useI18n();

const isAdmin = computed(() => admin.isLoggedIn);
</script>
