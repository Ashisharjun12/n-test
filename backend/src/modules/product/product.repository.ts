import { Product, ProductSettings, IProduct } from "./product.schema.js";
import { CreateProductDto, IProductRepository, UpdateProductDto, UpdateProductSettingsDto } from "./product.interface.js";

export class ProductRepository implements IProductRepository {

  async create(data: CreateProductDto): Promise<IProduct> {
    const product = new Product(data);
    return product.save();
  }

  async findAll(companyId: string): Promise<IProduct[]> {
    return Product.find({ companyId })
      .populate("categoryId", "name")   // populate category name
      .lean<IProduct[]>();
  }

  async findById(id: string): Promise<IProduct | null> {
    return Product.findById(id)
      .populate("categoryId", "name")   // populate category name
      .lean<IProduct>();
  }

  async update(id: string, data: UpdateProductDto): Promise<IProduct | null> {
    return Product.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate("categoryId", "name")
      .lean<IProduct>();
  }

  async delete(id: string): Promise<void> {
    await Product.findByIdAndDelete(id);
  }

  async getSettings(companyId: string): Promise<any> {
    let settings = await ProductSettings.findOne({ companyId }).lean();
    if (!settings) {
      const newSettings = new ProductSettings({ companyId });
      await newSettings.save();
      settings = await ProductSettings.findOne({ companyId }).lean();
    }
    return settings;
  }

  async updateSettings(companyId: string, data: UpdateProductSettingsDto): Promise<any> {
    return ProductSettings.findOneAndUpdate(
      { companyId },
      { $set: data },
      { new: true, upsert: true }
    ).lean();
  }

}
