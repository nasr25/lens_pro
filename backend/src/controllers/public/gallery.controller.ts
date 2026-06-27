import { Request, Response, NextFunction } from 'express';
import { getGalleryPhotos } from '../../services/gallery.service';

export async function listGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const photos = await getGalleryPhotos();
    res.json(photos);
  } catch (err) { next(err); }
}
