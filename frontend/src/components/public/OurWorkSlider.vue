<template>
  <section id="work" class="bg-gray-50 py-20 px-4">
    <div class="mx-auto max-w-7xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{{ t('work_title') }}</h2>
        <p class="text-gray-500 text-lg">{{ t('work_subtitle') }}</p>
        <div class="mx-auto mt-3 w-16 h-1 rounded-full bg-brand-500" />
      </div>

      <div v-if="photos.length === 0 && !loading" class="text-center text-gray-400 py-16">
        <p class="text-4xl mb-3">📷</p>
        <p>لا توجد صور حتى الآن</p>
      </div>

      <div v-else class="relative">
        <!-- Slider track -->
        <div class="overflow-hidden rounded-2xl">
          <div
            class="flex transition-transform duration-500 ease-in-out"
            :style="{ transform: `translateX(${isRtl ? '' : '-'}${currentIndex * (100 / visibleCount)}%)` }"
          >
            <div
              v-for="photo in photos"
              :key="photo.id"
              class="shrink-0 px-2"
              :style="{ width: `${100 / visibleCount}%` }"
            >
              <div class="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200">
                <img
                  :src="photo.url"
                  :alt="locale.current === 'ar' ? photo.caption_ar ?? '' : photo.caption_en ?? ''"
                  class="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <p
                v-if="locale.current === 'ar' ? photo.caption_ar : photo.caption_en"
                class="mt-2 text-center text-sm text-gray-600"
              >
                {{ locale.current === 'ar' ? photo.caption_ar : photo.caption_en }}
              </p>
            </div>
          </div>
        </div>

        <!-- Arrows -->
        <button
          v-if="canGoPrev"
          @click="prev"
          class="absolute top-1/2 -translate-y-1/2 start-0 -translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-brand-50 transition-colors"
          aria-label="السابق"
        >
          <svg class="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRtl ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'" />
          </svg>
        </button>
        <button
          v-if="canGoNext"
          @click="next"
          class="absolute top-1/2 -translate-y-1/2 end-0 translate-x-4 z-10 w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center hover:bg-brand-50 transition-colors"
          aria-label="التالي"
        >
          <svg class="w-5 h-5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              :d="isRtl ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'" />
          </svg>
        </button>

        <!-- Dots -->
        <div class="flex justify-center gap-2 mt-6">
          <button
            v-for="(_, i) in dotCount"
            :key="i"
            @click="goTo(i)"
            :class="[
              'w-2.5 h-2.5 rounded-full transition-all duration-300',
              i === activeDot ? 'bg-brand-600 w-6' : 'bg-gray-300 hover:bg-gray-400',
            ]"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { galleryApi } from '@/api/gallery';
import { useI18n } from '@/composables/useI18n';
import type { GalleryPhoto } from '@/types';

const { t, locale, isRtl } = useI18n();

const photos     = ref<GalleryPhoto[]>([]);
const loading    = ref(true);
const currentIndex = ref(0);

const visibleCount = computed(() => {
  if (typeof window === 'undefined') return 3;
  return window.innerWidth < 640 ? 1 : window.innerWidth < 1024 ? 2 : 3;
});

const maxIndex  = computed(() => Math.max(0, photos.value.length - visibleCount.value));
const canGoPrev = computed(() => currentIndex.value > 0);
const canGoNext = computed(() => currentIndex.value < maxIndex.value);
const dotCount  = computed(() => Math.ceil(photos.value.length / visibleCount.value));
const activeDot = computed(() => Math.round(currentIndex.value / visibleCount.value));

function prev() { if (canGoPrev.value) currentIndex.value--; }
function next() { if (canGoNext.value) currentIndex.value++; }
function goTo(dotIndex: number) { currentIndex.value = Math.min(dotIndex * visibleCount.value, maxIndex.value); }

let timer: ReturnType<typeof setInterval> | null = null;

function startAutoPlay() {
  timer = setInterval(() => {
    if (canGoNext.value) next();
    else currentIndex.value = 0;
  }, 4000);
}

function stopAutoPlay() {
  if (timer) clearInterval(timer);
}

function svgPhoto(gradient: string, icon: string, label: string): string {
  return `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600'><defs><linearGradient id='g' x1='0%25' y1='0%25' x2='100%25' y2='100%25'>${gradient}</linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><text x='400' y='270' font-family='sans-serif' font-size='80' text-anchor='middle' fill='white' opacity='0.9'>${icon}</text><text x='400' y='360' font-family='sans-serif' font-size='32' text-anchor='middle' fill='white' opacity='0.85'>${label}</text></svg>`;
}

const DUMMY_PHOTOS: GalleryPhoto[] = [
  { id: 1, sort_order: 0, caption_ar: 'تصوير حفل زفاف',       caption_en: 'Wedding Photography',
    url: svgPhoto("<stop offset='0%25' stop-color='%231c79aa'/><stop offset='100%25' stop-color='%232b95cc'/>", '💍', 'Wedding') },
  { id: 2, sort_order: 1, caption_ar: 'جلسة عروس',             caption_en: 'Bridal Session',
    url: svgPhoto("<stop offset='0%25' stop-color='%23186390'/><stop offset='100%25' stop-color='%231c79aa'/>", '👰', 'Bridal') },
  { id: 3, sort_order: 2, caption_ar: 'حفل تخرج',              caption_en: 'Graduation Ceremony',
    url: svgPhoto("<stop offset='0%25' stop-color='%23134264'/><stop offset='100%25' stop-color='%23186390'/>", '🎓', 'Graduation') },
  { id: 4, sort_order: 3, caption_ar: 'تصوير طبيعي',           caption_en: 'Nature Photography',
    url: svgPhoto("<stop offset='0%25' stop-color='%232b95cc'/><stop offset='100%25' stop-color='%2349aedf'/>", '🌿', 'Nature') },
  { id: 5, sort_order: 4, caption_ar: 'جلسة بورتريه',          caption_en: 'Portrait Session',
    url: svgPhoto("<stop offset='0%25' stop-color='%231c79aa'/><stop offset='100%25' stop-color='%237dc7eb'/>", '📸', 'Portrait') },
  { id: 6, sort_order: 5, caption_ar: 'تصوير مناسبة تجارية',  caption_en: 'Corporate Event',
    url: svgPhoto("<stop offset='0%25' stop-color='%23165278'/><stop offset='100%25' stop-color='%231c79aa'/>", '🏢', 'Corporate') },
];

onMounted(async () => {
  try {
    const res = await galleryApi.list();
    photos.value = res.data.length > 0 ? res.data : DUMMY_PHOTOS;
  } catch {
    photos.value = DUMMY_PHOTOS;
  }
  loading.value = false;
  startAutoPlay();
});

onUnmounted(stopAutoPlay);
</script>
