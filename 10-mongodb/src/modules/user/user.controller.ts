import type { Request, Response, NextFunction } from "express";
import * as userService from "./user.service";
import { AppError } from "../../shared/error/AppError";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.createUserService(req.body);
    return res.status(201).json(user);
  } catch (error) {
    return next(error);
  }
};

export const loginUserController = async (req: Request, res: Response, next: NextFunction) => {
  try {
      const result = await userService.loginUserService(req.body)
      return res.status(200).json({message : "User Logged In successfully"})
  } catch (error) {
    return next(error)
  }
}

export const getAllUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const user = await userService.getAllUserService();
    return res.status(200).json(user);
  } catch (error) {
    return next(error);
  }
};

export const getUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError("User ID is required in the parmas ", 401);
    }
    const user = await userService.getUserByIdService(userId as string);
    return user;
  } catch (error) {
    return next(error);
  }
};

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      throw new AppError("User ID is required from the Params", 401);
    }
    const user = await userService.updateUserService(
      userId as string,
      req.body,
    );

    res.json(user);
  } catch (error) {
    return next(error);
  }
};

export const deleteUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.params.id;

  if (!userId) {
    throw new AppError("User ID is required from the Params", 401);
  }
  await userService.deleteUserService(userId as string);

  res.json({
    message: "User deleted successfully",
  });
};
