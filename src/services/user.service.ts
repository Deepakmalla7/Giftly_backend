import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { CreateUserDTO, LoginUserDTO } from "../dtos/user.dto";
import { UserModel } from "../models/user_model";
import { HttpError } from "../errors/http-error";
import { JWT_SECRET } from "../config";
import { UserRepository } from "../repositories/user.repository";

let userRepository = new UserRepository();

export class UserService {
  // Register a new user
  async registerUser(userData: CreateUserDTO) {
    // Check if email already exists
    const checkEmail = await userRepository.getUserByEmail(userData.email);
    if (checkEmail) {
      throw new HttpError(409, "Email already in use");
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(userData.password, 10);
    userData.password = hashedPassword;

    // Remove confirmPassword before saving
    const { confirmPassword, ...dataToSave } = userData;

    const newUser = await userRepository.createUser(dataToSave);
    return newUser;
  }

  // Login user
  async loginUser(loginData: LoginUserDTO) {
    const user = await userRepository.getUserByEmail(loginData.email);
    if (!user) {
      throw new HttpError(404, "User not found");
    }

    const validPassword = await bcryptjs.compare(loginData.password, user.password || "");
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials");
    }

    const payload = {
      id: user._id,
      email: user.email,
      fname: user.fname,
      lname: user.lname,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET as string, { expiresIn: "1h" });
    return { token, user };
  }

  // Get all users
  async getAllUsers() {
    return await userRepository.getAllUsers();
  }

  // Get user by ID
  async getUserById(id: string) {
    const user = await userRepository.getUserById(id);
    if (!user) throw new HttpError(404, "User not found");
    return user;
  }

  // Update user
  async updateUser(id: string, updates: Partial<CreateUserDTO>) {
    if (updates.password) {
      updates.password = await bcryptjs.hash(updates.password, 10);
    }
    const updatedUser = await userRepository.updateUser(id, updates);
    if (!updatedUser) throw new HttpError(404, "User not found");
    return updatedUser;
  }
}
