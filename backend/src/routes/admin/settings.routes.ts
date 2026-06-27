import { Router } from 'express';
import { requireAuth } from '../../middleware/auth.middleware';
import { getAllSettings, updateSetting } from '../../controllers/admin/settings.controller';

const router = Router();

router.use(requireAuth);

router.get('/',       getAllSettings);
router.patch('/:key', updateSetting);

export default router;
