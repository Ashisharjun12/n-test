import { ApiError } from "../../shared/errors/apiError.js";
import { CreateBankDto, IBankRepository, IBankService, UpdateBankDto } from "./bank.interface.js";
import { IBank } from "./bank.schema.js";

export class BankService implements IBankService {
  constructor(private readonly bankRepo: IBankRepository) {}

  async create(data: CreateBankDto): Promise<IBank> {
    // check duplicate account number
    const existing = await this.bankRepo.findByAccountNumber(data.accountNumber);
    if (existing) throw ApiError.conflict("A bank account with this account number already exists.");

    // if first bank for this company, auto-set as default
    const banks = await this.bankRepo.findAll(data.companyId);
    if (banks.length === 0) data.isDefault = true;
    return this.bankRepo.create(data);
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
    return this.bankRepo.update(id, data);
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
