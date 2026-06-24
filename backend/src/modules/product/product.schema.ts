import mongoose, { Schema, Types, Document } from "mongoose";

// opening stock sub-schema
const openingStockSchema = new Schema({
  quantity: { type: Number, default: 0 },
  purchasePrice: { type: Number, default: 0 },   
  stockValue: { type: Number, default: 0 },       
});

// product settings schema
const productSettingsSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true,
    },
    defaultCategory: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    defaultType: {
      type: String,
      enum: ["product", "service"],
      default: "product",
    },
    defaultPricePreference: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "exclusive",
    },
    defaultUnit: { type: String, default: "PCS" },
    maxDiscount: { type: Number, min: 0, max: 100, default: 100 },
    defaultTaxRate: { type: Number, min: 0, max: 100, default: 0 },
  },
  { timestamps: true }
);

// product schema — belongs to a Company
const productSchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },

    // core
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["product", "service"],
      default: "product",
    },

    // pricing
    sellingPrice: { type: Number, default: 0 },
    sellingTaxType: {
      type: String,
      enum: ["inclusive", "exclusive"],   
      default: "exclusive",
    },
    taxRate: { type: Number, min: 0, max: 100, default: 0 },
    cess: { type: Number, min: 0, max: 100, default: 0 }, 

    purchasePrice: { type: Number, default: 0 },
    purchaseTaxType: {
      type: String,
      enum: ["inclusive", "exclusive"],
      default: "inclusive",
    },
    gst: { type: String, trim: true },
    hsn: { type: String, trim: true },

    // discount
    discount: { type: Number, min: 0, max: 100, default: 0 }, 

    // classification
    categoryId: { type: Schema.Types.ObjectId, ref: "ProductCategory" },
    unit: { type: String, default: "PCS" },
    notforsale: { type: Boolean, default: false },


    // details
    
    description: { type: String, trim: true },
    images: [{ type: Schema.Types.ObjectId, ref: "Upload" }],  
    amount: { type: Number, default: 0 },


    // inventory
    openingStock: openingStockSchema,
    currentStock: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 0 }, 
  },
  { timestamps: true }
);

// types
export type IOpeningStock = {
  quantity: number;
  purchasePrice: number;
  stockValue: number;
};

export type IProduct = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  type: "product" | "service";
  sellingPrice: number;
  sellingTaxType: "inclusive" | "exclusive";
  taxRate: number;
  cess: number;
  purchasePrice: number;
  purchaseTaxType: "inclusive" | "exclusive";
  discount: number;
  categoryId?: Types.ObjectId;
  gst?: string;
  hsn?: string;
  unit: string;
  notforsale: boolean;
  description?: string;
  images: Types.ObjectId[];
  amount: number;
  openingStock?: IOpeningStock;
  currentStock: number;
  lowStockAlert: number;
  createdAt: Date;
  updatedAt: Date;
};

export const Product = mongoose.model<IProduct>("Product", productSchema);

export type IProductSettings = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  defaultCategory?: Types.ObjectId;
  defaultType: "product" | "service";
  defaultPricePreference: "inclusive" | "exclusive";
  defaultUnit: string;
  maxDiscount: number;
  defaultTaxRate: number;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductSettings = mongoose.model<IProductSettings>("ProductSettings", productSettingsSchema);