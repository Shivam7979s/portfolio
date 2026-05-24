import jwt from 'jsonwebtoken';

export const generateToken = (userId: number): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: number } => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not defined');
  return jwt.verify(token, secret) as { userId: number };
};
