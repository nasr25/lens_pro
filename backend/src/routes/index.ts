import { Router } from 'express';
import publicSlotsRouter    from './public/slots.routes';
import publicBookingsRouter from './public/bookings.routes';
import publicSettingsRouter from './public/settings.routes';
import adminAuthRouter      from './admin/auth.routes';
import adminBookingsRouter  from './admin/bookings.routes';
import adminSlotsRouter     from './admin/slots.routes';
import adminSettingsRouter  from './admin/settings.routes';

const router = Router();

// Public routes
router.use('/slots',    publicSlotsRouter);
router.use('/bookings', publicBookingsRouter);
router.use('/settings', publicSettingsRouter);

// Admin routes
router.use('/admin/auth',     adminAuthRouter);
router.use('/admin/bookings', adminBookingsRouter);
router.use('/admin/slots',    adminSlotsRouter);
router.use('/admin/settings', adminSettingsRouter);

export default router;
