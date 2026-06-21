import type { Request, Response, NextFunction } from "express";
import * as userService from "./user.service";

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await userService.createUserService(req.body);
  return res.status(201).json(user);
};

export const getAllUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await userService.getAllUserService();
  return res.status(200).json(user);
};


export const getUserByIdController = async (req: Request, res: Response , next: NextFunction) => {
    const user = await userService.getUserByIdService(req.params.id)
    return user
}

export const updateUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = await userService.updateUserService(req.params.id, req.body);

  res.json(user);


};

export const deleteUserController = async (req: Request, res: Response, next: NextFunction) => {
    await userService.deleteUserService(req.params.id)

    res.json({
        message: "User deleted successfully"
    })
}



