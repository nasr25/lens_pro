import { computed } from 'vue';
import { useLocaleStore } from '../stores/locale';
import { messages } from '../lib/i18n';

export function useI18n() {
  const localeStore = useLocaleStore();

  function t(key: string): string {
    return messages[localeStore.current][key] ?? key;
  }

  const isRtl = computed(() => localeStore.current === 'ar');

  return { t, locale: localeStore, isRtl };
}
