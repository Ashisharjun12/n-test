import { ApiError } from "../../shared/errors/apiError.js";
import { CreateProductDto, IProductRepository, IProductService, UpdateProductDto, UpdateProductSettingsDto } from "./product.interface.js";
import { IProduct } from "./product.schema.js";

export class ProductService implements IProductService {
  constructor(private readonly productRepo: IProductRepository) {}

  //create product 
  async create(data: CreateProductDto): Promise<IProduct> {
    if (data.openingStock?.quantity !== undefined && data.currentStock === undefined) {
      data.currentStock = data.openingStock.quantity;
    }
    return this.productRepo.create(data);
  }

  //get all products
  async findAll(companyId: string): Promise<IProduct[]> {
    return this.productRepo.findAll(companyId);
  }

  //get product by id
  async findById(id: string): Promise<IProduct | null> {
    return this.productRepo.findById(id);
  }

  //update product
  async update(id: string, data: UpdateProductDto): Promise<IProduct | null> {
    const product = await this.productRepo.findById(id);
    if (!product) throw ApiError.notFound("Product not found.");
    return this.productRepo.update(id, data);
  }

  //delete product
  async delete(id: string): Promise<void> {
    const product = await this.productRepo.findById(id);
    if (!product) throw ApiError.notFound("Product not found.");
    return this.productRepo.delete(id);
  }

  async getSettings(companyId: string): Promise<any> {
    return this.productRepo.getSettings(companyId);
  }

  async updateSettings(companyId: string, data: UpdateProductSettingsDto): Promise<any> {
    return this.productRepo.updateSettings(companyId, data);
  }

}
