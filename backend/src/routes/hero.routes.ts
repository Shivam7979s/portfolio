import { Router } from 'express';
import { getHeroData, updateHeroData } from '../controllers/hero.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getHeroData);

// Protected (admin only)
router.put(
  '/',
  protect,
  validate([
    { field: 'name', required: true },
    { field: 'title', required: true },
    { field: 'subtitle', required: true },
    { field: 'description', required: true },
  ]),
  updateHeroData
);

export default router;
