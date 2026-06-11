import { ApiError } from "../../shared/errors/apiError.js";
import { CreateCompanyDto, ICompanyRepository, ICompanyService, UpdateCompanyDto } from "./company.interface.js";
import { ICompany } from "./company.schema.js";

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
}