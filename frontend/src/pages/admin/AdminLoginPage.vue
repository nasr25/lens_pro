<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-purple-700">Lens Pro</h1>
        <p class="text-gray-500 text-sm mt-1">لوحة تحكم الإدارة</p>
      </div>

      <div class="card">
        <h2 class="text-lg font-bold text-gray-800 mb-6 text-center">تسجيل الدخول</h2>

        <form @submit.prevent="onSubmit" novalidate class="space-y-4">
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">اسم المستخدم</label>
            <input
              v-model="username"
              type="text"
              class="input-field"
              autocomplete="username"
              required
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">كلمة المرور</label>
            <input
              v-model="password"
              type="password"
              class="input-field"
              autocomplete="current-password"
              required
            />
          </div>

          <div v-if="error" class="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
            {{ error }}
          </div>

          <button
            type="submit"
            class="btn-primary w-full py-3 mt-2"
            :disabled="loading"
          >
            {{ loading ? 'جاري الدخول...' : 'دخول' }}
          </button>
        </form>
      </div>

      <p class="text-center mt-4">
        <RouterLink to="/" class="text-sm text-gray-400 hover:text-gray-600">
          العودة للموقع
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const router = useRouter();
const admin  = useAdminStore();

const username = ref('');
const password = ref('');
const loading  = ref(false);
const error    = ref<string | null>(null);

async function onSubmit(): Promise<void> {
  if (!username.value || !password.value) {
    error.value = 'يرجى إدخال اسم المستخدم وكلمة المرور.';
    return;
  }

  loading.value = true;
  error.value   = null;

  try {
    await admin.login(username.value, password.value);
    router.push('/admin/dashboard');
  } catch (err: any) {
    error.value = err?.response?.data?.error ?? 'اسم المستخدم أو كلمة المرور غير صحيحة.';
  } finally {
    loading.value = false;
  }
}
</script>
