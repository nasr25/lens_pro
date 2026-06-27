import { Request, Response, NextFunction } from 'express';
import { getGalleryPhotos, addGalleryPhoto, deleteGalleryPhoto, reorderPhotos } from '../../services/gallery.service';

export async function listPhotos(req: Request, res: Response, next: NextFunction): Promise<void> {
  try { res.json(await getGalleryPhotos()); } catch (e) { next(e); }
}

export async function addPhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { url, caption_ar, caption_en, sort_order } = req.body;
    const id = await addGalleryPhoto({ url, caption_ar, caption_en, sort_order: sort_order ?? 0 });
    res.status(201).json({ id });
  } catch (e) { next(e); }
}

export async function removePhoto(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ok = await deleteGalleryPhoto(parseInt(req.params.id));
    if (!ok) { res.status(404).json({ error: 'Photo not found' }); return; }
    res.json({ message: 'Deleted' });
  } catch (e) { next(e); }
}

export async function reorder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await reorderPhotos(req.body.ids);
    res.json({ message: 'Reordered' });
  } catch (e) { next(e); }
}
