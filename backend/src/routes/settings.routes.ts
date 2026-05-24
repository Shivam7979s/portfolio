import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getSettings);

// Protected (admin only)
router.put('/', protect, updateSettings);

export default router;
