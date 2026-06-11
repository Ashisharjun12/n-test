import { IAddress, ICustomer } from "./customer.schema.js";

// DTO for creating a customer (linked to a Company)
export type CreateCustomerDto = {
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  companyName?: string;
  gst?: string;
  billingAddress?: Partial<IAddress>;
  shippingAddress?: Partial<IAddress>;
};

// DTO for updating a customer
export type UpdateCustomerDto = Partial<Omit<CreateCustomerDto, "companyId">>;

// interface of the customer repository
export interface ICustomerRepository {
  create(data: CreateCustomerDto): Promise<ICustomer>;
  findAll(companyId: string): Promise<ICustomer[]>;
  findById(id: string): Promise<ICustomer | null>;
  update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null>;
  delete(id: string): Promise<void>;
}

// interface of the customer service
export interface ICustomerService {
  create(data: CreateCustomerDto): Promise<ICustomer>;
  findAll(companyId: string): Promise<ICustomer[]>;
  findById(id: string): Promise<ICustomer | null>;
  update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null>;
  delete(id: string): Promise<void>;
}
