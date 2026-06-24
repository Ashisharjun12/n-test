import mongoose, { Schema, Types, Document } from "mongoose";
import { IAddress } from "../customer/customer.schema.js";

const addressSchema = new Schema({
  line1: { type: String },
  line2: { type: String },
  pincode: { type: String },
  city: { type: String },
  state: { type: String },
});

const signatureSchema = new Schema({
  url: { type: String },
  name: { type: String },
  position: { type: String },
  withStamp: { type: Boolean },
});

const companySignatureSchema = new Schema({
  url: { type: String, required: true },
  name: { type: String, required: true },
  withStamp: { type: Boolean, default: false },
  isDefault: { type: Boolean, default: false },
  uploadId: { type: Schema.Types.ObjectId, ref: "Upload" },
});

// company schema
const companySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String },
    gst: { type: String, trim: true },
    phone: { type: String, trim: true },
    email: { type: String, trim: true },
    tradeName: { type: String },
    logo: { type: String },
    signature: signatureSchema,
    signatures: [companySignatureSchema],
    pan: { type: String, trim: true },
    alternatePhone: { type: String, trim: true },
    website: { type: String, trim: true },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,
    defaultReference: { type: String, trim: true },
    defaultNotes: { type: String, trim: true },
    defaultTerms: { type: String, trim: true },
  },
  { timestamps: true }
);

export type ISignature = {
  url?: string;
  name?: string;
  position?: string;
  withStamp?: boolean;
};

export type ICompanySignature = {
  _id?: Types.ObjectId;
  url: string;
  name: string;
  withStamp?: boolean;
  isDefault?: boolean;
  uploadId?: Types.ObjectId;
};

export type ICompany = Document & {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  name?: string;
  gst?: string;
  phone?: string;
  email?: string;
  tradeName?: string;
  logo?: string;
  signature?: ISignature;
  signatures?: ICompanySignature[];
  pan?: string;
  alternatePhone?: string;
  website?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;
  defaultReference?: string;
  defaultNotes?: string;
  defaultTerms?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const Company = mongoose.model<ICompany>("Company", companySchema);
