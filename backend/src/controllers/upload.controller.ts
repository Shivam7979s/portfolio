import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { createError } from '../middleware/error.middleware';

// ─────────────────────────────────────────────────────────────
// UPLOAD FILE
// ─────────────────────────────────────────────────────────────
export const uploadFile = async (
  req: Request & {
    file?: Express.Multer.File;
  },
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // CHECK FILE
    if (!req.file) {
      return next(
        createError('No file uploaded', 400)
      );
    }

    // FILE INFO
    const {
      filename,
      originalname,
      size,
      mimetype,
      path: filePath,
    } = req.file;

    // CHECK FILE EXISTS
    if (!fs.existsSync(filePath)) {
      return next(
        createError(
          'Uploaded file not found',
          500
        )
      );
    }

    // GENERATE FILE URL
    const fileUrl = `/uploads/${filename}`;

    console.log('━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ FILE UPLOADED');
    console.log('FILENAME:', filename);
    console.log(
      'ORIGINAL NAME:',
      originalname
    );
    console.log('SIZE:', size);
    console.log('TYPE:', mimetype);
    console.log('URL:', fileUrl);

    // RESPONSE
    res.status(200).json({
      success: true,

      message:
        'File uploaded successfully',

      url: fileUrl,

      filename,

      originalName: originalname,

      size,

      mimetype,
    });
  } catch (error) {
    console.log('❌ UPLOAD ERROR:', error);

    next(error);
  }
};