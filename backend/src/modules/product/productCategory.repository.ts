import { ProductCategory, IProductCategory } from "./productCategory.schema.js";
import { CreateProductCategoryDto, IProductCategoryRepository, UpdateProductCategoryDto } from "./productCategory.interface.js";

export class ProductCategoryRepository implements IProductCategoryRepository {

  async create(data: CreateProductCategoryDto): Promise<IProductCategory> {
    const category = new ProductCategory(data);
    return category.save();
  }

  async findAll(companyId: string): Promise<IProductCategory[]> {
    return ProductCategory.find({ companyId }).lean<IProductCategory[]>();
  }

  async findById(id: string): Promise<IProductCategory | null> {
    return ProductCategory.findById(id).lean<IProductCategory>();
  }

  async update(id: string, data: UpdateProductCategoryDto): Promise<IProductCategory | null> {
    return ProductCategory.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<IProductCategory>();
  }

  async delete(id: string): Promise<void> {
    await ProductCategory.findByIdAndDelete(id);
  }
}
