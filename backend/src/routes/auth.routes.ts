import { Router } from 'express';
import { login, register, getMe } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

router.post(
  '/login',
  validate([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, minLength: 6 },
  ]),
  login
);

router.post(
  '/register',
  validate([
    { field: 'email', required: true, type: 'email' },
    { field: 'password', required: true, minLength: 6 },
  ]),
  register
);

router.get('/me', protect, getMe);

export default router;
