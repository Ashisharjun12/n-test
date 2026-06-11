import mongoose, { Schema, Types, Document } from "mongoose";

// dispatch address schema — belongs to a Company
const dispatchAddressSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    pincode: { type: String, required: true },
    city: { type: String },
    state: { type: String },
  },
  { timestamps: true }
);

// types for dispatch address schema
export type IDispatchAddress = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  city?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const DispatchAddress = mongoose.model<IDispatchAddress>(
  "DispatchAddress",
  dispatchAddressSchema
);
