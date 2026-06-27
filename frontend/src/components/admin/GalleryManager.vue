<template>
  <div class="card space-y-6">
    <h3 class="font-semibold text-gray-800">إدارة معرض الأعمال</h3>

    <!-- Add photo form -->
    <div class="bg-gray-50 rounded-xl p-4 space-y-3">
      <h4 class="text-sm font-medium text-gray-700">إضافة صورة جديدة</h4>
      <input v-model="newUrl" type="url" placeholder="رابط الصورة (URL)" class="input-field w-full" dir="ltr" />
      <div class="flex gap-3">
        <input v-model="newCaptionAr" type="text" placeholder="تعليق بالعربي (اختياري)" class="input-field flex-1" dir="rtl" />
        <input v-model="newCaptionEn" type="text" placeholder="Caption in English (optional)" class="input-field flex-1" dir="ltr" />
      </div>
      <button @click="addPhoto" :disabled="adding || !newUrl.trim()" class="btn-primary">
        {{ adding ? 'جاري الإضافة...' : '+ إضافة' }}
      </button>
    </div>

    <!-- Photos grid -->
    <div v-if="photos.length === 0" class="text-center text-gray-400 py-8">
      لا توجد صور. أضف صورة أعلاه.
    </div>

    <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <div
        v-for="photo in photos"
        :key="photo.id"
        class="relative group rounded-xl overflow-hidden border"
      >
        <img :src="photo.url" :alt="photo.caption_ar ?? ''" class="w-full aspect-square object-cover" />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            @click="removePhoto(photo.id)"
            class="bg-red-500 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-red-600"
            title="حذف"
          >
            ×
          </button>
        </div>
        <p v-if="photo.caption_ar" class="text-xs text-gray-600 p-1 text-center truncate">{{ photo.caption_ar }}</p>
      </div>
    </div>

    <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { galleryApi } from '@/api/gallery';
import type { GalleryPhoto } from '@/types';

const photos       = ref<GalleryPhoto[]>([]);
const newUrl       = ref('');
const newCaptionAr = ref('');
const newCaptionEn = ref('');
const adding       = ref(false);
const error        = ref('');

onMounted(async () => {
  try {
    const res = await galleryApi.list();
    photos.value = res.data;
  } catch {
    error.value = 'فشل تحميل الصور';
  }
});

async function addPhoto() {
  if (!newUrl.value.trim()) return;
  adding.value = true;
  error.value  = '';
  try {
    await galleryApi.add(newUrl.value.trim(), newCaptionAr.value.trim() || undefined, newCaptionEn.value.trim() || undefined);
    const res = await galleryApi.list();
    photos.value    = res.data;
    newUrl.value       = '';
    newCaptionAr.value = '';
    newCaptionEn.value = '';
  } catch {
    error.value = 'فشل إضافة الصورة';
  } finally {
    adding.value = false;
  }
}

async function removePhoto(id: number) {
  if (!confirm('هل أنت متأكد من حذف هذه الصورة؟')) return;
  try {
    await galleryApi.remove(id);
    photos.value = photos.value.filter(p => p.id !== id);
  } catch {
    error.value = 'فشل حذف الصورة';
  }
}
</script>
