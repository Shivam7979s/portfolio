import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// GET ALL EXPERIENCES
// ─────────────────────────────────────────────────────────────
export const getAllExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    const count = await prisma.experience.count();

    if (count === 0) {
      await prisma.experience.create({
        data: {
          roleTitle: 'Full Stack Developer',
          organization: 'Infinicode',
          duration: '2025 - Present',
          description: 'Building modern web applications',
          technologies: '["React","Node.js","TypeScript"]',
          icon: '',
          order: 0,
        },
      });
    }

    const experiences = await prisma.experience.findMany({
      orderBy: [
        {
          order: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: experiences,
    });
  } catch (error) {
    console.log('❌ GET EXPERIENCES ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE EXPERIENCE
// ─────────────────────────────────────────────────────────────
export const createExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      roleTitle,
      organization,
      duration,
      description,
      technologies,
      icon,
      order,
    } = req.body;

    const experience = await prisma.experience.create({
      data: {
        roleTitle,

        organization,

        duration,

        description,

        technologies: Array.isArray(technologies)
          ? JSON.stringify(technologies)
          : technologies || '[]',

        icon: icon || '',

        order:
          order !== undefined
            ? parseInt(order)
            : 0,
      },
    });

    res.status(201).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.log('❌ CREATE EXPERIENCE ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE EXPERIENCE
// ─────────────────────────────────────────────────────────────
export const updateExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      roleTitle,
      organization,
      duration,
      description,
      technologies,
      icon,
      order,
    } = req.body;

    const experience = await prisma.experience.update({
      where: {
        id: parseInt(req.params.id as string),
      },

      data: {
        roleTitle,

        organization,

        duration,

        description,

        technologies: Array.isArray(technologies)
          ? JSON.stringify(technologies)
          : technologies || '[]',

        icon: icon || '',

        order:
          order !== undefined
            ? parseInt(order)
            : 0,
      },
    });

    res.status(200).json({
      success: true,
      data: experience,
    });
  } catch (error) {
    console.log('❌ UPDATE EXPERIENCE ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// REORDER EXPERIENCES
// ─────────────────────────────────────────────────────────────
export const reorderExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds)) {
      return next(
        createError(
          'orderIds must be an array of experience IDs',
          400
        )
      );
    }

    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.experience.update({
          where: {
            id: parseInt(id),
          },

          data: {
            order: index,
          },
        })
      )
    );

    res.status(200).json({
      success: true,
      message:
        'Experiences reordered successfully',
    });
  } catch (error) {
    console.log('❌ REORDER EXPERIENCE ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE EXPERIENCE
// ─────────────────────────────────────────────────────────────
export const deleteExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.experience.delete({
      where: {
        id: parseInt(req.params.id as string),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Experience deleted',
    });
  } catch (error) {
    console.log('❌ DELETE EXPERIENCE ERROR:', error);

    next(error);
  }
};