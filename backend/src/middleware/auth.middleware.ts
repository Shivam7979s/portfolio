import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { createError } from './error.middleware';

export interface AuthRequest extends Request {
  userId?: number;
}

export const protect = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(createError('Access denied. No token provided.', 401));
    }

    const token = authHeader.split(' ')[1];
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      return next(createError('JWT secret is not configured.', 500));
    }

    const decoded = jwt.verify(token, jwtSecret) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    next(createError('Invalid or expired token.', 401));
  }
};
