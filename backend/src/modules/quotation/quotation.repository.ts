import { Quotation, IQuotation } from "./quotation.schema.js";
import {
  CreateQuotationDto,
  IQuotationRepository,
  UpdateQuotationDto,
} from "./quotation.interface.js";

const POPULATE_FIELDS = [
  { path: "customer" },
  { path: "bank" },
  {
    path: "companyId",
    select: "name tradeName gst pan logo phone email website billingAddress signature",
  },
];

export class QuotationRepository implements IQuotationRepository {
  async create(data: CreateQuotationDto): Promise<IQuotation> {
    const quotation = new Quotation(data);
    const saved = await quotation.save();
    return Quotation.findById(saved._id).populate(POPULATE_FIELDS).lean<IQuotation>() as Promise<IQuotation>;
  }

  async findAll(companyId: string): Promise<IQuotation[]> {
    return Quotation.find({ companyId })
      .populate("customer", "name phone companyName")
      .sort({ createdAt: -1 })
      .lean<IQuotation[]>();
  }

  async findById(id: string): Promise<IQuotation | null> {
    return Quotation.findById(id).populate(POPULATE_FIELDS).lean<IQuotation>();
  }

  async update(id: string, data: UpdateQuotationDto): Promise<IQuotation | null> {
    return Quotation.findByIdAndUpdate(id, { $set: data }, { new: true })
      .populate(POPULATE_FIELDS)
      .lean<IQuotation>();
  }

  async delete(id: string): Promise<void> {
    await Quotation.findByIdAndDelete(id);
  }
}
