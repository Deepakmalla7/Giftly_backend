import crypto from 'crypto';
import bcryptjs from 'bcryptjs';

/**
 * Generate a secure random reset token
 * Returns raw token (to send to user) and hashed token (to store in DB)
 */
export const generateResetToken = (): { rawToken: string; hashedToken: string } => {
    // Generate a 32-byte random token
    const rawToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token for secure storage
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    
    return { rawToken, hashedToken };
};

/**
 * Hash a token for comparison or storage
 */
export const hashToken = (token: string): string => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify a raw token against a hashed token
 */
export const verifyToken = (rawToken: string, hashedToken: string): boolean => {
    const hashOfRaw = hashToken(rawToken);
    return hashOfRaw === hashedToken;
};
