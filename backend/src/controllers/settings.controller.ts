import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// ─────────────────────────────────────────────────────────────
// GET GLOBAL SETTINGS
// ─────────────────────────────────────────────────────────────
export const getSettings = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    let settings = await prisma.settings.findUnique({
      where: {
        id: 1,
      },
    });

    if (!settings) {
      settings = await prisma.settings.create({
        data: {
          id: 1,

          themeColors: '{}',

          logoText: 'CINEMATIC',

          logoImage: '',

          seoTitle: 'Shivam Portfolio',

          seoDescription:
            'Full Stack Developer Portfolio',

          seoKeywords:
            'portfolio,developer,react',

          favicon: '',

          openGraphImage: '',

          customCursor: true,

          particleEffects: true,

          contactEmail:
            'admin@gmail.com',

          contactPhone:
            '9999999999',

          contactLocation: 'India',

          contactCTA: 'Contact Me',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    console.log('❌ GET SETTINGS ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE GLOBAL SETTINGS
// ─────────────────────────────────────────────────────────────
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

    const updatedSettings =
      await prisma.settings.upsert({
        where: {
          id: 1,
        },

        update: {
          themeColors:
            typeof themeColors ===
            'object'
              ? JSON.stringify(
                  themeColors
                )
              : themeColors || '{}',

          logoText:
            logoText || '',

          logoImage:
            logoImage || '',

          seoTitle:
            seoTitle || '',

          seoDescription:
            seoDescription || '',

          seoKeywords:
            seoKeywords || '',

          favicon:
            favicon || '',

          openGraphImage:
            openGraphImage || '',

          customCursor:
            customCursor === true ||
            customCursor === 'true',

          particleEffects:
            particleEffects ===
              true ||
            particleEffects ===
              'true',

          contactEmail:
            contactEmail || '',

          contactPhone:
            contactPhone || '',

          contactLocation:
            contactLocation || '',

          contactCTA:
            contactCTA || '',
        },

        create: {
          id: 1,

          themeColors:
            typeof themeColors ===
            'object'
              ? JSON.stringify(
                  themeColors
                )
              : themeColors || '{}',

          logoText:
            logoText || 'CINEMATIC',

          logoImage:
            logoImage || '',

          seoTitle:
            seoTitle ||
            'Shivam Portfolio',

          seoDescription:
            seoDescription ||
            'Full Stack Developer Portfolio',

          seoKeywords:
            seoKeywords ||
            'portfolio,developer,react',

          favicon:
            favicon || '',

          openGraphImage:
            openGraphImage || '',

          customCursor:
            customCursor === true ||
            customCursor === 'true',

          particleEffects:
            particleEffects ===
              true ||
            particleEffects ===
              'true',

          contactEmail:
            contactEmail ||
            'admin@gmail.com',

          contactPhone:
            contactPhone ||
            '9999999999',

          contactLocation:
            contactLocation ||
            'India',

          contactCTA:
            contactCTA ||
            'Contact Me',
        },
      });

    res.status(200).json({
      success: true,
      data: updatedSettings,
    });
  } catch (error) {
    console.log(
      '❌ UPDATE SETTINGS ERROR:',
      error
    );

    next(error);
  }
};