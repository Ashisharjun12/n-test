import { Product, ProductSettings, IProduct } from "./product.schema.js";
import { CreateProductDto, FindAllParams, IProductRepository, PaginatedResult, UpdateProductDto, UpdateProductSettingsDto } from "./product.interface.js";

export class ProductRepository implements IProductRepository {

  async create(data: CreateProductDto): Promise<IProduct> {
    const product = new Product(data);
    return product.save();
  }

  async findAll(companyId: string, params: FindAllParams = {}): Promise<PaginatedResult<IProduct>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { companyId };
    if (params.search?.trim()) {
      filter.name = { $regex: params.search.trim(), $options: "i" };
    }

    const [items, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("categoryId", "name")
        .lean<IProduct[]>(),
      Product.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
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
