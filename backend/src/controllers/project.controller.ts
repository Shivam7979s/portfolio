import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get All Projects ─────────────────────────────────────────────────────────
export const getAllProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    res.status(200).json({ success: true, data: projects });
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Project ───────────────────────────────────────────────────────
export const getProjectById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });
    if (!project) return next(createError('Project not found', 404));
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// ─── Create Project ───────────────────────────────────────────────────────────
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

    const project = await prisma.project.create({
      data: {
        title,
        description,
        image: image || null,
        screenshots: Array.isArray(screenshots) ? JSON.stringify(screenshots) : (screenshots || null),
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        techStack: Array.isArray(techStack) ? JSON.stringify(techStack) : techStack,
        featured: featured === true || featured === 'true',
        category: category || 'Web',
        markdownDescription: markdownDescription || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// ─── Update Project ───────────────────────────────────────────────────────────
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

    const project = await prisma.project.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        title,
        description,
        image: image || null,
        screenshots: Array.isArray(screenshots) ? JSON.stringify(screenshots) : (screenshots || null),
        githubUrl: githubUrl || null,
        liveUrl: liveUrl || null,
        techStack: Array.isArray(techStack) ? JSON.stringify(techStack) : techStack,
        featured: featured === true || featured === 'true',
        category: category || 'Web',
        markdownDescription: markdownDescription || null,
        order: order !== undefined ? parseInt(order) : 0,
      },
    });
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

// ─── Reorder Projects ─────────────────────────────────────────────────────────
export const reorderProjects = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { orderIds } = req.body; // Array of IDs in the preferred order [3, 1, 2]
    if (!Array.isArray(orderIds)) {
      return next(createError('orderIds must be an array of project IDs', 400));
    }

    // Run transaction to update order for all projects listed
    await prisma.$transaction(
      orderIds.map((id, index) =>
        prisma.project.update({
          where: { id: parseInt(id) },
          data: { order: index },
        })
      )
    );

    res.status(200).json({ success: true, message: 'Projects reordered successfully' });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Project ───────────────────────────────────────────────────────────
export const deleteProject = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.project.delete({ where: { id: parseInt(req.params.id as string) } });
    res.status(200).json({ success: true, message: 'Project deleted' });
  } catch (error) {
    next(error);
  }
};
