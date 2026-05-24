import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get Social Links ─────────────────────────────────────────────────────────
export const getSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const social = await prisma.socialLinks.findUnique({ where: { id: 1 } });
    if (!social) {
      return next(createError('Social links not seeded', 404));
    }
    res.status(200).json({ success: true, data: social });
  } catch (error) {
    next(error);
  }
};

// ─── Update Social Links ───────────────────────────────────────────────────────
export const updateSocialLinks = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { github, linkedin, twitter, instagram, portfolio, youtube, leetcode, codeforces } = req.body;

    const updatedSocial = await prisma.socialLinks.update({
      where: { id: 1 },
      data: {
        github: github || null,
        linkedin: linkedin || null,
        twitter: twitter || null,
        instagram: instagram || null,
        portfolio: portfolio || null,
        youtube: youtube || null,
        leetcode: leetcode || null,
        codeforces: codeforces || null,
      },
    });

    res.status(200).json({ success: true, data: updatedSocial });
  } catch (error) {
    next(error);
  }
};
