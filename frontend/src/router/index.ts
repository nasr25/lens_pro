import { createRouter, createWebHistory } from 'vue-router';
import { useAdminStore } from '@/stores/admin';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/pages/public/HomePage.vue'),
    },
    {
      path: '/book',
      component: () => import('@/pages/public/BookingPage.vue'),
    },
    {
      path: '/confirmation',
      component: () => import('@/pages/public/ConfirmationPage.vue'),
    },
    {
      path: '/admin',
      redirect: '/admin/dashboard',
    },
    {
      path: '/admin/login',
      component: () => import('@/pages/admin/AdminLoginPage.vue'),
      meta: { requiresGuest: true },
    },
    {
      path: '/admin/dashboard',
      component: () => import('@/pages/admin/AdminDashboardPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/bookings',
      component: () => import('@/pages/admin/AdminBookingsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/slots',
      component: () => import('@/pages/admin/AdminSlotsPage.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin/settings',
      component: () => import('@/pages/admin/AdminSettingsPage.vue'),
      meta: { requiresAuth: true },
    },
  ],
});

router.beforeEach(async (to, _from, next) => {
  const admin = useAdminStore();

  if (to.meta.requiresAuth) {
    if (admin.isLoggedIn) {
      next();
      return;
    }
    // Try silent refresh before redirecting
    const refreshed = await admin.tryRefresh();
    if (refreshed) {
      next();
    } else {
      next('/admin/login');
    }
    return;
  }

  if (to.meta.requiresGuest && admin.isLoggedIn) {
    next('/admin/dashboard');
    return;
  }

  next();
});

export default router;
