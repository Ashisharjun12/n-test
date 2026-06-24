import { ISignatureSnapshot, IQuotation } from "./quotation.schema.js";

export type QuotationItemDto = {
  productId?: string;
  name?: string;
  description?: string;
  hsn?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  taxRate?: number;
  total?: number;
};

export type ChargeDto = {
  type?: "shipping" | "packaging" | "other";
  label?: string;
  rawValue?: number;
  valueMode?: "flat" | "percent";
  taxRate?: number;
  taxInclusive?: boolean;
  amount?: number;
};

export type SignatureSnapshotDto = {
  url?: string;
  name?: string;
  withStamp?: boolean;
};

export type CreateQuotationDto = {
  companyId: string;
  quotationNo?: string;
  customer: string;
  documentDate?: Date | string;
  dueDate?: Date | string;
  documentTitle?: "Quotation" | "Estimate";
  withGst?: boolean;
  isExportSEZ?: boolean;
  placeOfSupply?: string;
  paymentMethod?: "cash" | "bank";
  items: QuotationItemDto[];
  subTotal?: number;
  discount?: number;
  extraCharges?: ChargeDto[];
  totalAmount?: number;
  roundOff?: boolean;
  dispatchAddress?: Record<string, unknown>;
  shippingAddress?: Record<string, unknown>;
  bank?: string;
  signature?: SignatureSnapshotDto;
  reference?: string;
  notes?: string;
  terms?: string;
  attachments?: string[];
  status?: "DRAFT" | "CREATED";
};

export type UpdateQuotationDto = Partial<Omit<CreateQuotationDto, "companyId">>;

export interface IQuotationRepository {
  create(data: CreateQuotationDto): Promise<IQuotation>;
  findAll(companyId: string): Promise<IQuotation[]>;
  findById(id: string): Promise<IQuotation | null>;
  update(id: string, data: UpdateQuotationDto): Promise<IQuotation | null>;
  delete(id: string): Promise<void>;
}

export interface IQuotationService {
  create(data: CreateQuotationDto): Promise<IQuotation>;
  findAll(companyId: string): Promise<IQuotation[]>;
  findById(id: string): Promise<IQuotation | null>;
  update(id: string, data: UpdateQuotationDto): Promise<IQuotation | null>;
  delete(id: string): Promise<void>;
  generatePdf(id: string): Promise<{ buffer: Buffer; filename: string }>;
  previewHtml(id: string): Promise<{ html: string; filename: string }>;
}
