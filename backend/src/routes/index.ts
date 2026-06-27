import { Router } from 'express';
import publicSlotsRouter    from './public/slots.routes';
import publicBookingsRouter from './public/bookings.routes';
import publicSettingsRouter from './public/settings.routes';
import publicGalleryRouter  from './public/gallery.routes';
import publicPackagesRouter from './public/packages.routes';
import adminAuthRouter      from './admin/auth.routes';
import adminBookingsRouter  from './admin/bookings.routes';
import adminSlotsRouter     from './admin/slots.routes';
import adminSettingsRouter  from './admin/settings.routes';
import adminGalleryRouter   from './admin/gallery.routes';
import adminPackagesRouter  from './admin/packages.routes';

const router = Router();

// Public routes
router.use('/slots',    publicSlotsRouter);
router.use('/bookings', publicBookingsRouter);
router.use('/settings', publicSettingsRouter);
router.use('/gallery',  publicGalleryRouter);
router.use('/packages', publicPackagesRouter);

// Admin routes
router.use('/admin/auth',     adminAuthRouter);
router.use('/admin/bookings', adminBookingsRouter);
router.use('/admin/slots',    adminSlotsRouter);
router.use('/admin/settings', adminSettingsRouter);
router.use('/admin/gallery',  adminGalleryRouter);
router.use('/admin/packages', adminPackagesRouter);

export default router;
