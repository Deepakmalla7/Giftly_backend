import { createUserDto, loginUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";
import { UserRepository } from "../repositories/user.repository";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import { generateResetToken, verifyToken } from "../utils/token.util";
import { sendPasswordResetEmail, sendPasswordResetOTP } from "../utils/mailer.util";

let userRepository = new UserRepository();

export class UserService{
    private normalizeProfilePath(photoPath?: string) {
        if (!photoPath) return "";
        if (photoPath.startsWith('http://') || photoPath.startsWith('https://')) return photoPath;
        if (photoPath.startsWith('/uploads/')) return photoPath;
        const parts = photoPath.split(/[/\\]/);
        const fileName = parts[parts.length - 1];
        return `/uploads/${fileName}`;
    }
    async registerUser(userData : createUserDto){
        const checkEmail = await userRepository.getUserByEmail(userData.email);
        if(checkEmail){
            throw new HttpError(409,"Email already in use");
        }
        const checkUsername = await userRepository.getUserByUsername(userData.username);
        if(checkUsername){
            throw new HttpError(403,"Username already in use");
        }

        const hashedPassword = await bcryptjs.hash(userData.password, 10);
        userData.password = hashedPassword;
        const newUser = await userRepository.createUser(
           userData
        );
        
        // Generate token for auto-login after registration
        const payload = {
            id: newUser._id,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role || 'user'
        };
        const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" });
        
        // Return user data without password
        const userResponse = {
            id: newUser._id,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            email: newUser.email,
            username: newUser.username,
            role: newUser.role,
            age: newUser.age,
            gender: newUser.gender,
            profilePicture: this.normalizeProfilePath(newUser.profilePicture),
            accountStatus: newUser.accountStatus
        };
        
        return { token, newUser: userResponse };
    }

    async loginUser(loginData: loginUserDto){
        const checkLogin = await userRepository.getUserByEmail(loginData.email);
        if(!checkLogin){
            throw new HttpError(404,"User not found");

        }
        const validPassword = await bcryptjs.compare(loginData.password,checkLogin.password);
        if(!validPassword){
            throw new HttpError(401,"Invalid crednetials");
        }

        const newUser ={
            id:checkLogin._id,
            firstName:checkLogin.firstName,
            lastName:checkLogin.lastName,
            email:checkLogin.email,
            username:checkLogin.username,
            role:checkLogin.role,
            age:checkLogin.age,
            gender:checkLogin.gender,
            profilePicture:this.normalizeProfilePath(checkLogin.profilePicture),
            accountStatus: checkLogin.accountStatus
        }
        const payload ={
            id:checkLogin._id,
            email:checkLogin.email,
            username:checkLogin.username,
            role:checkLogin.role
        };
        const token = jwt.sign(payload,JWT_SECRET as string,{expiresIn:"1h"}); //1 hr session
        return {token,checkLogin,newUser};

        
    }

    async getUserProfile(userId: string){
        const user = await userRepository.getUserById(userId);
        if(!user){
            throw new HttpError(404,"User not found");
        }
        const userProfile = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            username: user.username,
            age: user.age,
            gender: user.gender,
            event: user.event,
            role: user.role,
            profilePicture: this.normalizeProfilePath(user.profilePicture || ""),
            accountStatus: user.accountStatus,
            createdAt: user.createdAt
        };
        return userProfile;
    }

    async updateUserPhoto(userId: string, photoPath: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }
        const normalizedPath = this.normalizeProfilePath(photoPath);
        const updatedUser = await userRepository.updateUser(userId, { profilePicture: normalizedPath });
        return updatedUser;
    }

    async updateUserProfile(userId: string, updateData: any, photoPath?: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        if (updateData.email && updateData.email !== user.email) {
            const existingEmail = await userRepository.getUserByEmail(updateData.email);
            if (existingEmail && existingEmail._id.toString() !== userId) {
                throw new HttpError(409, "Email already in use");
            }
        }

        if (updateData.username && updateData.username !== user.username) {
            const existingUsername = await userRepository.getUserByUsername(updateData.username);
            if (existingUsername && existingUsername._id.toString() !== userId) {
                throw new HttpError(409, "Username already in use");
            }
        }

        // Hash password if being updated
        if (updateData.password) {
            updateData.password = await bcryptjs.hash(updateData.password, 10);
        }

        // Add profile picture if uploaded
        if (photoPath) {
            updateData.profilePicture = this.normalizeProfilePath(photoPath);
        }

        const updatedUser = await userRepository.updateUser(userId, updateData);
        if (!updatedUser) {
            throw new HttpError(500, "Failed to update user");
        }

        // Return user without password
        return {
            id: updatedUser._id,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email,
            username: updatedUser.username,
            age: updatedUser.age,
            gender: updatedUser.gender,
            event: updatedUser.event,
            role: updatedUser.role,
            profilePicture: this.normalizeProfilePath(updatedUser.profilePicture),
            accountStatus: updatedUser.accountStatus,
            createdAt: updatedUser.createdAt,
            updatedAt: updatedUser.updatedAt
        };
    }

    async deleteUser(userId: string) {
        const user = await userRepository.getUserById(userId);
        if (!user) {
            throw new HttpError(404, "User not found");
        }

        // Delete profile picture if exists
        if (user.profilePicture) {
            const normalizedPath = user.profilePicture.startsWith('http')
                ? new URL(user.profilePicture).pathname
                : user.profilePicture;
            const fileName = normalizedPath.startsWith('/uploads/')
                ? normalizedPath.replace('/uploads/', '')
                : normalizedPath.split('/').pop();
            
            if (fileName) {
                const path = require('path');
                const fs = require('fs');
                const filePath = path.resolve(__dirname, '../../uploads', fileName);
                fs.unlink(filePath, (err: any) => {
                    if (err) {
                        console.error('File deletion error:', err);
                    }
                });
            }
        }

        // Delete user
        const deleted = await userRepository.deleteUser(userId);
        if (!deleted) {
            throw new HttpError(500, "Failed to delete user");
        }

        return true;
    }

    async forgotPassword(email: string) {
        // Don't reveal if email exists (security best practice)
        const user = await userRepository.getUserByEmail(email);
        
        if (!user) {
            // Return success even if user doesn't exist for security
            return { message: "If this email exists, an OTP has been sent" };
        }

        try {
            // Generate OTP
            const { generateOTP, hashOTP, getOTPExpiry } = require("../utils/otp.util");
            const otp = generateOTP();
            const hashedOTP = hashOTP(otp);
            
            // Set expiration time (10 minutes for OTP)
            const otpExpirationMinutes = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
            const otpExpires = getOTPExpiry(otpExpirationMinutes);
            
            // Save hashed OTP and expiry to database
            await userRepository.updateUser(user._id.toString(), {
                resetPasswordOTP: hashedOTP,
                resetPasswordOTPExpires: otpExpires
            });
            
            // Send OTP via email
            await sendPasswordResetOTP(email, otp);
            
            return { message: "If this email exists, an OTP has been sent" };
        } catch (error: any) {
            console.error('Forgot password error:', error);
            throw new HttpError(500, "Failed to process password reset request");
        }
    }

    async verifyOTP(email: string, otp: string) {
        if (!email || !otp) {
            throw new HttpError(400, "Email and OTP are required");
        }

        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            throw new HttpError(400, "OTP must be a 6-digit number");
        }

        try {
            // Find user by email
            const user = await userRepository.getUserByEmail(email);

            if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
                throw new HttpError(400, "Invalid or expired OTP");
            }

            // Check if OTP is expired
            if (new Date() > user.resetPasswordOTPExpires) {
                // Clear the expired OTP
                await userRepository.updateUser(user._id.toString(), {
                    resetPasswordOTP: null,
                    resetPasswordOTPExpires: null
                });
                throw new HttpError(400, "OTP has expired");
            }

            // Verify OTP
            const { verifyOTP } = require("../utils/otp.util");
            const isValid = verifyOTP(otp, user.resetPasswordOTP);

            if (!isValid) {
                throw new HttpError(400, "Invalid OTP");
            }

            // OTP is valid, return success (don't clear OTP yet, wait for password reset)
            return { 
                message: "OTP verified successfully",
                verified: true 
            };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.error('Verify OTP error:', error);
            throw new HttpError(400, "Invalid or expired OTP");
        }
    }

    async resetPassword(token: string, newPassword: string) {
        if (!token || !newPassword) {
            throw new HttpError(400, "Token and new password are required");
        }

        if (newPassword.length < 3) {
            throw new HttpError(400, "Password must be at least 3 characters");
        }

        try {
            // Hash the provided token to match with stored hashed token
            const { hashToken } = require("../utils/token.util");
            const hashedProvidedToken = hashToken(token);

            // Find user with matching token directly from DB (efficient query)
            const user = await userRepository.getUserByResetToken(hashedProvidedToken);

            if (!user) {
                throw new HttpError(400, "Invalid or expired reset token");
            }

            // Check if token is expired
            if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
                // Clear the expired token
                await userRepository.updateUser(user._id.toString(), {
                    resetPasswordToken: null,
                    resetPasswordExpires: null
                });
                throw new HttpError(400, "Reset token has expired");
            }

            // Hash new password
            const hashedPassword = await bcryptjs.hash(newPassword, 10);

            // Update user with new password and clear reset token
            await userRepository.updateUser(user._id.toString(), {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null
            });

            return { message: "Password reset successfully" };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.error('Reset password error:', error);
            throw new HttpError(400, "Invalid or expired reset token");
        }
    }

    async resetPasswordWithOTP(email: string, otp: string, newPassword: string) {
        if (!email || !otp || !newPassword) {
            throw new HttpError(400, "Email, OTP, and new password are required");
        }

        if (otp.length !== 6 || !/^\d+$/.test(otp)) {
            throw new HttpError(400, "OTP must be a 6-digit number");
        }

        if (newPassword.length < 3) {
            throw new HttpError(400, "Password must be at least 3 characters");
        }

        try {
            // Find user by email
            const user = await userRepository.getUserByEmail(email);

            if (!user || !user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
                throw new HttpError(400, "Invalid or expired OTP");
            }

            // Check if OTP is expired
            if (new Date() > user.resetPasswordOTPExpires) {
                // Clear the expired OTP
                await userRepository.updateUser(user._id.toString(), {
                    resetPasswordOTP: null,
                    resetPasswordOTPExpires: null
                });
                throw new HttpError(400, "OTP has expired");
            }

            // Verify OTP
            const { verifyOTP } = require("../utils/otp.util");
            const isValid = verifyOTP(otp, user.resetPasswordOTP);

            if (!isValid) {
                throw new HttpError(400, "Invalid OTP");
            }

            // Hash new password
            const hashedPassword = await bcryptjs.hash(newPassword, 10);

            // Update user with new password and clear OTP
            await userRepository.updateUser(user._id.toString(), {
                password: hashedPassword,
                resetPasswordOTP: null,
                resetPasswordOTPExpires: null
            });

            return { message: "Password reset successfully" };
        } catch (error: any) {
            if (error instanceof HttpError) {
                throw error;
            }
            console.error('Reset password with OTP error:', error);
            throw new HttpError(400, "Failed to reset password");
        }
    }
}