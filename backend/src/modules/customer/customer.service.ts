import { ApiError } from "../../shared/errors/apiError.js";
import { CreateCustomerDto, ICustomerRepository, ICustomerService, UpdateCustomerDto } from "./customer.interface.js";
import { ICustomer } from "./customer.schema.js";

export class CustomerService implements ICustomerService {
  constructor(private readonly customerRepo: ICustomerRepository) {}

  async create(data: CreateCustomerDto): Promise<ICustomer> {
    return this.customerRepo.create(data);
  }

  // get all customers of a company
  async findAll(companyId: string): Promise<ICustomer[]> {
    return this.customerRepo.findAll(companyId);
  }

  async findById(id: string): Promise<ICustomer | null> {
    return this.customerRepo.findById(id);
  }

  async update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found.");
    return this.customerRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found.");
    return this.customerRepo.delete(id);
  }
}
