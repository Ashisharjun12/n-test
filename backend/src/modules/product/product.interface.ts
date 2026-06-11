import { IOpeningStock, IProduct } from "./product.schema.js";

export type CreateProductDto = {
  companyId: string;
  name: string;
  type?: "product" | "service";
  sellingPrice?: number;
  sellingTaxType?: "inclusive" | "exclusive";
  taxRate?: number;
  cess?: number;
  purchasePrice?: number;
  purchaseTaxType?: "inclusive" | "exclusive";
  discount?: number;
  categoryId?: string;
  gst?: string;
  unit?: string;
  description?: string;
  images?: string[];
  amount?: number;
  notforsale?: boolean;
  openingStock?: Partial<IOpeningStock>;
  currentStock?: number;
  lowStockAlert?: number;
};

export type UpdateProductDto = Partial<Omit<CreateProductDto, "companyId">>;

export type UpdateProductSettingsDto = {
  defaultCategory?: string;
  defaultType?: "product" | "service";
  defaultPricePreference?: "inclusive" | "exclusive";
  defaultUnit?: string;
  maxDiscount?: number;
};

export interface IProductRepository {
  create(data: CreateProductDto): Promise<IProduct>;
  findAll(companyId: string): Promise<IProduct[]>;
  findById(id: string): Promise<IProduct | null>;
  update(id: string, data: UpdateProductDto): Promise<IProduct | null>;
  delete(id: string): Promise<void>;
  
  getSettings(companyId: string): Promise<any>;
  updateSettings(companyId: string, data: UpdateProductSettingsDto): Promise<any>;
}

export interface IProductService {
  create(data: CreateProductDto): Promise<IProduct>;
  findAll(companyId: string): Promise<IProduct[]>;
  findById(id: string): Promise<IProduct | null>;
  update(id: string, data: UpdateProductDto): Promise<IProduct | null>;
  delete(id: string): Promise<void>;
  
  getSettings(companyId: string): Promise<any>;
  updateSettings(companyId: string, data: UpdateProductSettingsDto): Promise<any>;
}
