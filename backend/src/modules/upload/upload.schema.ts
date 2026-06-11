import mongoose, { Schema, Types, Document } from "mongoose";

// upload schema
const uploadSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String },
    size: { type: Number },
    purpose: {
      type: String,
      enum: ["logo", "signature", "products", "attachment", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

// types for upload schema
export type IUpload = Document & {
  _id: Types.ObjectId;
  url: string;
  publicId: string;
  originalName: string;
  mimeType?: string;
  size?: number;
  purpose?: "logo" | "signature" | "products" | "attachment" | "other";
  createdAt: Date;
  updatedAt: Date;
};

export const Upload = mongoose.model<IUpload>("Upload", uploadSchema);