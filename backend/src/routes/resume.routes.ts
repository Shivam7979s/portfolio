import { Router } from 'express';
import {
  getAllResumes,
  getActiveResume,
  createResume,
  toggleActiveResume,
  deleteResume,
} from '../controllers/resume.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public route to get the active resume for the frontend
router.get('/active', getActiveResume);

// Protected (admin only)
router.get('/', protect, getAllResumes);
router.post(
  '/',
  protect,
  validate([
    { field: 'fileUrl', required: true },
  ]),
  createResume
);
router.put('/:id/active', protect, toggleActiveResume);
router.delete('/:id', protect, deleteResume);

export default router;
