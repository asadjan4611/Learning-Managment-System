import { Response } from "express";
require("dotenv").config();
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}
// expire toke time options 

  const accessTokenExpires = parseInt(
    process.env.ACCESS_TOKEN_EXPIRES || "300",
    10
  );
  const refreshTokenExpires = parseInt(
    process.env.REFRESH_TOKEN_EXPIRES || "300",
    10
  );

 //options for cookies

  export const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpires * 60 * 60 * 1000),
    maxAge: accessTokenExpires * 60 * 60 *  10000,
    httpOnly: true,
    sameSite: "lax",
  };

   export const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpires *24*60*60* 1000),
    maxAge: refreshTokenExpires*24*60*60* 10000,
    httpOnly: true,
    sameSite: "lax",
  };

export const sendToken = async (
  user: IUser,
  statusCode: number,
  res: Response
) => {
  const accesstoken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  //for radis

  await redis.set(user.id.toString(), JSON.stringify(user));

 

  // only secure in productions

  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accesstoken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(201).json({
    success: true,
    user,
    accesstoken,
  });
};
