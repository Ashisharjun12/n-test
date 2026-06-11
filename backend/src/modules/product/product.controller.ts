import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IProductService } from "./product.interface.js";

export class ProductController {
  constructor(private readonly productService: IProductService) {}

  // GET /api/v1/product?companyId=xxx
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const products = await this.productService.findAll(companyId);
    res.status(200).json(new ApiResponse(200, products, "Products fetched successfully."));
  });

  // GET /api/v1/product/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await this.productService.findById(id);
    if (!product) throw ApiError.notFound("Product not found.");
    res.status(200).json(new ApiResponse(200, product, "Product fetched successfully."));
  });

  // POST /api/v1/product
  create = asyncHandler(async (req: Request, res: Response) => {
    const product = await this.productService.create(req.body);
    res.status(201).json(new ApiResponse(201, product, "Product created successfully."));
  });

  // PATCH /api/v1/product/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const product = await this.productService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, product, "Product updated successfully."));
  });

  // DELETE /api/v1/product/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.productService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Product deleted successfully."));
  });

  // GET /api/v1/product/settings?companyId=xxx
  getSettings = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const settings = await this.productService.getSettings(companyId);
    res.status(200).json(new ApiResponse(200, settings, "Product settings fetched successfully."));
  });

  // PUT /api/v1/product/settings?companyId=xxx
  updateSettings = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const settings = await this.productService.updateSettings(companyId, req.body);
    res.status(200).json(new ApiResponse(200, settings, "Product settings updated successfully."));
  });

}
