import { asyncHandler } from "../utils/asyncHandler.js";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ApiError } from "../utils/ApiError.js";

const verifyToken = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      throw new ApiError(401, "Authentication required");
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || ""
      ) as {
        id: string;
        email: string;
        fullName: string;
        profilePic?: string;
      };

      req.user = decoded;
      next();
    } catch {
      throw new ApiError(401, "Invalid or expired token");
    }
  }
);

export { verifyToken };
