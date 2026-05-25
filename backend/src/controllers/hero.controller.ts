import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// ─────────────────────────────────────────────────────────────
// GET HERO SECTION DATA
// ─────────────────────────────────────────────────────────────
export const getHeroData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    let hero = await prisma.heroSection.findUnique({
      where: {
        id: 1,
      },
    });

    if (!hero) {
      hero = await prisma.heroSection.create({
        data: {
          id: 1,

          name: 'Shivam Singh',

          title: 'Full Stack Developer',

          subtitle: 'AI Engineer',

          description:
            'Welcome to my portfolio',

          buttons: '[]',

          socialLinks: '[]',

          bgImage: '',

          bgVideo: '',

          profileImage: '',

          settings3D: '{}',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: hero,
    });
  } catch (error) {
    console.log('❌ HERO GET ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE HERO SECTION DATA
// ─────────────────────────────────────────────────────────────
export const updateHeroData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      title,
      subtitle,
      description,
      buttons,
      socialLinks,
      bgImage,
      bgVideo,
      profileImage,
      settings3D,
    } = req.body;

    const updatedHero =
      await prisma.heroSection.upsert({
        where: {
          id: 1,
        },

        update: {
          name,

          title,

          subtitle,

          description,

          buttons: Array.isArray(buttons)
            ? JSON.stringify(buttons)
            : buttons,

          socialLinks: Array.isArray(
            socialLinks
          )
            ? JSON.stringify(socialLinks)
            : socialLinks,

          bgImage: bgImage || '',

          bgVideo: bgVideo || '',

          profileImage:
            profileImage || '',

          settings3D:
            typeof settings3D === 'object'
              ? JSON.stringify(settings3D)
              : settings3D || '{}',
        },

        create: {
          id: 1,

          name:
            name || 'Shivam Singh',

          title:
            title || 'Full Stack Developer',

          subtitle:
            subtitle || 'AI Engineer',

          description:
            description ||
            'Welcome to my portfolio',

          buttons: Array.isArray(buttons)
            ? JSON.stringify(buttons)
            : buttons || '[]',

          socialLinks: Array.isArray(
            socialLinks
          )
            ? JSON.stringify(socialLinks)
            : socialLinks || '[]',

          bgImage: bgImage || '',

          bgVideo: bgVideo || '',

          profileImage:
            profileImage || '',

          settings3D:
            typeof settings3D === 'object'
              ? JSON.stringify(settings3D)
              : settings3D || '{}',
        },
      });

    res.status(200).json({
      success: true,
      data: updatedHero,
    });
  } catch (error) {
    console.log('❌ HERO UPDATE ERROR:', error);

    next(error);
  }
};