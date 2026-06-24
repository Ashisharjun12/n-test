import { ApiError } from "../../shared/errors/apiError.js";
import {
  CreateQuotationDto,
  IQuotationRepository,
  IQuotationService,
  UpdateQuotationDto,
} from "./quotation.interface.js";
import { IQuotation } from "./quotation.schema.js";
import { QuotationPdfService } from "./pdf/quotationPdf.service.js";

export class QuotationService implements IQuotationService {
  private readonly pdfService: QuotationPdfService;

  constructor(private readonly quotationRepo: IQuotationRepository) {
    this.pdfService = new QuotationPdfService(quotationRepo);
  }

  async create(data: CreateQuotationDto): Promise<IQuotation> {
    if (!data.customer) throw ApiError.badRequest("Customer is required.");
    if (!data.items?.length) throw ApiError.badRequest("At least one item is required.");
    return this.quotationRepo.create(data);
  }

  async findAll(companyId: string): Promise<IQuotation[]> {
    return this.quotationRepo.findAll(companyId);
  }

  async findById(id: string): Promise<IQuotation | null> {
    return this.quotationRepo.findById(id);
  }

  async update(id: string, data: UpdateQuotationDto): Promise<IQuotation | null> {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw ApiError.notFound("Quotation not found.");
    return this.quotationRepo.update(id, data);
  }

  async delete(id: string): Promise<void> {
    const quotation = await this.quotationRepo.findById(id);
    if (!quotation) throw ApiError.notFound("Quotation not found.");
    return this.quotationRepo.delete(id);
  }

  async generatePdf(id: string): Promise<{ buffer: Buffer; filename: string }> {
    return this.pdfService.generate(id);
  }

  async previewHtml(id: string): Promise<{ html: string; filename: string }> {
    return this.pdfService.renderHtml(id);
  }
}
