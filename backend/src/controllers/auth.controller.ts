import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// LOGIN ADMIN
// ─────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('LOGIN ATTEMPT');
    console.log('EMAIL:', email);

    // FIND USER
    let user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // AUTO CREATE ADMIN IF DATABASE EMPTY
    if (!user && email === 'admin@gmail.com') {
      console.log('⚡ AUTO CREATING ADMIN USER');

      const hashedPassword = await bcrypt.hash(
        'Shivam@7979',
        10
      );

      user = await prisma.user.create({
        data: {
          email: 'admin@gmail.com',
          password: hashedPassword,
        },
      });
    }

    console.log('USER FOUND:', user);

    // USER NOT FOUND
    if (!user) {
      console.log('❌ USER NOT FOUND');

      return next(
        createError('Invalid email or password', 401)
      );
    }

    // CHECK PASSWORD
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    console.log('PASSWORD MATCH:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ PASSWORD INVALID');

      return next(
        createError('Invalid email or password', 401)
      );
    }

    // JWT SECRET
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return next(
        createError('JWT secret not configured', 500)
      );
    }

    // CREATE TOKEN
    const token = jwt.sign(
      {
        userId: user.id,
      },
      jwtSecret,
      {
        expiresIn: '7d',
      }
    );

    console.log('✅ LOGIN SUCCESS');

    // RESPONSE
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,

      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.log('❌ LOGIN ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// REGISTER ADMIN
// ─────────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // BLOCK IN PRODUCTION
    if (process.env.NODE_ENV === 'production') {
      return next(
        createError(
          'Registration is disabled in production',
          403
        )
      );
    }

    const { email, password } = req.body;

    // CHECK EXISTING USER
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return next(
        createError('User already exists', 409)
      );
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // CREATE USER
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Admin account created',

      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET CURRENT ADMIN
// ─────────────────────────────────────────────────────────────
export const getMe = async (
  req: Request & { userId?: number },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.userId,
      },

      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    if (!user) {
      return next(
        createError('User not found', 404)
      );
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};