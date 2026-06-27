<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="$emit('update:modelValue', false)" />
      <div class="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-bold text-gray-900">الشروط والأحكام</h3>
          <button
            type="button"
            class="p-1 rounded hover:bg-gray-100 text-gray-400"
            @click="$emit('update:modelValue', false)"
          >
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="overflow-y-auto p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line flex-1">
          <div v-if="loading" class="space-y-2">
            <div v-for="i in 5" :key="i" class="h-4 bg-gray-100 animate-pulse rounded" />
          </div>
          <p v-else-if="!terms" class="text-gray-400">لا توجد شروط وأحكام متاحة حالياً.</p>
          <p v-else>{{ terms }}</p>
        </div>
        <div class="p-4 border-t">
          <button type="button" class="btn-primary w-full" @click="$emit('update:modelValue', false)">
            موافق
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { storeToRefs } from 'pinia';

defineProps<{ modelValue: boolean }>();
defineEmits<{ (e: 'update:modelValue', v: boolean): void }>();

const settingsStore = useSettingsStore();
const { terms } = storeToRefs(settingsStore);
const loading = ref(false);

import { ref } from 'vue';

watch(() => settingsStore.loaded, async (loaded) => {
  if (!loaded) {
    loading.value = true;
    await settingsStore.fetchTerms();
    loading.value = false;
  }
}, { immediate: true });
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
