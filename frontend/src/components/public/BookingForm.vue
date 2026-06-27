<template>
  <div class="space-y-5">
    <form @submit.prevent="onSubmit" novalidate>
      <!-- Full name -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          الاسم الكامل <span class="text-red-500">*</span>
        </label>
        <input
          v-bind="fields.fullNameAttrs"
          v-model="fields.fullName.value"
          type="text"
          class="input-field"
          placeholder="محمد أحمد العمري"
          autocomplete="name"
        />
        <p v-if="errors.full_name" class="mt-1 text-xs text-red-600">{{ errors.full_name }}</p>
      </div>

      <!-- Phone -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          رقم الجوال <span class="text-red-500">*</span>
        </label>
        <input
          v-bind="fields.phoneNumberAttrs"
          v-model="fields.phoneNumber.value"
          type="tel"
          class="input-field"
          placeholder="+966 5X XXX XXXX"
          autocomplete="tel"
          dir="ltr"
        />
        <p v-if="errors.phone_number" class="mt-1 text-xs text-red-600">{{ errors.phone_number }}</p>
      </div>

      <!-- Email (optional) -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          البريد الإلكتروني <span class="text-gray-400 text-xs">(اختياري - للإشعارات)</span>
        </label>
        <input
          v-bind="fields.emailAttrs"
          v-model="fields.email.value"
          type="email"
          class="input-field"
          placeholder="example@email.com"
          autocomplete="email"
          dir="ltr"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-600">{{ errors.email }}</p>
      </div>

      <!-- Event type -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          نوع المناسبة <span class="text-red-500">*</span>
        </label>
        <select
          v-bind="fields.eventTypeAttrs"
          v-model="fields.eventType.value"
          class="input-field"
        >
          <option value="" disabled>-- اختر نوع المناسبة --</option>
          <option value="wedding">حفل زفاف</option>
          <option value="graduation">حفل تخرج</option>
          <option value="commercial">مناسبة تجارية</option>
          <option value="portrait">جلسة تصوير</option>
        </select>
        <p v-if="errors.event_type" class="mt-1 text-xs text-red-600">{{ errors.event_type }}</p>
      </div>

      <!-- Location -->
      <div class="mb-4">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          الموقع <span class="text-red-500">*</span>
        </label>
        <input
          v-bind="fields.locationAttrs"
          v-model="fields.location.value"
          type="text"
          class="input-field"
          placeholder="الرياض - قاعة الأفراح"
        />
        <p v-if="errors.location" class="mt-1 text-xs text-red-600">{{ errors.location }}</p>
      </div>

      <!-- Notes -->
      <div class="mb-5">
        <label class="block text-sm font-semibold text-gray-700 mb-1">
          ملاحظات إضافية <span class="text-gray-400 text-xs">(اختياري)</span>
        </label>
        <textarea
          v-bind="fields.notesAttrs"
          v-model="fields.notes.value"
          rows="3"
          class="input-field resize-none"
          placeholder="أي تفاصيل إضافية تريد مشاركتها..."
        />
      </div>

      <!-- Terms checkbox -->
      <div class="mb-6">
        <label class="flex items-start gap-3 cursor-pointer">
          <input
            v-bind="fields.termsAcceptedAttrs"
            v-model="fields.termsAccepted.value"
            type="checkbox"
            class="mt-0.5 h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
          />
          <span class="text-sm text-gray-700">
            أوافق على
            <button
              type="button"
              class="text-brand-600 underline hover:text-brand-800"
              @click="showTerms = true"
            >
              الشروط والأحكام
            </button>
          </span>
        </label>
        <p v-if="errors.terms_accepted" class="mt-1 text-xs text-red-600">{{ errors.terms_accepted }}</p>
      </div>

      <!-- Server error -->
      <div v-if="serverError" class="rounded-lg bg-red-50 border border-red-200 p-3 mb-4 text-sm text-red-700">
        {{ serverError }}
      </div>

      <!-- Submit -->
      <button
        type="submit"
        class="btn-primary w-full py-3"
        :disabled="submitting"
      >
        {{ submitting ? 'جاري الإرسال...' : 'إرسال طلب الحجز' }}
      </button>
    </form>

    <TermsDialog v-model="showTerms" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import TermsDialog from './TermsDialog.vue';
import { useBookingForm } from '@/composables/useBookingForm';
import { bookingsApi } from '@/api/bookings';
import { useRouter } from 'vue-router';
import { useBookingStore } from '@/stores/booking';
import type { BookingFormData } from '@/types';

const props = defineProps<{ slotId: number }>();

const router  = useRouter();
const store   = useBookingStore();
const showTerms   = ref(false);
const submitting  = ref(false);
const serverError = ref<string | null>(null);

const { handleSubmit, errors, fields } = useBookingForm(props.slotId);

const onSubmit = handleSubmit(async (values) => {
  submitting.value  = true;
  serverError.value = null;
  try {
    const res = await bookingsApi.submit({
      slot_id:        values.slot_id,
      full_name:      values.full_name,
      phone_number:   values.phone_number,
      email:          values.email ?? '',
      event_type:     values.event_type,
      location:       values.location,
      notes:          values.notes ?? '',
      terms_accepted: true,
    } as BookingFormData);

    store.lastBookingId = res.data.id;
    router.push('/confirmation');
  } catch (err: any) {
    serverError.value = err?.response?.data?.error ?? 'حدث خطأ، يرجى المحاولة لاحقاً.';
  } finally {
    submitting.value = false;
  }
});
</script>
