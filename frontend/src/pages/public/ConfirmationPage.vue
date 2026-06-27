<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div class="max-w-md w-full text-center">
      <!-- Success icon -->
      <div class="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
        <svg class="w-10 h-10 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 mb-3">تم استلام طلب الحجز</h1>
      <p class="text-gray-600 mb-2">
        سيتم مراجعة طلبك من قِبل الإدارة وإشعارك بالتأكيد في أقرب وقت.
      </p>
      <p v-if="store.lastBookingId" class="text-sm text-gray-400 mb-8">
        رقم الطلب: <span class="font-mono font-semibold">#{{ store.lastBookingId }}</span>
      </p>

      <div class="card bg-yellow-50 border border-yellow-200 mb-8 text-right">
        <h3 class="font-semibold text-yellow-800 mb-2">ماذا بعد؟</h3>
        <ul class="text-sm text-yellow-700 space-y-1 list-disc list-inside">
          <li>طلبك الآن في حالة "انتظار تأكيد الإدارة"</li>
          <li>ستتلقى إشعاراً على البريد الإلكتروني عند التأكيد (إن أدرجته)</li>
          <li>يمكنك التواصل معنا في حال الاستفسار</li>
        </ul>
      </div>

      <RouterLink to="/" class="btn-primary">
        العودة للصفحة الرئيسية
      </RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { useBookingStore } from '@/stores/booking';

const store = useBookingStore();
</script>
