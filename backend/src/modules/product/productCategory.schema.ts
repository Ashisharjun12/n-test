import mongoose, { Schema, Types, Document } from "mongoose";

// product category schema — belongs to a Company
const productCategorySchema = new Schema(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

export type IProductCategory = Document & {
  _id: Types.ObjectId;
  companyId: Types.ObjectId;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const ProductCategory = mongoose.model<IProductCategory>(
  "ProductCategory",
  productCategorySchema
);
