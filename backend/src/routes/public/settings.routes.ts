import { Router } from 'express';
import { getTerms } from '../../controllers/public/settings.controller';

const router = Router();

router.get('/terms', getTerms);

export default router;
