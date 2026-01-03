import { z } from "zod";
import { UserSchema } from "../types/User.type";

export const createUserDto = UserSchema.pick({
  fname: true,
  lname: true,
  email: true,
  password: true,
  phoneNumber: true,
}).extend({
  confirmPassword: z.string().min(6, "Confirm password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const updateUserDto = UserSchema.partial().extend({
  confirmPassword: z.string().min(6).optional(),
}).refine((data) => {
  if (data.password || data.confirmPassword) {
    return data.password === data.confirmPassword;
  }
  return true;
}, {
  message: "Passwords do not match",
});

export const loginUserDto = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type UpdateUserDTO = z.infer<typeof updateUserDto>;
export type CreateUserDTO = z.infer<typeof createUserDto>;
export type LoginUserDTO = z.infer<typeof loginUserDto>;
