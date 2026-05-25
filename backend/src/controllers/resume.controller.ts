import { Request, Response, NextFunction } from 'express';
import { prisma } from '../prisma/client';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// GET ALL RESUMES
// ─────────────────────────────────────────────────────────────
export const getAllResumes = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // AUTO SEED IF EMPTY
    const count = await prisma.resume.count();

    if (count === 0) {
      await prisma.resume.create({
        data: {
          fileUrl:
            'https://example.com/resume.pdf',

          version: '1.0',

          isActive: true,
        },
      });
    }

    const resumes = await prisma.resume.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    res.status(200).json({
      success: true,
      data: resumes,
    });
  } catch (error) {
    console.log('❌ GET RESUMES ERROR:', error);

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// GET ACTIVE RESUME
// ─────────────────────────────────────────────────────────────
export const getActiveResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let activeResume =
      await prisma.resume.findFirst({
        where: {
          isActive: true,
        },
      });

    // AUTO CREATE IF EMPTY
    if (!activeResume) {
      activeResume =
        await prisma.resume.create({
          data: {
            fileUrl:
              'https://example.com/resume.pdf',

            version: '1.0',

            isActive: true,
          },
        });
    }

    res.status(200).json({
      success: true,
      data: activeResume,
    });
  } catch (error) {
    console.log(
      '❌ GET ACTIVE RESUME ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// CREATE RESUME
// ─────────────────────────────────────────────────────────────
export const createResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { fileUrl, version } =
      req.body;

    if (!fileUrl) {
      return next(
        createError(
          'fileUrl is required',
          400
        )
      );
    }

    // SET OLD RESUMES INACTIVE
    await prisma.resume.updateMany({
      data: {
        isActive: false,
      },
    });

    // CREATE NEW RESUME
    const newResume =
      await prisma.resume.create({
        data: {
          fileUrl,

          version:
            version || '1.0',//hello

          isActive: true,
        },
      });

    res.status(201).json({
      success: true,
      data: newResume,
    });
  } catch (error) {
    console.log(
      '❌ CREATE RESUME ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// TOGGLE ACTIVE RESUME
// ─────────────────────────────────────────────────────────────
export const toggleActiveResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = parseInt(
      req.params.id as string
    );

    const resume =
      await prisma.resume.findUnique({
        where: {
          id,
        },
      });

    if (!resume) {
      return next(
        createError('Resume not found', 404)
      );
    }

    // TRANSACTION
    await prisma.$transaction([
      prisma.resume.updateMany({
        data: {
          isActive: false,
        },
      }),

      prisma.resume.update({
        where: {
          id,
        },

        data: {
          isActive: true,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Resume set as active',
    });
  } catch (error) {
    console.log(
      '❌ TOGGLE RESUME ERROR:',
      error
    );

    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// DELETE RESUME
// ─────────────────────────────────────────────────────────────
export const deleteResume = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await prisma.resume.delete({
      where: {
        id: parseInt(
          req.params.id as string
        ),
      },
    });

    res.status(200).json({
      success: true,
      message: 'Resume deleted',
    });
  } catch (error) {
    console.log(
      '❌ DELETE RESUME ERROR:',
      error
    );

    next(error);
  }
};