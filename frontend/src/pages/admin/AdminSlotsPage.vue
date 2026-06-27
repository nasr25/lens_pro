<template>
  <div class="min-h-screen bg-gray-100">
    <AdminNav />
    <main class="mx-auto max-w-4xl px-4 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">إدارة الأوقات المتاحة</h1>
      <SlotManager />
    </main>
  </div>
</template>

<script setup lang="ts">
import AdminNav from '@/components/admin/AdminNav.vue';
import SlotManager from '@/components/admin/SlotManager.vue';
</script>
