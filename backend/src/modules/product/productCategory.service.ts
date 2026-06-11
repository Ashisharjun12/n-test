import { ApiError } from "../../shared/errors/apiError.js";
import { CreateProductCategoryDto, IProductCategoryRepository, IProductCategoryService, UpdateProductCategoryDto } from "./productCategory.interface.js";
import { IProductCategory } from "./productCategory.schema.js";

export class ProductCategoryService implements IProductCategoryService {
  constructor(private readonly categoryRepo: IProductCategoryRepository) {}

  //create product category
  async create(data: CreateProductCategoryDto): Promise<IProductCategory> {
    return this.categoryRepo.create(data);
  }

  //get all product categories
  async findAll(companyId: string): Promise<IProductCategory[]> {
    return this.categoryRepo.findAll(companyId);
  }

  //get product category by id
  async findById(id: string): Promise<IProductCategory | null> {
    return this.categoryRepo.findById(id);
  }

  //update product category
  async update(id: string, data: UpdateProductCategoryDto): Promise<IProductCategory | null> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw ApiError.notFound("Product category not found.");
    return this.categoryRepo.update(id, data);
  }

  //delete product category
  async delete(id: string): Promise<void> {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw ApiError.notFound("Product category not found.");
    return this.categoryRepo.delete(id);
  }
}
