<template>
  <div class="card space-y-5">
    <h3 class="font-semibold text-gray-800">قسم "من نحن"</h3>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">النص بالعربي</label>
      <textarea v-model="arText" rows="5" class="input-field w-full resize-y" dir="rtl" />
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Text in English</label>
      <textarea v-model="enText" rows="5" class="input-field w-full resize-y" dir="ltr" />
    </div>

    <div class="flex items-center gap-3">
      <button @click="save" :disabled="saving" class="btn-primary">
        {{ saving ? 'جاري الحفظ...' : 'حفظ التغييرات' }}
      </button>
      <span v-if="success" class="text-sm text-green-600">✓ تم الحفظ</span>
      <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '@/api/settings';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();
const arText   = ref('');
const enText   = ref('');
const saving   = ref(false);
const success  = ref(false);
const error    = ref('');

onMounted(async () => {
  try {
    await settings.fetchAll();
    arText.value = settings.aboutAr;
    enText.value = settings.aboutEn;
  } catch { /* ignore */ }
});

async function save() {
  saving.value  = true;
  success.value = false;
  error.value   = '';
  try {
    await Promise.all([
      settingsApi.adminUpdate('about_ar', arText.value),
      settingsApi.adminUpdate('about_en', enText.value),
    ]);
    settings.aboutAr = arText.value;
    settings.aboutEn = enText.value;
    success.value = true;
  } catch {
    error.value = 'فشل حفظ البيانات';
  } finally {
    saving.value = false;
  }
}
</script>
