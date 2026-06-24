import { ApiError } from "../../shared/errors/apiError.js";
import { CreateBankDto, IBankRepository, IBankService, UpdateBankDto } from "./bank.interface.js";
import { IBank } from "./bank.schema.js";

export class BankService implements IBankService {
  constructor(private readonly bankRepo: IBankRepository) {}

  async create(data: CreateBankDto): Promise<IBank> {
    const existing = await this.bankRepo.findByAccountNumber(data.accountNumber, data.companyId);
    if (existing) throw ApiError.conflict("A bank account with this account number already exists.");

    const banks = await this.bankRepo.findAll(data.companyId);
    const shouldBeDefault = data.isDefault === true || banks.length === 0;

    const bank = await this.bankRepo.create({ ...data, isDefault: shouldBeDefault && data.isDefault !== false });

    if (shouldBeDefault) {
      await this.bankRepo.setDefault(String(bank._id), data.companyId);
      return (await this.bankRepo.findById(String(bank._id)))!;
    }

    return bank;
  }

  async findAll(companyId: string): Promise<IBank[]> {
    return this.bankRepo.findAll(companyId);
  }

  async findById(id: string): Promise<IBank | null> {
    return this.bankRepo.findById(id);
  }

  async update(id: string, data: UpdateBankDto): Promise<IBank | null> {
    const bank = await this.bankRepo.findById(id);
    if (!bank) throw ApiError.notFound("Bank not found.");

    if (data.accountNumber && data.accountNumber !== bank.accountNumber) {
      const existing = await this.bankRepo.findByAccountNumber(data.accountNumber, String(bank.companyId));
      if (existing && String(existing._id) !== id) {
        throw ApiError.conflict("A bank account with this account number already exists.");
      }
    }

    const updated = await this.bankRepo.update(id, data);
    if (data.isDefault === true) {
      await this.bankRepo.setDefault(id, String(bank.companyId));
      return this.bankRepo.findById(id);
    }
    return updated;
  }

  async setDefault(id: string, companyId: string): Promise<void> {
    const bank = await this.bankRepo.findById(id);
    if (!bank) throw ApiError.notFound("Bank not found.");
    return this.bankRepo.setDefault(id, companyId);
  }

  async delete(id: string): Promise<void> {
    const bank = await this.bankRepo.findById(id);
    if (!bank) throw ApiError.notFound("Bank not found.");
    return this.bankRepo.delete(id);
  }
}
