<template>
  <div class="card">
    <h3 class="font-bold text-gray-800 mb-4">تعديل الشروط والأحكام</h3>

    <div v-if="loading" class="space-y-2">
      <div v-for="i in 4" :key="i" class="h-4 bg-gray-100 animate-pulse rounded" />
    </div>

    <div v-else class="space-y-4">
      <textarea
        v-model="text"
        rows="12"
        class="input-field resize-y w-full font-mono text-sm"
        placeholder="أدخل نص الشروط والأحكام هنا..."
        dir="rtl"
      />
      <div class="flex items-center gap-3">
        <button type="button" class="btn-primary" :disabled="saving" @click="save">
          {{ saving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
        </button>
        <span v-if="savedMsg" class="text-sm text-green-600">{{ savedMsg }}</span>
        <span v-if="errorMsg" class="text-sm text-red-600">{{ errorMsg }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '@/api/settings';

const text     = ref('');
const loading  = ref(false);
const saving   = ref(false);
const savedMsg = ref<string | null>(null);
const errorMsg = ref<string | null>(null);

async function load(): Promise<void> {
  loading.value = true;
  try {
    const res = await settingsApi.getTerms();
    text.value = res.data.terms;
  } finally {
    loading.value = false;
  }
}

async function save(): Promise<void> {
  saving.value   = true;
  savedMsg.value = null;
  errorMsg.value = null;
  try {
    await settingsApi.adminUpdate('terms_and_conditions', text.value);
    savedMsg.value = 'تم الحفظ بنجاح ✓';
    setTimeout(() => { savedMsg.value = null; }, 3000);
  } catch (e: any) {
    errorMsg.value = e?.response?.data?.error ?? 'حدث خطأ.';
  } finally {
    saving.value = false;
  }
}

onMounted(load);
</script>
