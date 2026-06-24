import { Request, Response } from "express";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";

export class GstController {
  /**
   * GST verification endpoint.
   * In dev mode returns a derived mock tradeName from the GSTIN.
   * In production, replace this with an actual GST API call.
   */
  verify = asyncHandler(async (req: Request, res: Response) => {
    const { gstin } = req.body as { gstin?: string };
    if (!gstin?.trim()) throw ApiError.badRequest("gstin is required.");

    const normalized = gstin.trim().toUpperCase();
    const isValidFormat = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(normalized);

    if (!isValidFormat) {
      throw ApiError.badRequest("Invalid GSTIN format. Expected: 22AAAAA0000A1Z5");
    }

    // Dev/placeholder: derive a readable mock trade name from the PAN in the GSTIN
    const pan = normalized.slice(2, 12);
    const entityName = pan.slice(0, 5).toUpperCase();
    const tradeName = `${entityName} ENTERPRISES`;

    res.status(200).json(
      new ApiResponse(
        200,
        { isValid: true, gstin: normalized, tradeName },
        "GSTIN verified."
      )
    );
  });
}
