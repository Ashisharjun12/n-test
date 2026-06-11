import { Company, ICompany } from "./company.schema.js";
import { CreateCompanyDto, ICompanyRepository, UpdateCompanyDto } from "./company.interface.js";

export class CompanyRepository implements ICompanyRepository {

  async create(data: CreateCompanyDto): Promise<ICompany> {
    const company = new Company(data);
    return company.save();
  }

  // find all companies owned by a user
  async findAll(userId: string): Promise<ICompany[]> {
    return Company.find({ userId }).lean<ICompany[]>();
  }

  async findById(id: string): Promise<ICompany | null> {
    return Company.findById(id).lean<ICompany>();
  }

  async update(id: string, data: UpdateCompanyDto): Promise<ICompany | null> {
    return Company.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true }
    ).lean<ICompany>();
  }

  async delete(id: string): Promise<void> {
    await Company.findByIdAndDelete(id);
  }
}
