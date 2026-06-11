import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IUserService } from "./user.interface.js";

export class UserController {
  constructor(private readonly userService: IUserService) {}

  // GET /api/v1/user
  getAll = asyncHandler(async (_req: Request, res: Response) => {
    const users = await this.userService.findAll();
    res.status(200).json(new ApiResponse(200, users, "Users fetched successfully."));
  });

  // GET /api/v1/user/:id
  getById = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await this.userService.findById(id);
    if (!user) throw ApiError.notFound("User not found.");
    res.status(200).json(new ApiResponse(200, user, "User fetched successfully."));
  });

  // POST /api/v1/user  (register)
  create = asyncHandler(async (req: Request, res: Response) => {
    const user = await this.userService.create(req.body);
    const { password: _, ...userWithoutPassword } = user as any;
    res.status(201).json(new ApiResponse(201, userWithoutPassword, "User created successfully."));
  });

  // PATCH /api/v1/user/:id
  update = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await this.userService.update(id, req.body);
    res.status(200).json(new ApiResponse(200, user, "User updated successfully."));
  });

  // PATCH /api/v1/user/:id/role  (Admin only)
  updateRole = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const user = await this.userService.updateRole(id, req.body);
    res.status(200).json(new ApiResponse(200, user, "User role updated successfully."));
  });

  // DELETE /api/v1/user/:id
  delete = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await this.userService.delete(id);
    res.status(200).json(new ApiResponse(200, null, "User deleted successfully."));
  });
}
