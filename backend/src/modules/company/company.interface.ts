import { IAddress } from "../customer/customer.schema.js";
import { ICompany, ICompanySignature, ISignature } from "./company.schema.js";

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
  defaultReference?: string;
  defaultNotes?: string;
  defaultTerms?: string;
};

// DTO for updating a company
export type UpdateCompanyDto = Partial<Omit<CreateCompanyDto, "userId">>;

export type AddCompanySignatureDto = {
  url: string;
  name: string;
  withStamp?: boolean;
  isDefault?: boolean;
  uploadId?: string;
};

// interface of the company repository
export interface ICompanyRepository {
  create(data: CreateCompanyDto): Promise<ICompany>;
  findAll(userId: string): Promise<ICompany[]>;
  findById(id: string): Promise<ICompany | null>;
  update(id: string, data: UpdateCompanyDto): Promise<ICompany | null>;
  addSignature(companyId: string, data: AddCompanySignatureDto): Promise<ICompany | null>;
  setDefaultSignature(companyId: string, signatureId: string): Promise<ICompany | null>;
  delete(id: string): Promise<void>;
}

// interface of the company service
export interface ICompanyService {
  create(data: CreateCompanyDto): Promise<ICompany>;
  findAll(userId: string): Promise<ICompany[]>;
  findById(id: string): Promise<ICompany | null>;
  update(id: string, data: UpdateCompanyDto): Promise<ICompany | null>;
  addSignature(companyId: string, data: AddCompanySignatureDto): Promise<ICompanySignature>;
  setDefaultSignature(companyId: string, signatureId: string): Promise<void>;
  delete(id: string): Promise<void>;
}
