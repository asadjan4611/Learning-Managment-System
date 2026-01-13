import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utilis/ErroHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { redis } from "../utilis/redis";
import { accessTokenOptions, refreshTokenOptions } from "../utilis/jwt";

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
        return next(new ErrorHandler("user is not found ", 400));
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

// update access_token

export const updateAccessToken = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log("Welocome at ");
      const refresh_token = req.cookies.refresh_token as string;
      const decoded = jwt.verify(
        refresh_token,
        process.env.REFRESH_TOKEN as Secret
      ) as JwtPayload;
      const message = "Could not refresh token";
      if (!decoded) {
        return next(new ErrorHandler(message, 400));
      }
      const session = await redis.get(decoded.id as string);
      if (!session) {
        return next(new ErrorHandler(message, 400));
      }

      const user = JSON.parse(session);
      const accessToken = jwt.sign(
        { id: user._id },
        process.env.ACCESS_TOKEN as Secret,
        {
          expiresIn: "40m",
        }
      );
      const refreshToken = jwt.sign(
        { id: user._id },
        process.env.REFRESH_TOKEN as Secret,
        {
          expiresIn: "5d",
        }
      );
      req.user = user;
      res.cookie("access_token", accessToken, accessTokenOptions);
      res.cookie("refresh_token", refreshToken, refreshTokenOptions);

      res.status(200).json({
        success: true,
        accessToken,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
