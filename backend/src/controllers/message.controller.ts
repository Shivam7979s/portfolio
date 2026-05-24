import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get All Messages ─────────────────────────────────────────────────────────
export const getAllMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const messages = await prisma.message.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json({ success: true, data: messages });
  } catch (error) {
    next(error);
  }
};

// ─── Create Message (Contact Form) ───────────────────────────────────────────
export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, message } = req.body;
    const newMessage = await prisma.message.create({
      data: { name, email, message },
    });
    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Message Read Status ──────────────────────────────────────────────
export const toggleMessageRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id!);
    const message = await prisma.message.findUnique({ where: { id } });
    if (!message) {
      return next(createError('Message not found', 404));
    }

    const updatedMessage = await prisma.message.update({
      where: { id },
      data: { isRead: !message.isRead },
    });

    res.status(200).json({ success: true, data: updatedMessage });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Message ───────────────────────────────────────────────────────────
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.message.delete({ where: { id: parseInt(req.params.id!) } });
    res.status(200).json({ success: true, message: 'Message deleted' });
  } catch (error) {
    next(error);
  }
};
