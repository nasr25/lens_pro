<template>
  <section id="about" class="bg-white py-20 px-4">
    <div class="mx-auto max-w-4xl">
      <div class="text-center mb-12">
        <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{{ t('about_title') }}</h2>
        <div class="mx-auto w-16 h-1 rounded-full bg-purple-500" />
      </div>

      <div class="grid md:grid-cols-2 gap-12 items-center">
        <div class="relative">
          <div class="aspect-[4/3] rounded-2xl overflow-hidden bg-purple-100">
            <img
              src="https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=800&q=80"
              alt="about"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="absolute -bottom-4 -start-4 w-24 h-24 rounded-2xl bg-purple-600 opacity-20" />
        </div>

        <div>
          <p class="text-gray-600 leading-relaxed text-lg whitespace-pre-line">
            {{ locale.current === 'ar' ? settings.aboutAr || defaultAboutAr : settings.aboutEn || defaultAboutEn }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from '@/composables/useI18n';

const settings = useSettingsStore();
const { t, locale } = useI18n();

const defaultAboutAr = `نحن فريق من المصورين المحترفين الشغوفين بتوثيق أجمل لحظاتك.
نؤمن بأن كل لحظة تستحق أن تُخلَّد بطريقة فنية تعكس جمالها الحقيقي.

بخبرة تمتد لأكثر من عشر سنوات في مجال التصوير الاحترافي، نقدم خدماتنا لتصوير الأفراح والتخرجات والمناسبات التجارية والجلسات الخاصة.`;

const defaultAboutEn = `We are a team of passionate professional photographers dedicated to documenting your most beautiful moments.
We believe every moment deserves to be immortalized in an artistic way that reflects its true beauty.

With over ten years of experience in professional photography, we offer our services for weddings, graduations, corporate events, and private sessions.`;
</script>
