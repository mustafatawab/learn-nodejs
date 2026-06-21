import type {Request, Response, NextFunction} from "express"
import { AppError } from "./AppError";

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  
  // 1. Check if it's an operational error we deliberately threw
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // 2. If it's NOT an AppError, it's an unexpected bug (e.g., database crash)
  console.error("💥 CRITICAL SYSTEM ERROR:", err); // Log details for developers
  
  return res.status(500).json({
    success: false,
    message: "Something went completely wrong on our end.", // Hide raw database errors from users
  });
};