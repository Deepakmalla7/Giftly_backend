import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 */
export const generateOTP = (): string => {
    // Generate a random 6-digit number
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
};

/**
 * Hash OTP for secure storage
 */
export const hashOTP = (otp: string): string => {
    return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Verify OTP by comparing hashes
 */
export const verifyOTP = (inputOTP: string, hashedOTP: string): boolean => {
    const hashedInput = hashOTP(inputOTP);
    return hashedInput === hashedOTP;
};

/**
 * Get OTP expiry time (default 10 minutes)
 */
export const getOTPExpiry = (minutes: number = 10): Date => {
    return new Date(Date.now() + minutes * 60 * 1000);
};
