import { ApiError } from "../../shared/errors/apiError.js";
import { AddCompanySignatureDto, CreateCompanyDto, ICompanyRepository, ICompanyService, UpdateCompanyDto } from "./company.interface.js";
import { ICompany, ICompanySignature } from "./company.schema.js";

export class CompanyService implements ICompanyService {
  constructor(private readonly companyRepo: ICompanyRepository) {}

  async create(data: CreateCompanyDto): Promise<ICompany> {
    return this.companyRepo.create(data);
  }

  // get all companies of a user
  async findAll(userId: string): Promise<ICompany[]> {
    return this.companyRepo.findAll(userId);
  }

  async findById(id: string): Promise<ICompany | null> {
    return this.companyRepo.findById(id);
  }

  async update(id: string, data: UpdateCompanyDto): Promise<ICompany | null> {
    const company = await this.companyRepo.findById(id);
    if (!company) throw ApiError.notFound("Company not found.");
    return this.companyRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const company = await this.companyRepo.findById(id);
    if (!company) throw ApiError.notFound("Company not found.");
    return this.companyRepo.delete(id);
  }

  async addSignature(companyId: string, data: AddCompanySignatureDto): Promise<ICompanySignature> {
    if (!data.url?.trim()) throw ApiError.badRequest("Signature URL is required.");
    if (!data.name?.trim()) throw ApiError.badRequest("Signature name is required.");

    const company = await this.companyRepo.findById(companyId);
    if (!company) throw ApiError.notFound("Company not found.");

    const updated = await this.companyRepo.addSignature(companyId, data);
    if (!updated) throw ApiError.notFound("Company not found.");

    const added = updated.signatures?.[updated.signatures.length - 1];
    if (!added) throw ApiError.internalServerError("Failed to save signature.");
    return added;
  }

  async setDefaultSignature(companyId: string, signatureId: string): Promise<void> {
    const company = await this.companyRepo.findById(companyId);
    if (!company) throw ApiError.notFound("Company not found.");

    const updated = await this.companyRepo.setDefaultSignature(companyId, signatureId);
    if (!updated) throw ApiError.notFound("Signature not found.");
  }
}