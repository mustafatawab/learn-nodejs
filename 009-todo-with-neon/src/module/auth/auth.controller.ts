import type { Request, Response, NextFunction } from "express";
import { registerUser, loginUser, getMe, forgotPassword } from "./auth.service";

import { registerSchema, loginSchema } from "./auth.schema";

export const registerUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
      const validatedData = registerSchema.parse(req.body);
      console.log("\nValidated Data " , validatedData)

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

    res.cookie("accessToken" , result.accessToken , {
        httpOnly : true,
        maxAge : 24 * 60 * 60

    })

    res.cookie("refreshToken" , result.refreshToken , {
        httpOnly : true,
        maxAge : 7 * 24 * 60 * 60
    })

    return res
      .status(201)
      .json({ message: "User logged in successfully"});
  } catch (error) {
    return next(error);
  }
};


export const getMeHandler = async (req: Request , res: Response , next: NextFunction) => {
    try {
        
        
        const result = await getMe(req.user?.userId)

        

    } catch (error) {
        return next(error)
    }
}