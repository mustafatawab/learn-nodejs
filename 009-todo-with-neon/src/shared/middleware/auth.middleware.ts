import type { Request, Response, NextFunction } from "express";
import { AppError } from "../error/AppError";
import { verifyAccessToken } from "../utils/jwt";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const accessToken = req.cookies.accessToken;
    if (!accessToken) {
      throw new AppError("Authentication Token is missing ", 401);
    }

    const decoded = verifyAccessToken(accessToken);

    // const token = authHeader.split(" ")[1];
    if (!decoded) {
      throw new AppError("The user not found ", 401);
    }
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof AppError) {
      return next(error);
    }
    next(new AppError("Unathorized - Invalid token ", 401));
  }
};
