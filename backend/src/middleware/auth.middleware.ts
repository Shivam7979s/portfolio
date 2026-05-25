import {
  Request,
  Response,
  NextFunction,
} from 'express';

import jwt from 'jsonwebtoken';

import { createError } from './error.middleware';

// ─────────────────────────────────────────────────────────────
// AUTH REQUEST TYPE
// ─────────────────────────────────────────────────────────────
export interface AuthRequest
  extends Request {
  userId?: number;
}

// ─────────────────────────────────────────────────────────────
// PROTECT MIDDLEWARE
// ─────────────────────────────────────────────────────────────
export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 AUTH CHECK');

    // GET AUTH HEADER
    const authHeader =
      req.headers.authorization;

    console.log(
      'AUTH HEADER:',
      authHeader
    );

    // CHECK TOKEN EXISTS
    if (
      !authHeader ||
      !authHeader.startsWith('Bearer ')
    ) {
      console.log('❌ NO TOKEN PROVIDED');

      return next(
        createError(
          'Access denied. No token provided.',
          401
        )
      );
    }

    // EXTRACT TOKEN
    const token =
      authHeader.split(' ')[1];

    console.log('TOKEN:', token);

    // CHECK JWT SECRET
    const jwtSecret =
      process.env.JWT_SECRET;

    if (!jwtSecret) {
      console.log(
        '❌ JWT SECRET NOT CONFIGURED'
      );

      return next(
        createError(
          'JWT secret is not configured.',
          500
        )
      );
    }

    // VERIFY TOKEN
    const decoded = jwt.verify(
      token,
      jwtSecret
    ) as {
      userId: number;
    };

    console.log(
      '✅ TOKEN VERIFIED'
    );

    console.log(
      'USER ID:',
      decoded.userId
    );

    // SAVE USER ID
    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.log(
      '❌ AUTH ERROR:',
      error
    );

    next(
      createError(
        'Invalid or expired token.',
        401
      )
    );
  }
};