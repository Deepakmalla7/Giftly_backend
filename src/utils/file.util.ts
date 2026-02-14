// File Utility Functions
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generate unique filename
 */
export const generateUniqueFilename = (originalFilename: string): string => {
  const extension = path.extname(originalFilename);
  const nameWithoutExt = path.basename(originalFilename, extension);
  const timestamp = Date.now();
  const uniqueId = uuidv4().split('-')[0];
  
  return `${nameWithoutExt}-${timestamp}-${uniqueId}${extension}`;
};

/**
 * Get file extension
 */
export const getFileExtension = (filename: string): string => {
  return path.extname(filename).toLowerCase();
};

/**
 * Check if file is an image
 */
export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  const extension = getFileExtension(filename);
  return imageExtensions.includes(extension);
};

/**
 * Get file size in MB
 */
export const getFileSizeInMB = (fileSizeInBytes: number): number => {
  return fileSizeInBytes / (1024 * 1024);
};

/**
 * Validate file size
 */
export const validateFileSize = (
  fileSizeInBytes: number,
  maxSizeInMB: number = 5
): { isValid: boolean; error?: string } => {
  const sizeInMB = getFileSizeInMB(fileSizeInBytes);
  
  if (sizeInMB > maxSizeInMB) {
    return {
      isValid: false,
      error: `File size must be less than ${maxSizeInMB}MB`,
    };
  }

  return { isValid: true };
};

/**
 * Create directory if not exists
 */
export const ensureDirectoryExists = (dirPath: string): void => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

/**
 * Delete file
 */
export const deleteFile = (filePath: string): void => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

/**
 * Get public file URL
 */
export const getPublicFileUrl = (filename: string): string => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${filename}`;
};
