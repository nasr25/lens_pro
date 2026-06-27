<template>
  <section id="packages" class="bg-white py-20 px-4">
    <div class="mx-auto max-w-6xl">
      <div class="text-center mb-14">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{{ t('packages_title') }}</h2>
        <p class="text-gray-500 text-lg">{{ t('packages_subtitle') }}</p>
        <div class="mx-auto mt-3 w-16 h-1 rounded-full bg-brand-500" />
      </div>

      <div v-if="packages.length === 0 && !loading" class="text-center text-gray-400 py-16">
        <p class="text-4xl mb-3">📦</p>
        <p>لا توجد باقات متاحة حالياً</p>
      </div>

      <div
        v-else
        class="grid gap-8"
        :class="packages.length === 1 ? 'max-w-sm mx-auto' : packages.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' : 'sm:grid-cols-3'"
      >
        <div
          v-for="pkg in packages"
          :key="pkg.id"
          :class="[
            'relative rounded-2xl border p-8 flex flex-col transition-all duration-300',
            pkg.is_featured
              ? 'bg-brand-700 text-white border-brand-700 shadow-2xl shadow-brand-200 scale-105'
              : 'bg-white text-gray-900 border-gray-200 hover:border-brand-300 hover:shadow-lg',
          ]"
        >
          <!-- Featured badge -->
          <div
            v-if="pkg.is_featured"
            class="absolute -top-4 start-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap"
          >
            ★ {{ t('packages_featured') }}
          </div>

          <!-- Package name -->
          <h3 class="text-xl font-bold mb-2">
            {{ locale.current === 'ar' ? pkg.name_ar : pkg.name_en }}
          </h3>

          <!-- Description -->
          <p
            v-if="locale.current === 'ar' ? pkg.description_ar : pkg.description_en"
            :class="['text-sm mb-4', pkg.is_featured ? 'text-brand-200' : 'text-gray-500']"
          >
            {{ locale.current === 'ar' ? pkg.description_ar : pkg.description_en }}
          </p>

          <!-- Price -->
          <div class="my-4">
            <span class="text-4xl font-bold">
              {{ Number(pkg.price).toLocaleString(locale.current === 'ar' ? 'ar-SA' : 'en-SA') }}
            </span>
            <span :class="['text-sm ms-1', pkg.is_featured ? 'text-brand-200' : 'text-gray-500']">
              {{ locale.current === 'ar' ? pkg.currency : 'SAR' }}
            </span>
          </div>

          <div :class="['border-t mb-6', pkg.is_featured ? 'border-brand-500' : 'border-gray-100']" />

          <!-- Features -->
          <ul class="flex-1 space-y-3 mb-8">
            <li
              v-for="(feat, i) in (locale.current === 'ar' ? pkg.features_ar : pkg.features_en)"
              :key="i"
              class="flex items-start gap-2 text-sm"
            >
              <span :class="['mt-0.5 shrink-0 text-base', pkg.is_featured ? 'text-amber-300' : 'text-brand-500']">✓</span>
              <span>{{ feat }}</span>
            </li>
          </ul>

          <!-- CTA -->
          <RouterLink
            to="/book"
            :class="[
              'block text-center rounded-xl py-3 font-semibold transition-all',
              pkg.is_featured
                ? 'bg-white text-brand-700 hover:bg-brand-50'
                : 'bg-brand-700 text-white hover:bg-brand-800',
            ]"
          >
            {{ t('packages_book') }}
          </RouterLink>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { packagesApi } from '@/api/packages';
import { useI18n } from '@/composables/useI18n';
import type { Package } from '@/types';

const { t, locale } = useI18n();

const packages = ref<Package[]>([]);
const loading  = ref(true);

const DUMMY_PACKAGES: Package[] = [
  {
    id: 1, sort_order: 0, is_featured: false,
    name_ar: 'الباقة الأساسية', name_en: 'Basic',
    price: 800, currency: 'ريال',
    description_ar: 'مثالية للجلسات البسيطة والمناسبات الصغيرة',
    description_en: 'Perfect for simple sessions and small occasions',
    features_ar: ['ساعتان تصوير', '٥٠ صورة معدّلة', 'تسليم خلال ٧ أيام', 'موقع واحد'],
    features_en: ['2 hours shooting', '50 edited photos', 'Delivery in 7 days', 'One location'],
  },
  {
    id: 2, sort_order: 1, is_featured: true,
    name_ar: 'الباقة الاحترافية', name_en: 'Professional',
    price: 1500, currency: 'ريال',
    description_ar: 'الأكثر طلباً — تجربة تصوير متكاملة لا تُنسى',
    description_en: 'Most popular — a complete unforgettable photography experience',
    features_ar: ['٤ ساعات تصوير', '١٥٠ صورة معدّلة', 'تسليم خلال ٣ أيام', 'موقعان', 'تصميم قصة إنستغرام'],
    features_en: ['4 hours shooting', '150 edited photos', 'Delivery in 3 days', 'Two locations', 'Instagram story design'],
  },
  {
    id: 3, sort_order: 2, is_featured: false,
    name_ar: 'الباقة المميزة', name_en: 'Premium',
    price: 2500, currency: 'ريال',
    description_ar: 'تغطية شاملة ليوم كامل بأعلى جودة احترافية',
    description_en: 'Full-day comprehensive coverage with the highest professional quality',
    features_ar: ['يوم كامل تصوير', 'صور غير محدودة', 'تسليم فوري', 'مواقع متعددة', 'فيديو تذكاري', 'ألبوم طباعة فاخر'],
    features_en: ['Full day shooting', 'Unlimited photos', 'Immediate delivery', 'Multiple locations', 'Memorial video', 'Luxury print album'],
  },
];

onMounted(async () => {
  try {
    const res = await packagesApi.list();
    packages.value = res.data.length > 0 ? res.data : DUMMY_PACKAGES;
  } catch {
    packages.value = DUMMY_PACKAGES;
  }
  loading.value = false;
});
</script>
