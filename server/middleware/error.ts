import  ErrorHandler  from "../utilis/ErroHandler";
import {Request,Response,NextFunction} from "express"
export const errorMiddleware =(err:any ,req:Request,res:Response,next:NextFunction)=>{
    


    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error"


    //wrong MOngoDB id error
    if (err.name  === "CastError") {
        const message = `Resource not found Invalid ${err.path}`;
        err = new ErrorHandler(message,400);

    }


    // Duplicate key error
    if (err.code === 11000) {
        const message =`Duplicate ${Object.keys(err.keyValue)} entered`;
         err = new ErrorHandler(message,400);
    }

    //jsonweb token error

    if (err.name === "JsonWebToken") {
        const message=`Json Web Token is Invalid ,try again`
         err = new ErrorHandler(message,400);
    }

    //JWT EXpired 
    
    if (err.name === "TokenExpiredError") {
        const message=`Json Web Token is expired ,try again`
         err = new ErrorHandler(message,400);
    }


    res.status(err.statusCode).json({
        success:false,
        message:err.message
    })
}