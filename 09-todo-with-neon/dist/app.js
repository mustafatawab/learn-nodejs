import express from "express";
import { todoRouter } from "./src/module/todo/todo.router.js";
import cookieParser from "cookie-parser";
import { authRouter } from "./src/module/auth/auth.router.js";
import cors from "cors";
import { authenticate } from "./src/shared/middleware/auth.middleware.js";
import { AppError } from "./src/shared/error/AppError.js";
import { csrfMiddleware } from "./src/shared/middleware/csrf.middleware.js";
export const app = express();
// allows your frontend to talk to the API
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
}));
// lets you read req.cookies (needed for your JWT)
app.use(cookieParser());
//  parses incoming JSON request bodies
app.use(express.json());
// CSRF Middleware should be registered after authentication middleware, so we can skip CSRF checks for public routes and apply it only to protected routes.
app.use("/api", csrfMiddleware);
// registered before authenticate, so login/register don't require a token
app.use("/api/auth", authRouter);
// mounted globally — everything after this point is protected
app.use(authenticate);
// Todos Protected APIs
app.use("/api/todos", todoRouter);
// Whenever any middleware or route calls next(error), Express skips everything else and comes straight here.
app.use((error, req, res, next) => {
    if (error instanceof AppError) {
        return res.status(error.statusCode).json({ error: error.message });
    }
    if (error.name === "ZodError" || error.issues) {
        return res.status(422).json({
            status: false,
            message: "Validation Error",
            error: error.errors || error.issues,
        });
    }
    console.error("Unexpected Error: ", error);
    return res
        .status(500)
        .json({ status: false, error: "Internal Server Error" });
});
//# sourceMappingURL=app.js.map