import { DispatchAddress, IDispatchAddress } from "./dispatchAddress.schema.js";
import { CreateDispatchAddressDto, IDispatchAddressRepository, UpdateDispatchAddressDto } from "./dispatchAddress.interface.js";

export class DispatchAddressRepository implements IDispatchAddressRepository {

  async create(data: CreateDispatchAddressDto): Promise<IDispatchAddress> {
    const address = new DispatchAddress(data);
    return address.save();
  }

  async findAll(companyId: string): Promise<IDispatchAddress[]> {
    return DispatchAddress.find({ companyId }).lean<IDispatchAddress[]>();
  }

  async findById(id: string): Promise<IDispatchAddress | null> {
    return DispatchAddress.findById(id).lean<IDispatchAddress>();
  }

  async update(id: string, data: UpdateDispatchAddressDto): Promise<IDispatchAddress | null> {
    return DispatchAddress.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<IDispatchAddress>();
  }

  async delete(id: string): Promise<void> {
    await DispatchAddress.findByIdAndDelete(id);
  }
}
