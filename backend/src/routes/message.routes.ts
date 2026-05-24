import { Router } from 'express';
import {
  getAllMessages,
  createMessage,
  toggleMessageRead,
  deleteMessage,
} from '../controllers/message.controller';
import { protect } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

// Public — contact form submission
router.post(
  '/',
  validate([
    { field: 'name', required: true, minLength: 2 },
    { field: 'email', required: true, type: 'email' },
    { field: 'message', required: true, minLength: 10 },
  ]),
  createMessage
);

// Protected (admin only)
router.get('/', protect, getAllMessages);
router.put('/:id/toggle-read', protect, toggleMessageRead);
router.delete('/:id', protect, deleteMessage);

export default router;
