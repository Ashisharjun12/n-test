import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { IUploadService } from "./upload.interface.js";

export class UploadController {
  constructor(private readonly uploadService: IUploadService) {}

  // POST /api/v1/upload/request-url
  requestUploadUrl = asyncHandler(async (req: Request, res: Response) => {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      throw ApiError.badRequest("filename and contentType are required.");
    }

    const result = await this.uploadService.requestUploadUrl(filename, contentType);
    res.status(200).json(new ApiResponse(200, result, "Upload URL generated successfully."));
  });

  // POST /api/v1/upload
  saveFileRecord = asyncHandler(async (req: Request, res: Response) => {
    const upload = await this.uploadService.saveFileRecord(req.body);
    res.status(201).json(new ApiResponse(201, upload, "File record saved successfully."));
  });

  // GET /api/v1/upload?purpose=xxx
  listFiles = asyncHandler(async (req: Request, res: Response) => {
    const purpose = req.query.purpose as string | undefined;
    const files = await this.uploadService.listFiles(purpose);
    res.status(200).json(new ApiResponse(200, files, "Files fetched successfully."));
  });

  // DELETE /api/v1/upload/:id
  deleteFile = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const success = await this.uploadService.deleteFile(id);
    if (!success) {
      throw ApiError.notFound("File record not found.");
    }
    res.status(200).json(new ApiResponse(200, null, "File deleted successfully."));
  });
}
