import mongoose, { Schema, Types, Document } from "mongoose";

// bank schema — belongs to a Company
const bankSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    ifsc: { type: String, trim: true, required: true },
    bankName: { type: String, trim: true, required: true },
    accountNumber: { type: String, trim: true, required: true, unique: true },
    branch: { type: String, trim: true, required: true },
    upi: { type: String, trim: true },
    openingBalance: { type: Number, default: 0 },
    gpay: { type: String, trim: true },
    notes: { type: String, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// types
export type IBank = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  ifsc: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  upi?: string;
  openingBalance: number;
  gpay?: string;
  notes?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export const Bank = mongoose.model<IBank>("Bank", bankSchema);
