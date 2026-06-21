import express from "express";
import cors from 'cors'
import helmet from "helmet";
import {userRouter} from "./src/modules/user/user.router";


const app = express()

app.use(express.json())
app.use(cors())
app.use(helmet())


app.use("/api/user" , userRouter)


export default app;