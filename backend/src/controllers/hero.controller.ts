import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get Hero Section Data ───────────────────────────────────────────────────
export const getHeroData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const hero = await prisma.heroSection.findUnique({ where: { id: 1 } });
    if (!hero) {
      return next(createError('Hero section data not seeded', 404));
    }
    res.status(200).json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
};

// ─── Update Hero Section Data ─────────────────────────────────────────────────
export const updateHeroData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, title, subtitle, description, buttons, socialLinks, bgImage, bgVideo, profileImage, settings3D } = req.body;

    const updatedHero = await prisma.heroSection.update({
      where: { id: 1 },
      data: {
        name,
        title,
        subtitle,
        description,
        buttons: Array.isArray(buttons) ? JSON.stringify(buttons) : buttons,
        socialLinks: Array.isArray(socialLinks) ? JSON.stringify(socialLinks) : socialLinks,
        bgImage: bgImage || null,
        bgVideo: bgVideo || null,
        profileImage: profileImage || null,
        settings3D: typeof settings3D === 'object' ? JSON.stringify(settings3D) : settings3D,
      },
    });

    res.status(200).json({ success: true, data: updatedHero });
  } catch (error) {
    next(error);
  }
};
