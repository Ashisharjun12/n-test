import { IProductCategory } from "./productCategory.schema.js";

export type CreateProductCategoryDto = {
  companyId: string;
  name: string;
  description?: string;
};

export type UpdateProductCategoryDto = Partial<Omit<CreateProductCategoryDto, "companyId">>;

export interface IProductCategoryRepository {
  create(data: CreateProductCategoryDto): Promise<IProductCategory>;
  findAll(companyId: string): Promise<IProductCategory[]>;
  findById(id: string): Promise<IProductCategory | null>;
  update(id: string, data: UpdateProductCategoryDto): Promise<IProductCategory | null>;
  delete(id: string): Promise<void>;
}

export interface IProductCategoryService {
  create(data: CreateProductCategoryDto): Promise<IProductCategory>;
  findAll(companyId: string): Promise<IProductCategory[]>;
  findById(id: string): Promise<IProductCategory | null>;
  update(id: string, data: UpdateProductCategoryDto): Promise<IProductCategory | null>;
  delete(id: string): Promise<void>;
}
