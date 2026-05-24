import { Router } from 'express';
import {
  getAllExperiences,
  createExperience,
  updateExperience,
  reorderExperiences,
  deleteExperience,
} from '../controllers/experience.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getAllExperiences);

// Protected (admin only)
router.post(
  '/',
  protect,
  validate([
    { field: 'roleTitle', required: true },
    { field: 'organization', required: true },
    { field: 'duration', required: true },
    { field: 'description', required: true },
  ]),
  createExperience
);

router.post('/reorder', protect, reorderExperiences);

router.put('/:id', protect, updateExperience);
router.delete('/:id', protect, deleteExperience);

export default router;
