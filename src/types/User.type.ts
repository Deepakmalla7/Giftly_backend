import { z } from "zod";

// User schema - simplified general user
export const UserSchema = z.object({
  fname: z.string().min(2, "First name must be at least 2 characters long"),
  lname: z.string().min(2, "Last name must be at least 2 characters long"),
  email: z.email(),
  password: z.string().min(3),
  phoneNumber: z.string().optional(),
  isEmailVerified: z.boolean().optional().default(false),
  profilePicturePath: z.string().optional().default(""),
  role: z.enum(["user"]).default("user"),
  googleId: z.string().optional(),
  googleProfilePicture: z.string().optional().default(""),
  
  createdAt: z.date().optional().default(() => new Date()),
});

// TypeScript type
export type UserType = z.infer<typeof UserSchema>;
