import z from "zod";
import { createUserDto, loginUserDto, updateUserDto } from "../dtos/user.dto";
import { UserService } from "../services/user.service";
import { Request, Response } from "express";
import { HttpError } from "../errors/http-error";
import { uploads } from "../middlewares/upload_middleware";
import path from "path";
import fs from "fs";

let userService = new UserService();
 
export class AuthController{
    async createUser(req:Request,res:Response){
    
        try{
            const parsedData = createUserDto.safeParse(req.body);
            if(!parsedData.success){
                return res.status(400).json(
                    {success:false,
                        message:z.prettifyError(parsedData.error)});
            }
            const { token, newUser } = await userService.registerUser(parsedData.data);
            return res.status(201).json(
                {success:true,
                    message:"User created successfully",
                    token,
                    newUser});
        } catch(error:Error | any){ 
            return res.status(500).json({success:false, message:error.message || "Internal server error"});
        }
    }

    async loginUser(req:Request,res:Response){
        try{
            const parsedData = loginUserDto.safeParse(req.body);
            if(!parsedData.success){
                throw new HttpError(400,"Invalid credentials");
            }
            const {token,checkLogin,newUser} = await userService.loginUser(parsedData.data);
            return res.status(200).json({success:true, message:"Login successful",token,newUser});
        }
        catch(error:HttpError | any){
            return res.status(error.statusCode || 500).json({success:false,message:error.message|| "Internal server error"});
        }
    }

    async logoutUser(req: Request, res: Response) {
        try {
            return res.status(200).json({ success: true, message: "Logout successful" });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async getUserProfile(req:Request,res:Response){
        try{
            const userId = req.params.id;
            if(!userId){
                throw new HttpError(400,"User ID is required");
            }
            const userProfile = await userService.getUserProfile(userId);
            return res.status(200).json({success:true, message:"User profile retrieved successfully", data:userProfile});
        }
        catch(error:HttpError | any){
            return res.status(error.statusCode || 500).json({success:false,message:error.message|| "Internal server error"});
        }
    }

    async uploadUserPhoto(req: Request, res: Response) {
        try {
            if (!req.file) {
                console.log('No file uploaded');
                return res.status(400).json({ success: false, message: "No file uploaded" });
            }
            
            const userId = req.body.userId;
            if (!userId) {
                console.log('No userId in request body:', req.body);
                return res.status(400).json({ success: false, message: "User ID is required" });
            }

            console.log('Uploading photo for user:', userId);
            const photoPath = `/uploads/${req.file.filename}`;
            console.log('Photo path:', photoPath);
            
            // Save only the relative path to database, not the full URL
            const updatedUser = await userService.updateUserPhoto(userId, photoPath);
            console.log('User updated successfully:', updatedUser);
            
            // Construct full URL for response only
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const photoUrl = `${baseUrl}${photoPath}`;
            
            return res.status(200).json({ 
                success: true, 
                message: "Photo uploaded successfully", 
                data: updatedUser,
                path: photoPath,
                url: photoUrl
            });
        } catch (error: HttpError | any) {
            console.error('Upload photo error:', error);
            return res.status(500).json({ success: false, message: error.message || "Internal server error" });
        }
    }

    async deleteUserPhoto(req: Request, res: Response) {
        try {
            const { photoPath, userId } = req.body;
            if (!photoPath) {
                throw new HttpError(400, "Photo path is required");
            }
            if (!userId) {
                throw new HttpError(400, "User ID is required");
            }

            // Delete file from system
            const normalizedPath = photoPath.startsWith('http')
                ? new URL(photoPath).pathname
                : photoPath;
            const fileName = normalizedPath.startsWith('/uploads/')
                ? normalizedPath.replace('/uploads/', '')
                : path.basename(normalizedPath);
            const filePath = path.resolve(__dirname, '../../uploads', fileName);

            fs.unlink(filePath, async (err) => {
                if (err) {
                    console.error('File deletion error:', err);
                }
                
                // Update user to remove photo reference
                try {
                    await userService.updateUserPhoto(userId, "");
                    return res.status(200).json({ success: true, message: "Photo deleted successfully" });
                } catch (error: any) {
                    return res.status(500).json({ success: false, message: error.message || "Failed to delete photo" });
                }
            });
        } catch (error: HttpError | any) {
            return res.status(error.statusCode || 500).json({ success: false, message: error.message || "Internal server error" });
        }
    }

    async updateUserProfile(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new HttpError(400, "User ID is required");
            }

            const parsedData = updateUserDto.safeParse(req.body);
            if (!parsedData.success) {
                return res.status(400).json({
                    success: false,
                    message: z.prettifyError(parsedData.error)
                });
            }

            const updateData = parsedData.data;
            const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

            console.log('Updating user profile:', userId);
            console.log('Update data:', updateData);
            console.log('Profile picture:', profilePicture);

            const updatedUser = await userService.updateUserProfile(userId, updateData, profilePicture);

            return res.status(200).json({
                success: true,
                message: "Profile updated successfully",
                data: updatedUser
            });
        } catch (error: HttpError | any) {
            console.error('Update profile error:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async deleteUser(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            if (!userId) {
                throw new HttpError(400, "User ID is required");
            }

            console.log('Deleting user:', userId);
            const result = await userService.deleteUser(userId);

            return res.status(200).json({
                success: true,
                message: "Account deleted successfully"
            });
        } catch (error: HttpError | any) {
            console.error('Delete user error:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;

            if (!email || !email.trim()) {
                return res.status(400).json({
                    success: false,
                    message: "Email is required"
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: "Please provide a valid email address"
                });
            }

            const result = await userService.forgotPassword(email);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: HttpError | any) {
            console.error('Forgot password error:', error);
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || "Internal server error"
            });
        }
    }

    async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword, confirmPassword } = req.body;

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Token and new password are required"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Passwords do not match"
                });
            }

            const result = await userService.resetPassword(token, newPassword);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: HttpError | any) {
            console.error('Reset password error:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || "Failed to reset password"
            });
        }
    }

    async verifyOTP(req: Request, res: Response) {
        try {
            const { email, otp } = req.body;

            if (!email || !otp) {
                return res.status(400).json({
                    success: false,
                    message: "Email and OTP are required"
                });
            }

            const result = await userService.verifyOTP(email, otp);

            return res.status(200).json({
                success: true,
                message: result.message,
                verified: result.verified
            });
        } catch (error: HttpError | any) {
            console.error('Verify OTP error:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || "Invalid or expired OTP"
            });
        }
    }

    async resetPasswordWithOTP(req: Request, res: Response) {
        try {
            const { email, otp, newPassword, confirmPassword } = req.body;

            if (!email || !otp || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Email, OTP, and new password are required"
                });
            }

            if (newPassword !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Passwords do not match"
                });
            }

            const result = await userService.resetPasswordWithOTP(email, otp, newPassword);

            return res.status(200).json({
                success: true,
                message: result.message
            });
        } catch (error: HttpError | any) {
            console.error('Reset password with OTP error:', error);
            return res.status(error.statusCode || 400).json({
                success: false,
                message: error.message || "Failed to reset password"
            });
        }
    }
}
