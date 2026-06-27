import { Router } from 'express';
import { bookingValidators } from '../../validators/booking.validator';
import { handleValidationErrors } from '../../middleware/validate.middleware';
import { bookingLimiter } from '../../middleware/rateLimiter';
import { submitBooking } from '../../controllers/public/bookings.controller';

const router = Router();

router.post('/', bookingLimiter, bookingValidators, handleValidationErrors, submitBooking);

export default router;
