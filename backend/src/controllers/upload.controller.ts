import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createError } from '../middleware/error.middleware';

// ─── Upload Image ─────────────────────────────────────────────────────────────
export const uploadFile = async (
  req: Request & { file?: Express.Multer.File },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.file) {
      return next(createError('No file uploaded', 400));
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      url: fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  } catch (error) {
    next(error);
  }
};
