import { Bank, IBank } from "./bank.schema.js";
import { CreateBankDto, IBankRepository, UpdateBankDto } from "./bank.interface.js";

export class BankRepository implements IBankRepository {

  async create(data: CreateBankDto): Promise<IBank> {
    const bank = new Bank(data);
    return bank.save();
  }

  async findAll(companyId: string): Promise<IBank[]> {
    return Bank.find({ companyId }).lean<IBank[]>();
  }

  async findById(id: string): Promise<IBank | null> {
    return Bank.findById(id).lean<IBank>();
  }

  async findByAccountNumber(accountNumber: string): Promise<IBank | null> {
    return Bank.findOne({ accountNumber }).lean<IBank>();
  }

  async findDefault(companyId: string): Promise<IBank | null> {
    return Bank.findOne({ companyId, isDefault: true }).lean<IBank>();
  }

  async update(id: string, data: UpdateBankDto): Promise<IBank | null> {
    return Bank.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<IBank>();
  }

  // set one bank as default, unset all others for this company
  async setDefault(id: string, companyId: string): Promise<void> {
    await Bank.updateMany({ companyId }, { $set: { isDefault: false } });
    await Bank.findByIdAndUpdate(id, { $set: { isDefault: true } });
  }

  async delete(id: string): Promise<void> {
    await Bank.findByIdAndDelete(id);
  }
}
