import mongoose, { Schema, Types, Document } from "mongoose";

export type TUserRole = "admin" | "user";

const userSchema = new Schema(
  {
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    avatarUrl: { type: String },
  },
  { timestamps: true }
);

export type IUser = Document & {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: TUserRole;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const User = mongoose.model<IUser>("User", userSchema);
