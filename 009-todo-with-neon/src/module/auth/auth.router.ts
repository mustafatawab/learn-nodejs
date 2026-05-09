import { Router } from "express";
import {
  registerUserHandler,
  loginUserHandler,
  getMeHandler,
  logoutUserHandler
} from "./auth.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/login", loginUserHandler);

router.post("/register", registerUserHandler);

router.get("/me", authenticate,  getMeHandler);

router.post("/logout" , authenticate , logoutUserHandler)

export { router as authRouter };
