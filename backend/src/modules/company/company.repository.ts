import { Company, ICompany, ICompanySignature } from "./company.schema.js";
import { AddCompanySignatureDto, CreateCompanyDto, ICompanyRepository, UpdateCompanyDto } from "./company.interface.js";

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

  async addSignature(companyId: string, data: AddCompanySignatureDto): Promise<ICompany | null> {
    const company = await Company.findById(companyId);
    if (!company) return null;

    const isFirst = !company.signatures?.length;
    const makeDefault = isFirst || data.isDefault === true;

    const entry = {
      url: data.url,
      name: data.name,
      withStamp: data.withStamp ?? false,
      isDefault: makeDefault,
      uploadId: data.uploadId,
    };

    if (makeDefault) {
      company.signatures?.forEach((sig) => {
        sig.isDefault = false;
      });
    }

    company.signatures = company.signatures || [];
    company.signatures.push(entry as ICompanySignature);

    if (makeDefault) {
      company.signature = {
        url: data.url,
        name: data.name,
        withStamp: data.withStamp ?? false,
      };
    }

    await company.save();
    return company.toObject() as ICompany;
  }

  async setDefaultSignature(companyId: string, signatureId: string): Promise<ICompany | null> {
    const company = await Company.findById(companyId);
    if (!company) return null;

    const target = company.signatures?.find((sig) => String(sig._id) === signatureId);
    if (!target) return null;

    company.signatures?.forEach((sig) => {
      sig.isDefault = String(sig._id) === signatureId;
    });

    company.signature = {
      url: target.url,
      name: target.name,
      withStamp: target.withStamp,
    };

    await company.save();
    return company.toObject() as ICompany;
  }
}
