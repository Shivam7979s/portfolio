import { Router } from 'express';
import {
  getAllSkills,
  createSkill,
  updateSkill,
  reorderSkills,
  deleteSkill,
} from '../controllers/skill.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getAllSkills);

// Protected (admin)
router.post(
  '/',
  protect,
  validate([
    { field: 'name', required: true },
    { field: 'category', required: true },
  ]),
  createSkill
);

router.post('/reorder', protect, reorderSkills);

router.put('/:id', protect, updateSkill);
router.delete('/:id', protect, deleteSkill);

export default router;
