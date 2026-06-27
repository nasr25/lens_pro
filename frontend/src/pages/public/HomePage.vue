<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader />

    <!-- Hero -->
    <section class="bg-gradient-to-bl from-purple-900 to-purple-700 text-white py-20 px-4">
      <div class="mx-auto max-w-3xl text-center">
        <h1 class="text-4xl sm:text-5xl font-bold mb-5">{{ t('hero_title') }}</h1>
        <p class="text-lg text-purple-200 mb-8 leading-relaxed">{{ t('hero_subtitle') }}</p>
        <a
          href="#calendar"
          class="inline-block bg-white text-purple-700 font-semibold px-8 py-3 rounded-full hover:bg-purple-50 transition-colors shadow-lg"
        >
          {{ t('hero_cta') }}
        </a>
      </div>
    </section>

    <!-- Calendar section -->
    <section id="calendar" class="mx-auto max-w-2xl px-4 py-14">
      <div class="card">
        <h2 class="text-xl font-bold text-gray-800 mb-6 text-center">{{ t('calendar_title') }}</h2>

        <div v-if="store.error" class="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {{ store.error }}
          <button class="underline ms-2" @click="reload">{{ locale.current === 'ar' ? 'إعادة المحاولة' : 'Retry' }}</button>
        </div>

        <CalendarView
          :slots="store.slots"
          :loading="store.loading"
          @slot-selected="onSlotSelected"
          @month-changed="onMonthChanged"
        />
      </div>

      <p class="text-center text-sm text-gray-500 mt-6">
        {{ locale.current === 'ar' ? 'انقر على أي موعد' : 'Click any date' }}
        <span class="inline-flex items-center gap-1">
          <span class="w-3 h-3 rounded-sm bg-green-200 ring-1 ring-green-400 inline-block" />
          {{ t('calendar_available') }}
        </span>
        {{ locale.current === 'ar' ? 'للحجز' : 'to book' }}
      </p>
    </section>

    <!-- About section -->
    <AboutSection />

    <!-- Our Work slider -->
    <OurWorkSlider />

    <!-- Packages section -->
    <PackagesSection />

    <!-- Footer -->
    <SiteFooter />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { format } from 'date-fns';
import AppHeader     from '@/components/shared/AppHeader.vue';
import CalendarView  from '@/components/public/CalendarView.vue';
import AboutSection  from '@/components/public/AboutSection.vue';
import OurWorkSlider from '@/components/public/OurWorkSlider.vue';
import PackagesSection from '@/components/public/PackagesSection.vue';
import SiteFooter    from '@/components/public/SiteFooter.vue';
import { useBookingStore } from '@/stores/booking';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from '@/composables/useI18n';
import type { SlotCalendarEntry } from '@/types';

const store    = useBookingStore();
const settings = useSettingsStore();
const router   = useRouter();
const { t, locale } = useI18n();

function onMonthChanged(month: string): void {
  store.loadSlots(month);
}

function onSlotSelected(slot: SlotCalendarEntry): void {
  store.selectSlot(slot);
  router.push({ path: '/book', query: { slotId: String(slot.id) } });
}

function reload(): void {
  const month = format(new Date(), 'yyyy-MM');
  store.loadSlots(month);
}

onMounted(async () => {
  const month = format(new Date(), 'yyyy-MM');
  store.loadSlots(month);
  try {
    await settings.fetchAll();
  } catch { /* settings are optional */ }
});
</script>
