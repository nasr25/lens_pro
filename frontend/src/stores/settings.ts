import { defineStore } from 'pinia';
import { ref } from 'vue';
import { settingsApi } from '@/api/settings';

export const useSettingsStore = defineStore('settings', () => {
  const terms   = ref('');
  const loaded  = ref(false);

  async function fetchTerms(): Promise<void> {
    if (loaded.value) return;
    const res = await settingsApi.getTerms();
    terms.value  = res.data.terms;
    loaded.value = true;
  }

  return { terms, loaded, fetchTerms };
});
