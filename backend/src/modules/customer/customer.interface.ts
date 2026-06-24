import { IAddress, ICustomer } from "./customer.schema.js";
import { FindAllParams, PaginatedResult } from "../product/product.interface.js";

type TaxSection = { code: string; name: string; rate: number };

// DTO for creating a customer (linked to a Company)
export type CreateCustomerDto = {
  companyId: string;
  name: string;
  phone?: string;
  email?: string;
  companyName?: string;
  gst?: string;
  pan?: string;
  billingAddress?: Partial<IAddress>;
  shippingAddress?: Partial<IAddress>;

  // Preferences
  discount?: number;
  discountType?: "Percent" | "Flat";
  creditLimit?: number;
  priceList?: string;
  defaultDueDate?: string;
  tdsApplicable?: boolean;
  tdsSection?: TaxSection;
  tcsApplicable?: boolean;
  tcsSection?: TaxSection;

  // Other Details
  openingBalance?: number;
  openingBalanceType?: "Debit" | "Credit";
  notes?: string;
  ccEmails?: string[];
  tags?: string[];
  customFields?: Record<string, string>;
};

// DTO for updating a customer
export type UpdateCustomerDto = Partial<Omit<CreateCustomerDto, "companyId">>;

export { FindAllParams, PaginatedResult };

// interface of the customer repository
export interface ICustomerRepository {
  create(data: CreateCustomerDto): Promise<ICustomer>;
  findAll(companyId: string, params?: FindAllParams): Promise<PaginatedResult<ICustomer>>;
  findById(id: string): Promise<ICustomer | null>;
  update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null>;
  delete(id: string): Promise<void>;
}

// interface of the customer service
export interface ICustomerService {
  create(data: CreateCustomerDto): Promise<ICustomer>;
  findAll(companyId: string, params?: FindAllParams): Promise<PaginatedResult<ICustomer>>;
  findById(id: string): Promise<ICustomer | null>;
  update(id: string, data: UpdateCustomerDto): Promise<ICustomer | null>;
  delete(id: string): Promise<void>;
}
