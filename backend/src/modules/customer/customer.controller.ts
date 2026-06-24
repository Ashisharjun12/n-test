import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { ICustomerService } from "./customer.interface.js";

export class CustomerController {
  constructor(private readonly customerService: ICustomerService) {}

  // GET /api/v1/customer?companyId=xxx&page=1&limit=20&search=term
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const result = await this.customerService.findAll(companyId, { page, limit, search });
    res.status(200).json(new ApiResponse(200, result, "Customers fetched successfully."));
  });

  // GET /api/v1/customer/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const customer = await this.customerService.findById(id);
    if (!customer) throw ApiError.notFound("Customer not found.");
    res.status(200).json(new ApiResponse(200, customer, "Customer fetched successfully."));
  });

  // POST /api/v1/customer
  create = asyncHandler(async (req: Request, res: Response) => {
    const customer = await this.customerService.create(req.body);
    res.status(201).json(new ApiResponse(201, customer, "Customer created successfully."));
  });

  // PATCH /api/v1/customer/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const customer = await this.customerService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, customer, "Customer updated successfully."));
  });

  // DELETE /api/v1/customer/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.customerService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Customer deleted successfully."));
  });
}
