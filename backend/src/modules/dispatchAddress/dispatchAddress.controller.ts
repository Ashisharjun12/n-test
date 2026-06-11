import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IDispatchAddressService } from "./dispatchAddress.interface.js";

export class DispatchAddressController {
  constructor(private readonly dispatchAddressService: IDispatchAddressService) {}

  // GET /api/v1/dispatchAddress?companyId=xxx
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const addresses = await this.dispatchAddressService.findAll(companyId);
    res.status(200).json(new ApiResponse(200, addresses, "Dispatch addresses fetched successfully."));
  });

  // GET /api/v1/dispatchAddress/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const address = await this.dispatchAddressService.findById(id);
    if (!address) throw ApiError.notFound("Dispatch address not found.");
    res.status(200).json(new ApiResponse(200, address, "Dispatch address fetched successfully."));
  });

  // POST /api/v1/dispatchAddress
  create = asyncHandler(async (req: Request, res: Response) => {
    const address = await this.dispatchAddressService.create(req.body);
    res.status(201).json(new ApiResponse(201, address, "Dispatch address created successfully."));
  });

  // PATCH /api/v1/dispatchAddress/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const address = await this.dispatchAddressService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, address, "Dispatch address updated successfully."));
  });

  // DELETE /api/v1/dispatchAddress/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.dispatchAddressService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Dispatch address deleted successfully."));
  });
}
