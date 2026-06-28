import { defineStore } from 'pinia';
import { ref } from 'vue';
import { settingsApi } from '@/api/settings';

export const useSettingsStore = defineStore('settings', () => {
  const terms        = ref('');
  const loaded       = ref(false);
  const logoUrl      = ref('');
  const aboutAr      = ref('');
  const aboutEn      = ref('');
  const socialInstagram = ref('');
  const socialTwitter   = ref('');
  const socialSnapchat  = ref('');
  const socialTiktok    = ref('');
  const socialYoutube   = ref('');
  const footerTextAr    = ref('');
  const footerTextEn    = ref('');

  async function fetchTerms(): Promise<void> {
    if (loaded.value) return;
    const res = await settingsApi.getTerms();
    terms.value  = res.data.terms;
    loaded.value = true;
  }

  async function fetchAll(): Promise<void> {
    const res = await settingsApi.adminGetAll();
    const s = res.data;
    if (s.terms_and_conditions) terms.value       = s.terms_and_conditions;
    if (s.logo_url)             logoUrl.value      = s.logo_url;
    if (s.about_ar)             aboutAr.value      = s.about_ar;
    if (s.about_en)             aboutEn.value      = s.about_en;
    if (s.social_instagram)     socialInstagram.value = s.social_instagram;
    if (s.social_twitter)       socialTwitter.value   = s.social_twitter;
    if (s.social_snapchat)      socialSnapchat.value  = s.social_snapchat;
    if (s.social_tiktok)        socialTiktok.value    = s.social_tiktok;
    if (s.social_youtube)       socialYoutube.value   = s.social_youtube;
    if (s.footer_text_ar)       footerTextAr.value    = s.footer_text_ar;
    if (s.footer_text_en)       footerTextEn.value    = s.footer_text_en;
    loaded.value = true;
  }

  return {
    terms, loaded, logoUrl, aboutAr, aboutEn,
    socialInstagram, socialTwitter, socialSnapchat, socialTiktok, socialYoutube,
    footerTextAr, footerTextEn,
    fetchTerms, fetchAll,
  };
});
