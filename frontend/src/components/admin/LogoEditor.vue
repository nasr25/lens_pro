<template>
  <div class="card space-y-4">
    <h3 class="font-semibold text-gray-800">شعار الموقع</h3>

    <div v-if="currentUrl" class="flex items-center gap-4">
      <img :src="currentUrl" alt="الشعار الحالي" class="h-16 w-auto object-contain rounded border p-1" />
      <span class="text-sm text-gray-500">الشعار الحالي</span>
    </div>

    <div class="flex gap-3">
      <input
        v-model="urlInput"
        type="url"
        placeholder="https://example.com/logo.png"
        class="input-field flex-1"
      />
      <button @click="save" :disabled="saving" class="btn-primary px-4">
        {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
      </button>
    </div>

    <p v-if="success" class="text-sm text-green-600">✓ تم حفظ الشعار بنجاح</p>
    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { settingsApi } from '@/api/settings';
import { useSettingsStore } from '@/stores/settings';

const settings   = useSettingsStore();
const urlInput   = ref('');
const currentUrl = ref('');
const saving     = ref(false);
const success    = ref(false);
const error      = ref('');

onMounted(async () => {
  try {
    await settings.fetchAll();
    currentUrl.value = settings.logoUrl;
    urlInput.value   = settings.logoUrl;
  } catch { /* ignore */ }
});

async function save() {
  if (!urlInput.value.trim()) return;
  saving.value  = true;
  success.value = false;
  error.value   = '';
  try {
    await settingsApi.adminUpdate('logo_url', urlInput.value.trim());
    settings.logoUrl = urlInput.value.trim();
    currentUrl.value = urlInput.value.trim();
    success.value    = true;
  } catch {
    error.value = 'فشل حفظ الشعار';
  } finally {
    saving.value = false;
  }
}
</script>
