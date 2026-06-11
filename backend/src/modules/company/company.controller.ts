import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { ICompanyService } from "./company.interface.js";

export class CompanyController {
  constructor(private readonly companyService: ICompanyService) {}

  // GET /api/v1/company?userId=xxx
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.query.userId as string;
    if (!userId) throw ApiError.badRequest("userId query param is required.");
    const companies = await this.companyService.findAll(userId);
    res.status(200).json(new ApiResponse(200, companies, "Companies fetched successfully."));
  });

  // GET /api/v1/company/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const company = await this.companyService.findById(id);
    if (!company) throw ApiError.notFound("Company not found.");
    res.status(200).json(new ApiResponse(200, company, "Company fetched successfully."));
  });

  // POST /api/v1/company
  createCompany = asyncHandler(async (req: Request, res: Response) => {
    const company = await this.companyService.create(req.body);
    res.status(201).json(new ApiResponse(201, company, "Company created successfully."));
  });

  // PATCH /api/v1/company/:id
  updateCompany = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const company = await this.companyService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, company, "Company updated successfully."));
  });

  // DELETE /api/v1/company/:id
  deleteCompany = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.companyService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Company deleted successfully."));
  });
}