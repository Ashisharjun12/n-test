import { Request, Response } from "express";
import { comparePassword, generateToken } from "../../utils/token.js";
import { asyncHandler } from "../../shared/middlewares/asyncHandler.middleware.js";
import { ApiResponse } from "../../shared/errors/apiResponse.js";
import { ApiError } from "../../shared/errors/apiError.js";
import { User } from "../user/user.schema.js";

export class AuthController {

  // POST /api/v1/auth/login
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw ApiError.badRequest("Email and password are required.");
    }

    // 1. Find user by email — include password for comparison
    const user = await User.findOne({ email }).select("+password").lean();
    if (!user || !user.password) {
      throw ApiError.unauthorized("Invalid credentials.");
    }

    // 2. Compare password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      throw ApiError.unauthorized("Invalid credentials.");
    }

    // 3. Generate JWT with role
    const token = generateToken(
      { userId: user._id, email: user.email, role: user.role },
      "7d"
    );

    // 4. Set HTTPOnly Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userWithoutPassword } = user;
    res.status(200).json(new ApiResponse(200, { user: userWithoutPassword }, "Logged in successfully."));
  });

  // POST /api/v1/auth/logout
  logout = asyncHandler(async (_req: Request, res: Response) => {
    res.clearCookie("token");
    res.status(200).json(new ApiResponse(200, null, "Logged out successfully."));
  });
}
