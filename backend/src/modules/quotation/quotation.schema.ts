import mongoose, { Schema, Types, Document } from "mongoose";

const signatureSnapshotSchema = new Schema(
  {
    url: { type: String },
    name: { type: String },
    withStamp: { type: Boolean, default: false },
  },
  { _id: false }
);

const quotationItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: "Product" },
  name: { type: String },
  description: { type: String },
  hsn: { type: String },
  unit: { type: String },
  quantity: { type: Number },
  price: { type: Number },
  taxRate: { type: Number },
  total: { type: Number },
});

const chargeSchema = new Schema({
  type: { type: String, enum: ["shipping", "packaging", "other"], default: "other" },
  label: { type: String },
  rawValue: { type: Number, default: 0 },
  valueMode: { type: String, enum: ["flat", "percent"], default: "flat" },
  taxRate: { type: Number, default: 0 },
  taxInclusive: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
});

const quotationSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    quotationNo: { type: String, unique: true, sparse: true },
    customer: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    documentDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    documentTitle: {
      type: String,
      enum: ["Quotation", "Estimate"],
      default: "Quotation",
    },
    withGst: { type: Boolean, default: true },
    isExportSEZ: { type: Boolean, default: false },
    placeOfSupply: { type: String, trim: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "bank"],
      default: "cash",
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
    signature: signatureSnapshotSchema,
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

export type ISignatureSnapshot = {
  url?: string;
  name?: string;
  withStamp?: boolean;
};

export type IQuotationItem = {
  _id?: Types.ObjectId;
  productId?: Types.ObjectId;
  name?: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  taxRate?: number;
  total?: number;
};

export type ICharge = {
  _id?: Types.ObjectId;
  type?: "shipping" | "packaging" | "other";
  label?: string;
  rawValue?: number;
  valueMode?: "flat" | "percent";
  taxRate?: number;
  taxInclusive?: boolean;
  amount?: number;
};

export type IQuotation = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  quotationNo?: string;
  customer: Types.ObjectId;
  documentDate?: Date;
  dueDate?: Date;
  documentTitle?: "Quotation" | "Estimate";
  withGst?: boolean;
  isExportSEZ?: boolean;
  placeOfSupply?: string;
  paymentMethod?: "cash" | "bank";
  items: IQuotationItem[];
  subTotal?: number;
  discount?: number;
  extraCharges?: ICharge[];
  totalAmount?: number;
  roundOff?: boolean;
  dispatchAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  bank?: Types.ObjectId;
  signature?: ISignatureSnapshot;
  reference?: string;
  notes?: string;
  terms?: string;
  attachments?: string[];
  status: "DRAFT" | "CREATED";
  createdAt: Date;
  updatedAt: Date;
};

export const Quotation = mongoose.model<IQuotation>("Quotation", quotationSchema);
