import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─── Get All Resumes ──────────────────────────────────────────────────────────
export const getAllResumes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const resumes = await prisma.resume.findMany({
      orderBy: { uploadedAt: 'desc' },
    });
    res.status(200).json({ success: true, data: resumes });
  } catch (error) {
    next(error);
  }
};

// ─── Get Active Resume ────────────────────────────────────────────────────────
export const getActiveResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const activeResume = await prisma.resume.findFirst({
      where: { isActive: true },
    });
    if (!activeResume) {
      // Fallback to latest
      const latest = await prisma.resume.findFirst({
        orderBy: { uploadedAt: 'desc' }
      });
      res.status(200).json({ success: true, data: latest });
      return;
    }
    res.status(200).json({ success: true, data: activeResume });
  } catch (error) {
    next(error);
  }
};

// ─── Add Resume Version ────────────────────────────────────────────────────────
export const createResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileUrl, version } = req.body;
    if (!fileUrl) {
      return next(createError('fileUrl is required', 400));
    }

    // Set all other resumes as inactive since this is the new one
    await prisma.resume.updateMany({
      data: { isActive: false },
    });

    const newResume = await prisma.resume.create({
      data: {
        fileUrl,
        version: version || '1.0',
        isActive: true,
      },
    });

    res.status(201).json({ success: true, data: newResume });
  } catch (error) {
    next(error);
  }
};

// ─── Toggle Active Resume ──────────────────────────────────────────────────────
export const toggleActiveResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(req.params.id!);
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume) {
      return next(createError('Resume not found', 404));
    }

    // Run transaction: set all to false, then set target to true
    await prisma.$transaction([
      prisma.resume.updateMany({
        data: { isActive: false },
      }),
      prisma.resume.update({
        where: { id },
        data: { isActive: true },
      }),
    ]);

    res.status(200).json({ success: true, message: 'Resume set as active' });
  } catch (error) {
    next(error);
  }
};

// ─── Delete Resume Version ──────────────────────────────────────────────────────
export const deleteResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.resume.delete({ where: { id: parseInt(req.params.id!) } });
    res.status(200).json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};
