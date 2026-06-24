import { IBank } from "./bank.schema.js";

// DTO for creating a bank
export type CreateBankDto = {
  companyId: string;
  ifsc?: string;
  bankName: string;
  accountNumber: string;
  branch: string;
  upi?: string;
  openingBalance?: number;
  gpay?: string;
  notes?: string;
  isDefault?: boolean;
};

// DTO for updating a bank
export type UpdateBankDto = Partial<Omit<CreateBankDto, "companyId">>;

// interface of the bank repositoryanansye taht
export interface IBankRepository {
  create(data: CreateBankDto): Promise<IBank>;
  findAll(companyId: string): Promise<IBank[]>;
  findById(id: string): Promise<IBank | null>;
  findByAccountNumber(accountNumber: string, companyId: string): Promise<IBank | null>;
  findDefault(companyId: string): Promise<IBank | null>;
  update(id: string, data: UpdateBankDto): Promise<IBank | null>;
  setDefault(id: string, companyId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

// interface of the bank service
export interface IBankService {
  create(data: CreateBankDto): Promise<IBank>;
  findAll(companyId: string): Promise<IBank[]>;
  findById(id: string): Promise<IBank | null>;
  update(id: string, data: UpdateBankDto): Promise<IBank | null>;
  setDefault(id: string, companyId: string): Promise<void>;
  delete(id: string): Promise<void>;
}

