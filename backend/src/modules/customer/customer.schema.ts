import mongoose, { Schema, Document, Types } from "mongoose";

// address schema
const addressSchema = new Schema({
  title: { type: String },
  line1: { type: String, required: true },
  line2: { type: String },
  pincode: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String },
  notes: { type: String },
});

const tcsSchema = new Schema({
  code: { type: String },
  name: { type: String },
  rate: { type: Number },
});

const tdsSchema = new Schema({
  code: { type: String },
  name: { type: String },
  rate: { type: Number },
});

// customer schema — belongs to a Company
const customerSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    companyName: { type: String },
    gst: { type: String },
    billingAddress: addressSchema,
    shippingAddress: addressSchema,

    // Customer Preferences (Optional)
    discount: { type: Number },
    discountType: { type: String, enum: ["Percent", "Flat"] },
    creditLimit: { type: Number },
    priceList: { type: String },
    defaultDueDate: { type: String },
    tdsApplicable: { type: Boolean, default: false },
    tdsSection: {
      type: tdsSchema,
      _id: false,
      default: undefined,
    },
    tcsApplicable: { type: Boolean, default: false },
    tcsSection: {
      type: tcsSchema,
      _id: false,
      default: undefined,
    },

    // Other Details (Optional)
    openingBalance: { type: Number },
    openingBalanceType: { type: String, enum: ["Debit", "Credit"], default: "Debit" },
    notes: { type: String },
    pan: { type: String },
    ccEmails: [{ type: String }],
    tags: [{ type: String }],
    customFields: { type: Map, of: String },
  },
  { timestamps: true }
);

// Types defined for IAddress
export type IAddress = {
  _id?: Types.ObjectId;
  title?: string;
  line1: string;
  line2?: string;
  pincode: string;
  city: string;
  state: string;
  country?: string;
  notes?: string;
};

// Types defined for ICustomer
export type ICustomer = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  email?: string;
  phone?: string;
  companyName?: string;
  gst?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;

  // Preferences
  discount?: number;
  discountType?: "Percent" | "Flat";
  creditLimit?: number;
  priceList?: string;
  defaultDueDate?: string;
  tdsApplicable?: boolean;
  tdsSection?: { code: string; name: string; rate: number };
  tcsApplicable?: boolean;
  tcsSection?: { code: string; name: string; rate: number };

  // Other Details
  openingBalance?: number;
  openingBalanceType?: "Debit" | "Credit";
  notes?: string;
  pan?: string;
  ccEmails?: string[];
  tags?: string[];
  customFields?: Record<string, string>;

  createdAt: Date;
  updatedAt: Date;
};

export const Customer = mongoose.model<ICustomer>("Customer", customerSchema);
