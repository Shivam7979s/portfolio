import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Login Admin ──────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return next(createError('Invalid email or password', 401));
    }

    console.log('EMAIL:', email);
console.log('PASSWORD:', password);
console.log('USER:', user);

const isPasswordValid = await bcrypt.compare(password, user.password);

console.log('PASSWORD MATCH:', isPasswordValid);
    if (!isPasswordValid) {
      return next(createError('Invalid email or password', 401));
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return next(createError('JWT secret not configured', 500));
    }

    const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: '7d' });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Register Admin (setup only — disable in production) ──────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return next(createError('Registration is disabled in production', 403));
    }

    const { email, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return next(createError('User already exists', 409));
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created',
      user: { id: user.id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Current Admin ────────────────────────────────────────────────────────
export const getMe = async (
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, createdAt: true },
    });

    if (!user) {
      return next(createError('User not found', 404));
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};
