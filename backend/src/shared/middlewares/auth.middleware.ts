import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../utils/token.js";
import { ApiError } from "../errors/apiError.js";



export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
 
  const token = req.cookies.token;

  if (!token) {
    return next(ApiError.unauthorized("Authentication token is missing. Please log in."));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(ApiError.unauthorized("Invalid or expired token. Please log in again."));
  }
};
