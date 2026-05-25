import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';

// ─── Get About Section Data ───────────────────────────────────────────────────
export const getAboutData = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // FIND EXISTING DATA
    let about = await prisma.aboutSection.findUnique({
      where: {
        id: 1,
      },
    });

    // AUTO CREATE DEFAULT DATA IF EMPTY
    if (!about) {
      about = await prisma.aboutSection.create({
        data: {
          id: 1,
          title: 'About Me',
          description: 'Full Stack Developer',
          statsCards: '[]',
          highlights: '[]',
          personalBio: 'Welcome to the admin dashboard',
          profileImage: '',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: about,
    });
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
    const {
      title,
      description,
      statsCards,
      highlights,
      personalBio,
      profileImage,
    } = req.body;

    // UPSERT = UPDATE IF EXISTS, CREATE IF NOT
    const updatedAbout = await prisma.aboutSection.upsert({
      where: {
        id: 1,
      },

      update: {
        title,
        description,

        statsCards: Array.isArray(statsCards)
          ? JSON.stringify(statsCards)
          : statsCards,

        highlights: Array.isArray(highlights)
          ? JSON.stringify(highlights)
          : highlights,

        personalBio,

        profileImage: profileImage || '',
      },

      create: {
        id: 1,

        title: title || 'About Me',

        description:
          description || 'Full Stack Developer',

        statsCards: Array.isArray(statsCards)
          ? JSON.stringify(statsCards)
          : statsCards || '[]',

        highlights: Array.isArray(highlights)
          ? JSON.stringify(highlights)
          : highlights || '[]',

        personalBio:
          personalBio || 'Welcome to the admin dashboard',

        profileImage: profileImage || '',
      },
    });

    res.status(200).json({
      success: true,
      data: updatedAbout,
    });
  } catch (error) {
    next(error);
  }
};