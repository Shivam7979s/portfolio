import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  reorderProjects,
  deleteProject,
} from '../controllers/project.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public
router.get('/', getAllProjects);
router.get('/:id', getProjectById);

// Protected (admin)
router.post(
  '/',
  protect,
  validate([
    { field: 'title', required: true },
    { field: 'description', required: true },
    { field: 'techStack', required: true },
  ]),
  createProject
);

router.post('/reorder', protect, reorderProjects);

router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

export default router;
