import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import {
  listBookings,
  getBooking,
  confirm,
  reject,
  remove,
  dashboardStats,
} from '../../controllers/admin/bookings.controller';

const router = Router();

router.use(requireAuth);

router.get('/stats', dashboardStats);
router.get('/',      listBookings);
router.get('/:id',   getBooking);
router.patch('/:id/confirm', confirm);
router.patch('/:id/reject',  reject);
router.delete('/:id', remove);

export default router;
