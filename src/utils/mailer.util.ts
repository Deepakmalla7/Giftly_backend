import nodemailer, { Transporter } from 'nodemailer';

let transporter: Transporter | null = null;

/**
 * Check if SMTP credentials are real (not empty or placeholder values)
 */
const hasValidCredentials = (): boolean => {
    const user = process.env.GMAIL_USER?.trim();
    const pass = process.env.GMAIL_PASSWORD?.trim();

    if (!user || !pass) return false;

    // Detect common placeholder patterns
    const placeholderPatterns = [
        'your-email', 'your-app-password', 'your_email', 'your_password',
        'example@', 'test@', 'placeholder', 'changeme', 'xxx'
    ];
    const lowerUser = user.toLowerCase();
    const lowerPass = pass.toLowerCase();
    if (placeholderPatterns.some(p => lowerUser.includes(p) || lowerPass.includes(p))) {
        return false;
    }

    return true;
};

const initializeMailer = (): Transporter => {
    if (transporter) {
        return transporter;
    }

    // For development/testing, use Gmail SMTP
    // In production, use your actual SMTP configuration
    transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER || '',
            pass: process.env.GMAIL_PASSWORD || '',
        },
    });

    return transporter;
};

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
    try {
        // Check if Gmail credentials are real and configured
        if (!hasValidCredentials()) {
            console.warn('\n========================================');
            console.warn('  EMAIL SERVICE NOT CONFIGURED');
            console.warn('========================================');
            console.warn('To enable email sending, set GMAIL_USER and GMAIL_PASSWORD in .env');
            console.warn(`Email would be sent to: ${options.to}`);
            console.warn(`Subject: ${options.subject}`);

            // In development, allow the action to succeed without actually sending email
            if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined) {
                console.log(`\n[DEV MODE] Skipping actual email send to ${options.to}`);
                console.log('[DEV MODE] Email content logged above for debugging.');
                return;
            }
            throw new Error('Email service is not configured');
        }

        const mailer = initializeMailer();
        
        await mailer.sendMail({
            from: process.env.GMAIL_USER || 'noreply@giftly.com',
            to: options.to,
            subject: options.subject,
            html: options.html,
        });

        console.log(`Email sent to ${options.to}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<void> => {
    const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    // In dev mode without email configured, log the reset link to console
    if (!hasValidCredentials() && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined)) {
        console.log('\n========================================');
        console.log('  PASSWORD RESET LINK (DEV MODE)');
        console.log('========================================');
        console.log(`  Email: ${email}`);
        console.log(`  Reset Link: ${resetLink}`);
        console.log('========================================\n');
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #ec4899, #9333ea); padding: 20px; border-radius: 8px; text-align: center;">
                <h1 style="color: white; margin: 0;">Password Reset Request</h1>
            </div>
            
            <div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px;">
                <p style="color: #374151; margin-top: 0;">We received a request to reset your password. Click the button below to create a new password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #6b7280; font-size: 12px;">Or copy and paste this link in your browser:</p>
                <p style="color: #3b82f6; word-break: break-all; font-size: 12px;">${resetLink}</p>
                
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    This link will expire in 15 minutes for security reasons.
                </p>
                
                <p style="color: #6b7280; font-size: 12px;">
                    If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p>© 2026 Giftly. All rights reserved.</p>
            </div>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Password Reset Request - Giftly',
        html: htmlContent,
    });
};

/**
 * Send OTP for password reset via email
 */
export const sendPasswordResetOTP = async (email: string, otp: string): Promise<void> => {
    // In dev mode without email configured, log the OTP to console
    if (!hasValidCredentials() && (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === undefined)) {
        console.log('\n========================================');
        console.log('  PASSWORD RESET OTP (DEV MODE)');
        console.log('========================================');
        console.log(`  Email: ${email}`);
        console.log(`  OTP: ${otp}`);
        console.log('========================================\n');
    }

    const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(to right, #ec4899, #9333ea); padding: 20px; border-radius: 8px; text-align: center;">
                <h1 style="color: white; margin: 0;">Password Reset OTP</h1>
            </div>
            
            <div style="padding: 20px; background: #f9fafb; border-radius: 8px; margin-top: 20px;">
                <p style="color: #374151; margin-top: 0;">We received a request to reset your password. Use the OTP below to verify your identity:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <div style="background: linear-gradient(to right, #ec4899, #9333ea); color: white; padding: 20px 40px; border-radius: 12px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px;">
                        ${otp}
                    </div>
                </div>
                
                <p style="color: #6b7280; font-size: 14px; text-align: center; margin: 20px 0;">
                    Enter this OTP in the password reset form to continue.
                </p>
                
                <p style="color: #dc2626; font-size: 12px; text-align: center; font-weight: bold; margin-top: 20px;">
                    This OTP will expire in 10 minutes for security reasons.
                </p>
                
                <p style="color: #6b7280; font-size: 12px; text-align: center;">
                    If you didn't request this, please ignore this email and your password will remain unchanged.
                </p>
            </div>
            
            <div style="padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; margin-top: 20px;">
                <p>© 2026 Giftly. All rights reserved.</p>
            </div>
        </div>
    `;

    await sendEmail({
        to: email,
        subject: 'Your Password Reset OTP - Giftly',
        html: htmlContent,
    });
};

