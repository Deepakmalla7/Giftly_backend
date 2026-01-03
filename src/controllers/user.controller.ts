import { Request, Response } from "express";
import z from "zod";
import { UserService } from "../services/user.service";
import { createUserDto, loginUserDto } from "../dtos/user.dto";
import { HttpError } from "../errors/http-error";

const userService = new UserService();

export class UserController {
  
  async registerUser(req: Request, res: Response) {
    try {
      const parsedData = createUserDto.safeParse(req.body);
      if (!parsedData.success) {
        return res.status(400).json({
          success: false,
          message: z.prettifyError(parsedData.error),
        });
      }

      const newUser = await userService.registerUser(parsedData.data);
      return res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: newUser,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const parsedData = loginUserDto.safeParse(req.body);
      if (!parsedData.success) {
        throw new HttpError(400, "Invalid credentials");
      }

      const { token, user } = await userService.loginUser(parsedData.data);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const user = await userService.getUserById(req.params.id);
      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }

  async updateUser(req: Request, res: Response) {
    try {
      const updatedUser = await userService.updateUser(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: updatedUser,
      });
    } catch (error: any) {
      return res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
