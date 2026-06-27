<template>
  <div class="card space-y-6">
    <div class="flex items-center justify-between">
      <h3 class="font-semibold text-gray-800">إدارة الباقات</h3>
      <button @click="openNew" class="btn-primary text-sm">+ إضافة باقة</button>
    </div>

    <!-- Packages list -->
    <div v-if="packages.length === 0" class="text-center text-gray-400 py-8">
      لا توجد باقات. أضف باقة جديدة.
    </div>

    <div v-else class="space-y-3">
      <div
        v-for="pkg in packages"
        :key="pkg.id"
        class="flex items-center justify-between p-4 border rounded-xl"
        :class="pkg.is_featured ? 'border-brand-300 bg-brand-50' : 'border-gray-200'"
      >
        <div>
          <span class="font-medium text-gray-800">{{ pkg.name_ar }}</span>
          <span class="text-gray-400 mx-2">/</span>
          <span class="text-gray-600 text-sm">{{ pkg.name_en }}</span>
          <span v-if="pkg.is_featured" class="ms-2 text-xs bg-brand-200 text-brand-800 px-2 py-0.5 rounded-full">مميزة</span>
        </div>
        <div class="flex items-center gap-3">
          <span class="font-bold text-brand-700">{{ pkg.price }} {{ pkg.currency }}</span>
          <button @click="openEdit(pkg)" class="text-sm text-blue-600 hover:underline">تعديل</button>
          <button @click="deletePkg(pkg.id)" class="text-sm text-red-500 hover:underline">حذف</button>
        </div>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg font-bold">{{ editingId ? 'تعديل الباقة' : 'إضافة باقة جديدة' }}</h3>
            <button @click="showModal = false" class="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">الاسم (عربي)</label>
              <input v-model="form.name_ar" type="text" class="input-field w-full mt-1" dir="rtl" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Name (English)</label>
              <input v-model="form.name_en" type="text" class="input-field w-full mt-1" dir="ltr" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">السعر</label>
              <input v-model.number="form.price" type="number" min="0" class="input-field w-full mt-1" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">العملة</label>
              <input v-model="form.currency" type="text" class="input-field w-full mt-1" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700">الوصف (عربي)</label>
              <textarea v-model="form.description_ar" rows="2" class="input-field w-full mt-1" dir="rtl" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700">Description (English)</label>
              <textarea v-model="form.description_en" rows="2" class="input-field w-full mt-1" dir="ltr" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">المميزات (عربي) — سطر لكل ميزة</label>
              <textarea v-model="featuresArText" rows="5" class="input-field w-full" dir="rtl" placeholder="٢ ساعة تصوير&#10;٥٠ صورة معدّلة&#10;تسليم خلال أسبوع" />
            </div>
            <div>
              <label class="text-sm font-medium text-gray-700 block mb-1">Features (English) — one per line</label>
              <textarea v-model="featuresEnText" rows="5" class="input-field w-full" dir="ltr" placeholder="2 hours session&#10;50 edited photos&#10;Delivery in 1 week" />
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="form.is_featured" type="checkbox" id="featured" class="rounded border-gray-300 text-brand-600" />
            <label for="featured" class="text-sm text-gray-700">باقة مميزة (تظهر بتصميم بارز)</label>
          </div>

          <div class="flex items-center gap-3 pt-2 border-t">
            <button @click="savePackage" :disabled="saving" class="btn-primary">
              {{ saving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
            <button @click="showModal = false" class="btn-secondary">إلغاء</button>
            <span v-if="modalError" class="text-sm text-red-600">{{ modalError }}</span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { packagesApi } from '@/api/packages';
import type { Package } from '@/types';

const packages   = ref<Package[]>([]);
const error      = ref('');
const showModal  = ref(false);
const editingId  = ref<number | null>(null);
const saving     = ref(false);
const modalError = ref('');

const featuresArText = ref('');
const featuresEnText = ref('');

const form = reactive({
  name_ar: '', name_en: '', price: 0, currency: 'ريال',
  description_ar: '', description_en: '',
  is_featured: false, sort_order: 0,
});

onMounted(load);

async function load() {
  try {
    const res = await packagesApi.list();
    packages.value = res.data;
  } catch {
    error.value = 'فشل تحميل الباقات';
  }
}

function openNew() {
  editingId.value = null;
  Object.assign(form, { name_ar: '', name_en: '', price: 0, currency: 'ريال', description_ar: '', description_en: '', is_featured: false, sort_order: 0 });
  featuresArText.value = '';
  featuresEnText.value = '';
  modalError.value = '';
  showModal.value  = true;
}

function openEdit(pkg: Package) {
  editingId.value = pkg.id;
  Object.assign(form, {
    name_ar: pkg.name_ar, name_en: pkg.name_en,
    price: pkg.price, currency: pkg.currency,
    description_ar: pkg.description_ar ?? '',
    description_en: pkg.description_en ?? '',
    is_featured: pkg.is_featured, sort_order: pkg.sort_order,
  });
  featuresArText.value = (pkg.features_ar ?? []).join('\n');
  featuresEnText.value = (pkg.features_en ?? []).join('\n');
  modalError.value = '';
  showModal.value  = true;
}

async function savePackage() {
  saving.value     = true;
  modalError.value = '';
  const payload = {
    ...form,
    features_ar: featuresArText.value.split('\n').map(s => s.trim()).filter(Boolean),
    features_en: featuresEnText.value.split('\n').map(s => s.trim()).filter(Boolean),
  };
  try {
    if (editingId.value) {
      await packagesApi.update(editingId.value, payload);
    } else {
      await packagesApi.create(payload as Omit<Package, 'id'>);
    }
    await load();
    showModal.value = false;
  } catch {
    modalError.value = 'فشل حفظ الباقة';
  } finally {
    saving.value = false;
  }
}

async function deletePkg(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذه الباقة؟')) return;
  try {
    await packagesApi.remove(id);
    packages.value = packages.value.filter(p => p.id !== id);
  } catch {
    error.value = 'فشل حذف الباقة';
  }
}
</script>
