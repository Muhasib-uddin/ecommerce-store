import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { AppError } from '../middleware/errorHandler.js';

/**
 * POST /api/v1/uploads
 * Request a simulated presigned URL (offline-ready).
 */
export const getPresignedUrl = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { filename, contentType } = req.body;

    if (!filename) {
      throw new AppError('Filename is required.', 400);
    }

    const ext = path.extname(filename);
    const uniqueKey = `${crypto.randomUUID()}${ext}`;

    const host = req.get('host');
    const protocol = req.protocol;

    // Simulated URL pointing to our express backend PUT endpoint
    const uploadUrl = `${protocol}://${host}/api/v1/uploads/local-target?key=${uniqueKey}`;
    // Public path where client can fetch the image
    const fileUrl = `${protocol}://${host}/public/uploads/${uniqueKey}`;

    res.json({
      success: true,
      data: {
        uploadUrl,
        fileUrl,
        key: uniqueKey,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/uploads/local-target
 * Endpoint simulating S3/R2 direct upload target (offline).
 */
export const handleSimulatedUpload = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { key } = req.query;

    if (!key) {
      throw new AppError('Upload key is required.', 400);
    }

    // Ensure the public/uploads directory exists
    const uploadsDir = path.resolve('public/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const destination = path.join(uploadsDir, key as string);
    const writeStream = fs.createWriteStream(destination);

    req.pipe(writeStream);

    writeStream.on('finish', () => {
      res.json({
        success: true,
        message: 'File uploaded successfully to simulated local storage.',
        key,
      });
    });

    writeStream.on('error', (err) => {
      next(err);
    });
  } catch (error) {
    next(error);
  }
};
