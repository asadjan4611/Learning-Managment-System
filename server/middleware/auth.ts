import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utilis/ErroHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { redis } from "../utilis/redis";
import { accessTokenOptions, refreshTokenOptions } from "../utilis/jwt";
import { stringify } from "querystring";

// auhtincated user
export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const access_token = req.cookies.access_token as string;
      if (!access_token) {
        return next(
          new ErrorHandler("Access Toke is not found Please Login First ", 400)
        );
      }
      const decode = jwt.verify(
        access_token,
        process.env.ACCESS_TOKEN as Secret
      ) as JwtPayload;
      if (!decode) {
        return next(new ErrorHandler("Access token is invalid ", 400));
      }

      const user = await redis.get(decode.id);
      if (!user) {
        return next(new ErrorHandler("Please login to Fisrt to Access this resources ", 400));
      }
      req.user = JSON.parse(user);
      // console.log(req.user)
      next();
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// authorize role

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // console.log("Role is ",req.user)
    if (!roles.includes(req.user?.role || " ")) {
      return next(
        new ErrorHandler(
          `your ${req.user?.role} is not  allowed to access this resource`,
          600
        )
      );
    }
    next();
  };
};
