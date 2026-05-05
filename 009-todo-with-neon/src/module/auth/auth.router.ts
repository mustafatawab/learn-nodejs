import { Router } from "express"
import { registerUserHandler , loginUserHandler } from "./auth.controller"

const router = Router()


router.post("/login" , loginUserHandler)

router.post("/register"  , registerUserHandler)



export { router as authRouter}