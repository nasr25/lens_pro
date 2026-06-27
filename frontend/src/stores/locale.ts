import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { Locale } from '../lib/i18n';

export const useLocaleStore = defineStore('locale', () => {
  const saved = localStorage.getItem('locale') as Locale | null;
  const current = ref<Locale>(saved ?? 'ar');

  function apply(loc: Locale) {
    document.documentElement.lang = loc;
    document.documentElement.dir = loc === 'ar' ? 'rtl' : 'ltr';
  }

  apply(current.value);

  watch(current, (loc) => {
    localStorage.setItem('locale', loc);
    apply(loc);
  });

  function toggleLocale() {
    current.value = current.value === 'ar' ? 'en' : 'ar';
  }

  return { current, toggleLocale };
});
