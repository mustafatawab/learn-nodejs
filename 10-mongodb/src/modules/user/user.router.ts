import { Router } from "express";
import * as userController from "./user.controller"

const router = Router()


router.post("/" , userController.createUserController)

router.get("/" , userController.getAllUserController)

router.get("/:id" , userController.getUserByIdController)

router.patch("/:id" , userController.updateUserController)


router.delete("/:id" , userController.deleteUserController)


export { router as userRouter}