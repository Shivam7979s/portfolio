import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get About Section Data ───────────────────────────────────────────────────
export const getAboutData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const about = await prisma.aboutSection.findUnique({ where: { id: 1 } });
    if (!about) {
      return next(createError('About section data not seeded', 404));
    }
    res.status(200).json({ success: true, data: about });
  } catch (error) {
    next(error);
  }
};

// ─── Update About Section Data ─────────────────────────────────────────────────
export const updateAboutData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, statsCards, highlights, personalBio, profileImage } = req.body;

    const updatedAbout = await prisma.aboutSection.update({
      where: { id: 1 },
      data: {
        title,
        description,
        statsCards: Array.isArray(statsCards) ? JSON.stringify(statsCards) : statsCards,
        highlights: Array.isArray(highlights) ? JSON.stringify(highlights) : highlights,
        personalBio,
        profileImage: profileImage || null,
      },
    });

    res.status(200).json({ success: true, data: updatedAbout });
  } catch (error) {
    next(error);
  }
};
