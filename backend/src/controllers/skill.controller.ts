import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// GET ALL SKILLS
// ─────────────────────────────────────────────────────────────
export const getAllSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    const count = await prisma.skill.count();

    if (count === 0) {
      await prisma.skill.create({
        data: {
          name: 'React',

          category: 'Frontend',

          icon: '',

          level: 90,

          order: 0,
        },
      });
    }

    const skills = await prisma.skill.findMany({
      orderBy: [
        {
          order: 'asc',
        },
        {
          category: 'asc',
        },
      ],
    });

    res.status(200).json({
      success: true,
      data: skills,
    });
  } catch (error) {
    console.log('❌ GET SKILLS ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE SKILL
// ─────────────────────────────────────────────────────────────
export const createSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      category,
      icon,
      level,
      order,
    } = req.body;

    // VALIDATION
    if (!name || !category) {
      return next(
        createError(
          'Name and category are required',
          400
        )
      );
    }

    const skill =
      await prisma.skill.create({
        data: {
          name,

          category,

          icon: icon || '',

          level:
            level !== undefined
              ? parseInt(level)
              : 80,

          order:
            order !== undefined
              ? parseInt(order)
              : 0,
        },
      });

    res.status(201).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.log('❌ CREATE SKILL ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE SKILL
// ─────────────────────────────────────────────────────────────
export const updateSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      name,
      category,
      icon,
      level,
      order,
    } = req.body;

    const skill =
      await prisma.skill.update({
        where: {
          id: parseInt(
            req.params.id as string
          ),
        },

        data: {
          name,

          category,

          icon: icon || '',

          level:
            level !== undefined
              ? parseInt(level)
              : 80,

          order:
            order !== undefined
              ? parseInt(order)
              : 0,
        },
      });

    res.status(200).json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.log('❌ UPDATE SKILL ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// REORDER SKILLS
// ─────────────────────────────────────────────────────────────
export const reorderSkills = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds)) {
      return next(
        createError(
          'orderIds must be an array of skill IDs',
          400
        )
      );
    }

    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.skill.update({
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
        'Skills reordered successfully',
    });
  } catch (error) {
    console.log(
      '❌ REORDER SKILLS ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE SKILL
// ─────────────────────────────────────────────────────────────
export const deleteSkill = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.skill.delete({
      where: {
        id: parseInt(
          req.params.id as string
        ),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Skill deleted',
    });
  } catch (error) {
    console.log('❌ DELETE SKILL ERROR:', error);

    next(error);
  }
};