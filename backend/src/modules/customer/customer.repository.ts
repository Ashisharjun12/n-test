import { Customer, ICustomer } from "./customer.schema.js";
import { CreateCustomerDto, ICustomerRepository, UpdateCustomerDto } from "./customer.interface.js";

export class CustomerRepository implements ICustomerRepository {

  async create(data: CreateCustomerDto): Promise<ICustomer> {
    const customer = new Customer(data);
    return customer.save();
  }

  // find all customers of a specific company
  async findAll(companyId: string): Promise<ICustomer[]> {
    return Customer.find({ companyId }).lean<ICustomer[]>();
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
