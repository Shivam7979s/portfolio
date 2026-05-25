import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// GET ALL PROJECTS
// ─────────────────────────────────────────────────────────────
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    const count = await prisma.project.count();

    if (count === 0) {
      await prisma.project.create({
        data: {
          title: 'Portfolio Project',

          description:
            'My Portfolio Website',

          image: '',

          screenshots: '[]',

          githubUrl: 'https://github.com',

          liveUrl: 'https://example.com',

          techStack:
            '["React","Node.js","TypeScript"]',

          featured: true,

          category: 'Web',

          markdownDescription: '',

          order: 0,
        },
      });
    }

    const projects = await prisma.project.findMany({
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
      data: projects,
    });
  } catch (error) {
    console.log('❌ GET PROJECTS ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET SINGLE PROJECT
// ─────────────────────────────────────────────────────────────
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project =
      await prisma.project.findUnique({
        where: {
          id: parseInt(
            req.params.id as string
          ),
        },
      });

    if (!project) {
      return next(
        createError('Project not found', 404)
      );
    }

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log('❌ GET PROJECT ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE PROJECT
// ─────────────────────────────────────────────────────────────
export const createProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      image,
      screenshots,
      githubUrl,
      liveUrl,
      techStack,
      featured,
      category,
      markdownDescription,
      order,
    } = req.body;

    const project =
      await prisma.project.create({
        data: {
          title,

          description,

          image: image || '',

          screenshots:
            Array.isArray(screenshots)
              ? JSON.stringify(screenshots)
              : screenshots || '[]',

          githubUrl:
            githubUrl || '',

          liveUrl:
            liveUrl || '',

          techStack:
            Array.isArray(techStack)
              ? JSON.stringify(techStack)
              : techStack || '[]',

          featured:
            featured === true ||
            featured === 'true',

          category:
            category || 'Web',

          markdownDescription:
            markdownDescription || '',

          order:
            order !== undefined
              ? parseInt(order)
              : 0,
        },
      });

    res.status(201).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log('❌ CREATE PROJECT ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UPDATE PROJECT
// ─────────────────────────────────────────────────────────────
export const updateProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      title,
      description,
      image,
      screenshots,
      githubUrl,
      liveUrl,
      techStack,
      featured,
      category,
      markdownDescription,
      order,
    } = req.body;

    const project =
      await prisma.project.update({
        where: {
          id: parseInt(
            req.params.id as string
          ),
        },

        data: {
          title,

          description,

          image: image || '',

          screenshots:
            Array.isArray(screenshots)
              ? JSON.stringify(screenshots)
              : screenshots || '[]',

          githubUrl:
            githubUrl || '',

          liveUrl:
            liveUrl || '',

          techStack:
            Array.isArray(techStack)
              ? JSON.stringify(techStack)
              : techStack || '[]',

          featured:
            featured === true ||
            featured === 'true',

          category:
            category || 'Web',

          markdownDescription:
            markdownDescription || '',

          order:
            order !== undefined
              ? parseInt(order)
              : 0,
        },
      });

    res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    console.log('❌ UPDATE PROJECT ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// REORDER PROJECTS
// ─────────────────────────────────────────────────────────────
export const reorderProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body;

    if (!Array.isArray(orderIds)) {
      return next(
        createError(
          'orderIds must be an array of project IDs',
          400
        )
      );
    }

    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.project.update({
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
        'Projects reordered successfully',
    });
  } catch (error) {
    console.log(
      '❌ REORDER PROJECTS ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE PROJECT
// ─────────────────────────────────────────────────────────────
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.project.delete({
      where: {
        id: parseInt(
          req.params.id as string
        ),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Project deleted',
    });
  } catch (error) {
    console.log('❌ DELETE PROJECT ERROR:', error);

    next(error);
  }
};