import { Customer, ICustomer } from "./customer.schema.js";
import { CreateCustomerDto, FindAllParams, ICustomerRepository, PaginatedResult, UpdateCustomerDto } from "./customer.interface.js";

export class CustomerRepository implements ICustomerRepository {

  async create(data: CreateCustomerDto): Promise<ICustomer> {
    const customer = new Customer(data);
    return customer.save();
  }

  async findAll(companyId: string, params: FindAllParams = {}): Promise<PaginatedResult<ICustomer>> {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { companyId };
    if (params.search?.trim()) {
      filter.$or = [
        { name: { $regex: params.search.trim(), $options: "i" } },
        { phone: { $regex: params.search.trim(), $options: "i" } },
        { companyName: { $regex: params.search.trim(), $options: "i" } },
      ];
    }

    const [items, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean<ICustomer[]>(),
      Customer.countDocuments(filter),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string): Promise<ICustomer | null> {
    return Customer.findById(id).lean<ICustomer>();
  }

  async update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null> {
    return Customer.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean<ICustomer>();
  }

  async delete(id: string): Promise<void> {
    await Customer.findByIdAndDelete(id);
  }
}
