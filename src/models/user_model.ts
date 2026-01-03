import mongoose, { Schema, Document } from "mongoose";
import { UserType } from "../types/User.type";

const userSchema: Schema = new Schema(
  {
    fname: { type: String },
    lname: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    phoneNumber: { type: String },
    role: { type: String, enum: ["user"], default: "user" },
    profilePicturePath: { type: String, default: "" },
    googleId: { type: String, sparse: true, unique: true },
    googleProfilePicture: { type: String, default: "" },
    isEmailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // includes createdAt and updatedAt
  }
);

// Interface for TypeScript
export interface IUser extends UserType, Document {
  _id: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export const UserModel = mongoose.model<IUser>("User", userSchema);
