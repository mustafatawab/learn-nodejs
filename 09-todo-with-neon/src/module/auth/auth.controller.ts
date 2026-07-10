import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getMe, refreshToken, logoutUser } from "./auth.service.js";

import { registerSchema, loginSchema } from "./auth.schema.js";
import { AppError } from "../../shared/error/AppError.js";
import { verifyAccessToken } from "../../shared/utils/jwt.js";

export const registerUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    console.log("\nValidated Data ", validatedData);

    const result = await registerUser(validatedData);

    return res.status(201).json({ message: "user Created", data: result });
  } catch (error) {
    return next(error);
  }
};

export const loginUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await loginUser(validatedData);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.cookie("csrfToken", result.csrfToken, {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "User logged in successfully" , result });
  } catch (error) {
    return next(error);
  }
};

export const getMeHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    console.log("Get me handler working ....");
    // const token = req.cookies.accessToken

    // console.log("Token " , token)

    // const decodedData = verifyAccessToken(token)

    // const userId = decodedData?.userId

    const userId = req.user?.userId;

    if (!userId) {
      throw new AppError("Unauthorized - no user in request", 401);
    }
    const result = await getMe(userId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return next(error);
  }
};

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      throw new AppError("Unauthorized - no user in request", 401);
    }

    await logoutUser(userId);


    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    req.user = undefined;

    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return next(error);
  }
};

export const refreshTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      throw new AppError("No refresh token provided", 400);
    }
  
    const { newAccessToken, newRefreshToken } = await refreshToken(token);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    }); 

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return next(error);
  }
};
