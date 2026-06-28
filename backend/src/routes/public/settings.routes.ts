import { Router } from 'express';
import { getTerms, getPublicSettings } from '../../controllers/public/settings.controller';

const router = Router();

router.get('/terms',  getTerms);
router.get('/public', getPublicSettings);

export default router;
