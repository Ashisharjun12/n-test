import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IQuotationService } from "./quotation.interface.js";

export class QuotationController {
  constructor(private readonly quotationService: IQuotationService) {}

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");

    const quotations = await this.quotationService.findAll(companyId);
    res.status(200).json(new ApiResponse(200, quotations, "Quotations fetched successfully."));
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const quotation = await this.quotationService.findById(id);
    if (!quotation) throw ApiError.notFound("Quotation not found.");
    res.status(200).json(new ApiResponse(200, quotation, "Quotation fetched successfully."));
  });

  create = asyncHandler(async (req: Request, res: Response) => {
    const quotation = await this.quotationService.create(req.body);
    res.status(201).json(new ApiResponse(201, quotation, "Quotation created successfully."));
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const quotation = await this.quotationService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, quotation, "Quotation updated successfully."));
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.quotationService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Quotation deleted successfully."));
  });

  downloadPdf = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { buffer, filename } = await this.quotationService.generatePdf(id);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send(buffer);
  });

  previewHtml = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { html } = await this.quotationService.previewHtml(id);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  });
}
