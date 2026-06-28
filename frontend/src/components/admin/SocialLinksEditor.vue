<template>
  <div class="card space-y-5">
    <h3 class="font-semibold text-gray-800">روابط التواصل الاجتماعي</h3>

    <div v-for="field in fields" :key="field.key" class="flex items-center gap-3">
      <span class="w-24 text-sm text-gray-600 shrink-0">{{ field.label }}</span>
      <input
        v-model="values[field.key]"
        type="url"
        :placeholder="field.placeholder"
        class="input-field flex-1"
        dir="ltr"
      />
    </div>

    <div class="flex items-center gap-3">
      <button @click="save" :disabled="saving" class="btn-primary">
        {{ saving ? 'جاري الحفظ...' : 'حفظ الروابط' }}
      </button>
      <span v-if="success" class="text-sm text-green-600">✓ تم الحفظ</span>
      <span v-if="error" class="text-sm text-red-600">{{ error }}</span>
    </div>

    <div class="space-y-4 border-t pt-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">نص الفوتر (عربي)</label>
        <input v-model="footerAr" type="text" class="input-field w-full" dir="rtl" />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Footer text (English)</label>
        <input v-model="footerEn" type="text" class="input-field w-full" dir="ltr" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { settingsApi } from '@/api/settings';
import { useSettingsStore } from '@/stores/settings';

const settings = useSettingsStore();

const fields = [
  { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
  { key: 'social_twitter',   label: 'X / Twitter', placeholder: 'https://x.com/...' },
  { key: 'social_snapchat',  label: 'Snapchat', placeholder: 'https://snapchat.com/...' },
  { key: 'social_tiktok',    label: 'TikTok',   placeholder: 'https://tiktok.com/...' },
  { key: 'social_youtube',   label: 'YouTube',  placeholder: 'https://youtube.com/@...' },
];

const values  = reactive<Record<string, string>>({
  social_instagram: '',
  social_twitter:   '',
  social_snapchat:  '',
  social_tiktok:    '',
  social_youtube:   '',
});
const footerAr = ref('');
const footerEn = ref('');
const saving   = ref(false);
const success  = ref(false);
const error    = ref('');

onMounted(async () => {
  try {
    await settings.fetchAll();
    values.social_instagram = settings.socialInstagram;
    values.social_twitter   = settings.socialTwitter;
    values.social_snapchat  = settings.socialSnapchat;
    values.social_tiktok    = settings.socialTiktok;
    values.social_youtube   = settings.socialYoutube;
    footerAr.value          = settings.footerTextAr;
    footerEn.value          = settings.footerTextEn;
  } catch { /* ignore */ }
});

async function save() {
  saving.value  = true;
  success.value = false;
  error.value   = '';
  try {
    await Promise.all([
      ...fields.map(f => settingsApi.adminUpdate(f.key, values[f.key])),
      settingsApi.adminUpdate('footer_text_ar', footerAr.value),
      settingsApi.adminUpdate('footer_text_en', footerEn.value),
    ]);
    settings.socialInstagram = values.social_instagram;
    settings.socialTwitter   = values.social_twitter;
    settings.socialSnapchat  = values.social_snapchat;
    settings.socialTiktok    = values.social_tiktok;
    settings.socialYoutube   = values.social_youtube;
    settings.footerTextAr    = footerAr.value;
    settings.footerTextEn    = footerEn.value;
    success.value = true;
  } catch {
    error.value = 'فشل حفظ البيانات';
  } finally {
    saving.value = false;
  }
}
</script>
