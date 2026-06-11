import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IBankService } from "./bank.interface.js";

export class BankController {
  constructor(private readonly bankService: IBankService) {}

  // GET /api/v1/bank?companyId=xxx
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const banks = await this.bankService.findAll(companyId);
    res.status(200).json(new ApiResponse(200, banks, "Banks fetched successfully."));
  });

  // GET /api/v1/bank/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const bank = await this.bankService.findById(id);
    if (!bank) throw ApiError.notFound("Bank not found.");
    res.status(200).json(new ApiResponse(200, bank, "Bank fetched successfully."));
  });

  // POST /api/v1/bank
  create = asyncHandler(async (req: Request, res: Response) => {
    const bank = await this.bankService.create(req.body);
    res.status(201).json(new ApiResponse(201, bank, "Bank created successfully."));
  });

  // PATCH /api/v1/bank/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const bank = await this.bankService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, bank, "Bank updated successfully."));
  });

  // PATCH /api/v1/bank/:id/default
  setDefault = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const companyId = req.body.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId is required in body.");
    await this.bankService.setDefault(id, companyId);
    res.status(200).json(new ApiResponse(200, null, "Default bank updated."));
  });

  // DELETE /api/v1/bank/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.bankService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Bank deleted successfully."));
  });
}
