import { Router } from 'express';
import { getAboutData, updateAboutData } from '../controllers/about.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getAboutData);

// Protected (admin only)
router.put(
  '/',
  protect,
  validate([
    { field: 'title', required: true },
    { field: 'description', required: true },
    { field: 'personalBio', required: true },
  ]),
  updateAboutData
);

export default router;
