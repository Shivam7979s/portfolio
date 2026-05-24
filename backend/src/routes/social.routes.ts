import { Router } from 'express';
import { getSocialLinks, updateSocialLinks } from '../controllers/social.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public
router.get('/', getSocialLinks);

// Protected (admin only)
router.put('/', protect, updateSocialLinks);

export default router;
