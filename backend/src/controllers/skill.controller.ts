import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get All Skills ───────────────────────────────────────────────────────────
export const getAllSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [
        { order: 'asc' },
        { category: 'asc' },
      ],
    });
    res.status(200).json({ success: true, data: skills });
  } catch (error) {
    next(error);
  }
};

// ─── Create Skill ─────────────────────────────────────────────────────────────
export const createSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, category, icon, level, order } = req.body;
    const skill = await prisma.skill.create({
      data: {
        name,
        category,
        icon: icon || null,
        level: level !== undefined ? parseInt(level) : 80,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(201).json({ success: true, data: skill });
  } catch (error) {
    next(error);
  }
};

// ─── Update Skill ─────────────────────────────────────────────────────────────
export const updateSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, category, icon, level, order } = req.body;
    const skill = await prisma.skill.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        name,
        category,
        icon: icon || null,
        level: level !== undefined ? parseInt(level) : 80,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(200).json({ success: true, data: skill });
  } catch (error) {
    next(error);
  }
};

// ─── Reorder Skills ───────────────────────────────────────────────────────────
export const reorderSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body; // Array of IDs in preferred order [3, 1, 2]
    if (!Array.isArray(orderIds)) {
      return next(createError('orderIds must be an array of skill IDs', 400));
    }

    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.skill.update({
          where: { id: parseInt(id) },
          data: { order: index },
        })
      )
    );

    res.status(200).json({ success: true, message: 'Skills reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Skill ─────────────────────────────────────────────────────────────
export const deleteSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.skill.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(200).json({ success: true, message: 'Skill deleted' });
  } catch (error) {
    next(error);
  }
};
