import crypto from "crypto";
import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/AppError";

const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

const CSRF_EXEMPT_PATHS = [
  "/api/auth/login",
  "/api/auth/verify-otp",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/setup-account",
  "/api/auth/setup-account-info",
];

export const generateCsrfToken = () => {
  return crypto.randomBytes(24).toString("hex");
};

const isCsrfExempt = (path: string): boolean => {
  return CSRF_EXEMPT_PATHS.some(
    (exemptPath) => path === exemptPath || path.startsWith(exemptPath),
  );
};

export const csrfMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // 1. Skip Safe Methods
  if (SAFE_METHODS.includes(req.method)) {
    return next();
  }

  // 2. Skip public routes
  const fullPath = req.originalUrl.split("?")[0] as string;

  if (isCsrfExempt(fullPath)) {
    return next();
  }

  // 3. Get token from header and cookie
  const cookieToken = req.cookies["csrfToken"];
  const headerToken = req.headers["x-csrf-token"] as string;

  // 4. Validate tokens
  if (!cookieToken || !headerToken) {
    return res.status(403).json({
      success: false,
      message: "CSRF token missing",
    });
  }

  // 5. Compare with timingSafeEqual
  if (
    !crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid CSRF token",
    });
  }

  // 6. Tokens are valid
  next();
};
