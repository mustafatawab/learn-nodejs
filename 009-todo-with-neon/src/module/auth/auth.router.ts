import { Router } from "express";
import {
  registerUserHandler,
  loginUserHandler,
  getMeHandler,
  logoutUserHandler,
  refreshTokenHandler,
} from "./auth.controller";
import { authenticate } from "../../shared/middleware/auth.middleware";

const router = Router();

router.post("/login", loginUserHandler);

router.post("/register", registerUserHandler);

router.get("/me", authenticate, getMeHandler);

router.post("/logout", authenticate, logoutUserHandler);

router.post("/refresh-token", refreshTokenHandler);

export { router as authRouter };
