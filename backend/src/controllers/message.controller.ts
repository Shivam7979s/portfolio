import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// GET ALL MESSAGES
// ─────────────────────────────────────────────────────────────
export const getAllMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    const count = await prisma.message.count();

    if (count === 0) {
      await prisma.message.create({
        data: {
          name: 'Shivam',
          email: 'admin@gmail.com',
          message: 'Welcome to dashboard',
          isRead: false,
        },
      });
    }

    const messages = await prisma.message.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.log('❌ GET MESSAGES ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE MESSAGE (CONTACT FORM)
// ─────────────────────────────────────────────────────────────
export const createMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, message } =
      req.body;

    // VALIDATION
    if (!name || !email || !message) {
      return next(
        createError(
          'All fields are required',
          400
        )
      );
    }

    const newMessage =
      await prisma.message.create({
        data: {
          name,
          email,
          message,
          isRead: false,
        },
      });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: newMessage,
    });
  } catch (error) {
    console.log('❌ CREATE MESSAGE ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// TOGGLE MESSAGE READ STATUS
// ─────────────────────────────────────────────────────────────
export const toggleMessageRead = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(
      req.params.id as string
    );

    const message =
      await prisma.message.findUnique({
        where: {
          id,
        },
      });

    if (!message) {
      return next(
        createError('Message not found', 404)
      );
    }

    const updatedMessage =
      await prisma.message.update({
        where: {
          id,
        },

        data: {
          isRead: !message.isRead,
        },
      });

    res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    console.log(
      '❌ TOGGLE MESSAGE ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE MESSAGE
// ─────────────────────────────────────────────────────────────
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.message.delete({
      where: {
        id: parseInt(
          req.params.id as string
        ),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Message deleted',
    });
  } catch (error) {
    console.log(
      '❌ DELETE MESSAGE ERROR:',
      error
    );

    next(error);
  }
};