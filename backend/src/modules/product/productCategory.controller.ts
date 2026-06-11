import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IProductCategoryService } from "./productCategory.interface.js";

export class ProductCategoryController {
  constructor(private readonly categoryService: IProductCategoryService) {}

  // GET /api/v1/productCategory?companyId=xxx
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const companyId = req.query.companyId as string;
    if (!companyId) throw ApiError.badRequest("companyId query param is required.");
    const categories = await this.categoryService.findAll(companyId);
    res.status(200).json(new ApiResponse(200, categories, "Categories fetched successfully."));
  });

  // GET /api/v1/productCategory/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.findById(id);
    if (!category) throw ApiError.notFound("Category not found.");
    res.status(200).json(new ApiResponse(200, category, "Category fetched successfully."));
  });

  // POST /api/v1/productCategory
  create = asyncHandler(async (req: Request, res: Response) => {
    const category = await this.categoryService.create(req.body);
    res.status(201).json(new ApiResponse(201, category, "Category created successfully."));
  });

  // PATCH /api/v1/productCategory/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const category = await this.categoryService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, category, "Category updated successfully."));
  });

  // DELETE /api/v1/productCategory/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.categoryService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "Category deleted successfully."));
  });
}
