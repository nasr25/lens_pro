<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />
    <main class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">الإعدادات</h1>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
            activeTab === tab.id
              ? 'bg-white border border-b-white text-purple-700 -mb-px'
              : 'text-gray-600 hover:text-gray-800',
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- معلومات التواصل -->
      <div v-show="activeTab === 'contact'" class="card space-y-4">
        <h3 class="font-bold text-gray-800">معلومات التواصل</h3>
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

      <!-- الشعار -->
      <div v-show="activeTab === 'logo'">
        <LogoEditor />
      </div>

      <!-- من نحن -->
      <div v-show="activeTab === 'about'">
        <AboutEditor />
      </div>

      <!-- أعمالنا -->
      <div v-show="activeTab === 'gallery'">
        <GalleryManager />
      </div>

      <!-- الباقات -->
      <div v-show="activeTab === 'packages'">
        <PackagesManager />
      </div>

      <!-- التواصل الاجتماعي -->
      <div v-show="activeTab === 'social'">
        <SocialLinksEditor />
      </div>

      <!-- الشروط والأحكام -->
      <div v-show="activeTab === 'terms'">
        <TermsEditor />
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AdminNav          from '@/components/admin/AdminNav.vue';
import TermsEditor       from '@/components/admin/TermsEditor.vue';
import LogoEditor        from '@/components/admin/LogoEditor.vue';
import AboutEditor       from '@/components/admin/AboutEditor.vue';
import GalleryManager    from '@/components/admin/GalleryManager.vue';
import PackagesManager   from '@/components/admin/PackagesManager.vue';
import SocialLinksEditor from '@/components/admin/SocialLinksEditor.vue';
import { settingsApi } from '@/api/settings';

const tabs = [
  { id: 'contact',  label: 'معلومات التواصل' },
  { id: 'logo',     label: 'الشعار' },
  { id: 'about',    label: 'من نحن' },
  { id: 'gallery',  label: 'أعمالنا' },
  { id: 'packages', label: 'الباقات' },
  { id: 'social',   label: 'التواصل الاجتماعي' },
  { id: 'terms',    label: 'الشروط والأحكام' },
];

const activeTab = ref('contact');

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
