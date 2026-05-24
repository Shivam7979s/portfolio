import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get All Experiences ──────────────────────────────────────────────────────
export const getAllExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.status(200).json({ success: true, data: experiences });
  } catch (error) {
    next(error);
  }
};

// ─── Create Experience ────────────────────────────────────────────────────────
export const createExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleTitle, organization, duration, description, technologies, icon, order } = req.body;
    const experience = await prisma.experience.create({
      data: {
        roleTitle,
        organization,
        duration,
        description,
        technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
        icon: icon || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(201).json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// ─── Update Experience ────────────────────────────────────────────────────────
export const updateExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { roleTitle, organization, duration, description, technologies, icon, order } = req.body;
    const experience = await prisma.experience.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        roleTitle,
        organization,
        duration,
        description,
        technologies: Array.isArray(technologies) ? JSON.stringify(technologies) : (technologies || '[]'),
        icon: icon || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(200).json({ success: true, data: experience });
  } catch (error) {
    next(error);
  }
};

// ─── Reorder Experiences ──────────────────────────────────────────────────────
export const reorderExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body; // Array of IDs in preferred order [3, 1, 2]
    if (!Array.isArray(orderIds)) {
      return next(createError('orderIds must be an array of experience IDs', 400));
    }

    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.experience.update({
          where: { id: parseInt(id) },
          data: { order: index },
        })
      )
    );

    res.status(200).json({ success: true, message: 'Experiences reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Experience ────────────────────────────────────────────────────────
export const deleteExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.experience.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(200).json({ success: true, message: 'Experience deleted' });
  } catch (error) {
    next(error);
  }
};
