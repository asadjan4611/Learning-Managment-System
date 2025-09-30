import express, { NextFunction, Request, Response } from "express"
export const app = express();
require("dotenv").config();
import { errorMiddleware } from "./middleware/error";
import userRouter from './routes/user.route'
import cookieParser from "cookie-parser";
import cors from "cors"

app.use(express.json({limit:"50mb"}));


app.use((cors({
    origin:process.env.ORIGIN
})))


app.use("/api/v1",userRouter)

//testing routes

app.get("/test",(req:Request,res:Response,next:NextFunction)=>{
    res.send("okay testing")
})


//for unknown route

app.all(/.*/,(req:Request,res:Response,next:NextFunction)=>{
  const err = new Error(`Route ${req.originalUrl} is not found`) as any;
  err.statusCode =404
  next(err);
});

app.use(errorMiddleware);