import { IDispatchAddress } from "./dispatchAddress.schema.js";

// DTO for creating a dispatch address
export type CreateDispatchAddressDto = {
  companyId: string;
  addressLine1: string;
  addressLine2?: string;
  pincode: string;
  city?: string;
  state?: string;
};

// DTO for updating a dispatch address
export type UpdateDispatchAddressDto = Partial<Omit<CreateDispatchAddressDto, "companyId">>;

// interface of the dispatch address repository
export interface IDispatchAddressRepository {
  create(data: CreateDispatchAddressDto): Promise<IDispatchAddress>;
  findAll(companyId: string): Promise<IDispatchAddress[]>;
  findById(id: string): Promise<IDispatchAddress | null>;
  update(id: string, data: UpdateDispatchAddressDto): Promise<IDispatchAddress | null>;
  delete(id: string): Promise<void>;
}

// interface of the dispatch address service
export interface IDispatchAddressService {
  create(data: CreateDispatchAddressDto): Promise<IDispatchAddress>;
  findAll(companyId: string): Promise<IDispatchAddress[]>;
  findById(id: string): Promise<IDispatchAddress | null>;
  update(id: string, data: UpdateDispatchAddressDto): Promise<IDispatchAddress | null>;
  delete(id: string): Promise<void>;
}
