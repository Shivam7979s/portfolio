import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get Global Settings ──────────────────────────────────────────────────────
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 1 } });
    if (!settings) {
      return next(createError('Settings not seeded', 404));
    }
    res.status(200).json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

// ─── Update Global Settings ────────────────────────────────────────────────────
export const updateSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      themeColors,
      logoText,
      logoImage,
      seoTitle,
      seoDescription,
      seoKeywords,
      favicon,
      openGraphImage,
      customCursor,
      particleEffects,
      contactEmail,
      contactPhone,
      contactLocation,
      contactCTA,
    } = req.body;

    const updatedSettings = await prisma.settings.update({
      where: { id: 1 },
      data: {
        themeColors: typeof themeColors === 'object' ? JSON.stringify(themeColors) : themeColors,
        logoText: logoText || null,
        logoImage: logoImage || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        seoKeywords: seoKeywords || null,
        favicon: favicon || null,
        openGraphImage: openGraphImage || null,
        customCursor: customCursor === true || customCursor === 'true',
        particleEffects: particleEffects === true || particleEffects === 'true',
        contactEmail: contactEmail || null,
        contactPhone: contactPhone || null,
        contactLocation: contactLocation || null,
        contactCTA: contactCTA || null,
      },
    });

    res.status(200).json({ success: true, data: updatedSettings });
  } catch (error) {
    next(error);
  }
};
