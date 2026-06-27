<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="$emit('update:modelValue', false)" />
      <div class="relative z-10 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ message }}</p>
        <div class="flex items-center gap-3 justify-end">
          <button
            class="btn-secondary px-4 py-2"
            @click="$emit('update:modelValue', false)"
          >
            إلغاء
          </button>
          <button
            :class="danger ? 'btn-danger' : 'btn-primary'"
            class="px-4 py-2"
            :disabled="loading"
            @click="$emit('confirm')"
          >
            {{ loading ? 'جاري...' : confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  loading?: boolean;
}>();

defineEmits<{
  (e: 'update:modelValue', v: boolean): void;
  (e: 'confirm'): void;
}>();
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.15s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
