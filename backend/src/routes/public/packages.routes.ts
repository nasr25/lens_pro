import { Router } from 'express';
import { listPackages } from '../../controllers/public/packages.controller';
const router = Router();
router.get('/', listPackages);
export default router;
