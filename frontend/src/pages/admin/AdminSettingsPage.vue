<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />
    <main class="mx-auto max-w-3xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h1>

      <!-- Contact settings -->
      <div class="card mb-6">
        <h3 class="font-bold text-gray-800 mb-4">معلومات التواصل</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">اسم الموقع</label>
            <input v-model="fields.site_name" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">رقم التواصل</label>
            <input v-model="fields.contact_phone" type="tel" class="input-field" dir="ltr" />
          </div>
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">البريد الإلكتروني</label>
            <input v-model="fields.contact_email" type="email" class="input-field" dir="ltr" />
          </div>
          <div class="flex items-center gap-3">
            <button type="button" class="btn-primary" :disabled="savingContact" @click="saveContact">
              {{ savingContact ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
            <span v-if="contactMsg" class="text-sm text-green-600">{{ contactMsg }}</span>
          </div>
        </div>
      </div>

      <!-- Terms editor -->
      <TermsEditor />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminNav from '@/components/admin/AdminNav.vue';
import TermsEditor from '@/components/admin/TermsEditor.vue';
import { settingsApi } from '@/api/settings';

const fields = ref({
  site_name:     '',
  contact_phone: '',
  contact_email: '',
});

const savingContact = ref(false);
const contactMsg    = ref<string | null>(null);

async function load(): Promise<void> {
  const res = await settingsApi.adminGetAll();
  fields.value.site_name     = res.data.site_name     ?? '';
  fields.value.contact_phone = res.data.contact_phone ?? '';
  fields.value.contact_email = res.data.contact_email ?? '';
}

async function saveContact(): Promise<void> {
  savingContact.value = true;
  contactMsg.value    = null;
  try {
    await Promise.all([
      settingsApi.adminUpdate('site_name',     fields.value.site_name),
      settingsApi.adminUpdate('contact_phone', fields.value.contact_phone),
      settingsApi.adminUpdate('contact_email', fields.value.contact_email),
    ]);
    contactMsg.value = 'تم الحفظ ✓';
    setTimeout(() => { contactMsg.value = null; }, 3000);
  } finally {
    savingContact.value = false;
  }
}

onMounted(load);
</script>
