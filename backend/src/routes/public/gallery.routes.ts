import { Router } from 'express';
import { listGallery } from '../../controllers/public/gallery.controller';
const router = Router();
router.get('/', listGallery);
export default router;
