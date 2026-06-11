import { ApiError } from "../../shared/errors/apiError.js";
import { CreateDispatchAddressDto, IDispatchAddressRepository, IDispatchAddressService, UpdateDispatchAddressDto } from "./dispatchAddress.interface.js";
import { IDispatchAddress } from "./dispatchAddress.schema.js";

export class DispatchAddressService implements IDispatchAddressService {
  constructor(private readonly dispatchAddressRepo: IDispatchAddressRepository) {}

  async create(data: CreateDispatchAddressDto): Promise<IDispatchAddress> {
    return this.dispatchAddressRepo.create(data);
  }

  async findAll(companyId: string): Promise<IDispatchAddress[]> {
    return this.dispatchAddressRepo.findAll(companyId);
  }

  async findById(id: string): Promise<IDispatchAddress | null> {
    return this.dispatchAddressRepo.findById(id);
  }

  async update(id: string, data: UpdateDispatchAddressDto): Promise<IDispatchAddress | null> {
    const address = await this.dispatchAddressRepo.findById(id);
    if (!address) throw ApiError.notFound("Dispatch address not found.");
    return this.dispatchAddressRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const address = await this.dispatchAddressRepo.findById(id);
    if (!address) throw ApiError.notFound("Dispatch address not found.");
    return this.dispatchAddressRepo.delete(id);
  }
}
