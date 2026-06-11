import mongoose, { Schema, Types, Document } from "mongoose";

// quotation item schema
const quotationItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: { type: String },
  hsn: { type: String },
  unit: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  taxRate: { type: Number },
  total: { type: Number },
});

// charges schema
const chargeSchema = new Schema({
  label: { type: String },
  amount: { type: Number },
  taxRate: { type: Number },
});

// quotation schema — belongs to a Company, billed TO a Customer
const quotationSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    quotationNo: { type: String, unique: true },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    items: [quotationItemSchema],
    subTotal: { type: Number },
    discount: { type: Number, default: 0 },
    extraCharges: [chargeSchema],
    totalAmount: { type: Number },
    roundOff: { type: Boolean, default: false },
    dispatchAddress: { type: Schema.Types.Mixed },
    shippingAddress: { type: Schema.Types.Mixed },
    bank: { type: Schema.Types.ObjectId, ref: "Bank" },
    reference: { type: String },
    notes: { type: String },
    terms: { type: String },
    attachments: [{ type: String }],
    status: {
      type: String,
      enum: ["DRAFT", "CREATED"],
      default: "DRAFT",
    },
  },
  { timestamps: true }
);

// types
export type IQuotationItem = {
  _id?: Types.ObjectId;
  productId?: Types.ObjectId;
  name?: string;
  hsn?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  taxRate?: number;
  total?: number;
};

export type ICharge = {
  _id?: Types.ObjectId;
  label?: string;
  amount?: number;
  taxRate?: number;
};

export type IQuotation = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  quotationNo?: string;
  customer: Types.ObjectId;
  items: IQuotationItem[];
  subTotal?: number;
  discount?: number;
  extraCharges?: ICharge[];
  totalAmount?: number;
  roundOff?: boolean;
  dispatchAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  bank?: Types.ObjectId;
  reference?: string;
  notes?: string;
  terms?: string;
  attachments?: string[];
  status: "DRAFT" | "CREATED";
  createdAt: Date;
  updatedAt: Date;
};

export const Quotation = mongoose.model<IQuotation>("Quotation", quotationSchema);
