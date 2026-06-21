import express from "express";
import cors from "cors";
import helmet from "helmet";
import { userRouter } from "./src/modules/user/user.router";
import { globalErrorHandler } from "./src/shared/error/globalErrorHandler";

const app = express();

app.use(helmet());
app.use(express.json());
app.use(cors());

app.use("/api/user", userRouter);

app.use(globalErrorHandler);

export default app;
