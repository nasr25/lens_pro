import { Router } from 'express';
import { loginLimiter } from '../../middleware/rateLimiter';
import { loginValidators } from '../../validators/auth.validator';
import { handleValidationErrors } from '../../middleware/validate.middleware';
import { requireAuth } from '../../middleware/auth.middleware';
import { login, logout, refresh } from '../../controllers/admin/auth.controller';

const router = Router();

router.post('/login',   loginLimiter, loginValidators, handleValidationErrors, login);
router.post('/logout',  requireAuth, logout);
router.post('/refresh', refresh);

export default router;
