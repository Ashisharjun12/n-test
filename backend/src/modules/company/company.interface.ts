import { IAddress } from "../customer/customer.schema.js";
import { ICompany, ISignature } from "./company.schema.js";

// DTO for creating a company
export type CreateCompanyDto = {
  userId: string;
  name?: string;
  gst?: string;
  phone?: string;
  email?: string;
  tradeName?: string;
  logo?: string;
  signature?: Partial<ISignature>;
  pan?: string;
  alternatePhone?: string;
  website?: string;
  billingAddress?: Partial<IAddress>;
  shippingAddress?: Partial<IAddress>;
};

// DTO for updating a company
export type UpdateCompanyDto = Partial<Omit<CreateCompanyDto, "userId">>;

// interface of the company repository
export interface ICompanyRepository {
  create(data: CreateCompanyDto): Promise<ICompany>;
  findAll(userId: string): Promise<ICompany[]>;
  findById(id: string): Promise<ICompany | null>;
  update(id: string, data: UpdateCompanyDto): Promise<ICompany | null>;
  delete(id: string): Promise<void>;
}

// interface of the company service
export interface ICompanyService {
  create(data: CreateCompanyDto): Promise<ICompany>;
  findAll(userId: string): Promise<ICompany[]>;
  findById(id: string): Promise<ICompany | null>;
  update(id: string, data: UpdateCompanyDto): Promise<ICompany | null>;
  delete(id: string): Promise<void>;
}
