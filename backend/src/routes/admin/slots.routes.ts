import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { createSlotValidators, updateSlotValidators } from '../../validators/slot.validator';
import { handleValidationErrors } from '../../middleware/validate.middleware';
import {
  listSlots,
  createSlotsHandler,
  updateSlot,
  removeSlot,
} from '../../controllers/admin/slots.controller';

const router = Router();

router.use(requireAuth);

router.get('/',      listSlots);
router.post('/',     createSlotValidators, handleValidationErrors, createSlotsHandler);
router.patch('/:id', updateSlotValidators, handleValidationErrors, updateSlot);
router.delete('/:id', removeSlot);

export default router;
