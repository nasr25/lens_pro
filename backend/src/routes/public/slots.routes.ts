import { Router } from 'express';
import { slotMonthQueryValidator } from '../../validators/slot.validator';
import { handleValidationErrors } from '../../middleware/validate.middleware';
import { listCalendarSlots } from '../../controllers/public/slots.controller';

const router = Router();

router.get('/', slotMonthQueryValidator, handleValidationErrors, listCalendarSlots);

export default router;
