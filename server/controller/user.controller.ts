import { Request, Response, NextFunction } from "express";
import userModel, { IUser } from "../models/user.model";
import ErrorHandler from "../utilis/ErroHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
require("dotenv").config();
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../utilis/sendMails";
import { accessTokenOptions, refreshTokenOptions, sendToken } from "../utilis/jwt";
import { redis } from "../utilis/redis";
import { getUserById } from "../services/user.service";
import cloudinary from "cloudinary";
interface IRegistrationBody {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export const registrationUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;
      const isEmailExist = await userModel.findOne({ email });
      if (isEmailExist) {
        return next(new ErrorHandler("Emial already exist", 400));
      }

      const user: IRegistrationBody = {
        name,
        email,
        password,
      };
      const activationToken = createActivationToken(user);
      const activationCode = activationToken.activationCode;
      const data = { user: { email: user.email }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/activation-mails.ejs"),
        data
      );

      try {
        await sendMail({
          email: user.email,
          subject: "Activcate your account",
          template: "activation-mails.ejs",
          data,
        });

        res.status(201).json({
          success: true,
          message: `Please check your email${user.email} to activate your account `,
          activationToken: activationToken.token,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}
const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET as Secret,
    {
      expiresIn: "5m",
    }
  );
  return { token, activationCode };
};

// activate user

interface IActivationRequest {
  activation_token: string;
  activation_code: string;
}

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_token, activation_code } =
        req.body as IActivationRequest;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (newUser.activationCode !== activation_code) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password } = newUser.user;
      const existUser = await userModel.findOne({ email });
      if (existUser) {
        return next(new ErrorHandler("Emial Already exist", 400));
      }
      const user = await userModel.create({
        name,
        email,
        password,
      });
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface ILoginRequest {
  email: string;
  password: string;
}

//login user
export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body as ILoginRequest;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter credtionals ", 400));
      }

      const user = await userModel.findOne({ email }).select("+password");
      if (!user) {
        return next(
          new ErrorHandler("user is not found please sign up firstly", 400)
        );
      }
      const isPasswordMatched = await user.comparePassword(password);
      if (!isPasswordMatched) {
        return next(new ErrorHandler("Enter valid password", 400));
      }

      // console.log(isPasswordMatched)
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);


//logout user
export const logout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {

      console.log("logged out from the server");
      res.cookie("access_token", "", { maxAge: 1 });
      res.cookie("refresh_token", "", { maxAge: 1 });

      const userId = (req.user?._id as string) || "";

      await redis.del(userId);
      console.log("logged out successfully from the server");

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      next(new ErrorHandler(error.message, 400));
    }
  }
);

//get user info

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req.user?._id as string) || "";
      getUserById(userId, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//social auth

interface ISocailAuth {
  email: string;
  name: string;
  avatar: string;
}

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, avatar } = req.body as ISocailAuth;
      const user = await userModel.findOne({ email });
      if (!user) {
        const newUser = await userModel.create({ email, name, avatar });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// update user email and name
interface IUpdateUserInfo {
  email?: string;
  name?: string;
}
export const updateUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name } = req.body as IUpdateUserInfo;
      const userId = req.user?._id?.toString();
      const user = await userModel.findById(userId);

      if (email && user) {
        const isEmailExist = await userModel.findOne({ email });
        if (isEmailExist) {
          return next(new ErrorHandler("Email already exist", 400));
        }
        user.email = email;
      }
      if (name && user) {
        user.name = name;
      }
      await redis.set(userId as string, JSON.stringify(user));
      await user?.save({ validateBeforeSave: false });
      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update passowrd

interface IUpdateUserPassword {
  oldPassword: string;
  newPassword: string;
}
export const updatePassword = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // console.log(req.body)
      const { oldPassword, newPassword } = req.body as IUpdateUserPassword;

      if (!oldPassword && !newPassword) {
        return next(new ErrorHandler("Please Enter old and New Password", 400));
      }

      const userId = req.user?._id?.toString();
      const user = await userModel.findById(userId).select("+password");
      //  console.log(user?.password)
      if (user?.password === undefined) {
        return next(new ErrorHandler("User is invalid", 400));
      }

      const isPasswordMatched = await user.comparePassword(oldPassword);

      if (!isPasswordMatched) {
        return next(new ErrorHandler("Password is invalid", 400));
      }

      user.password = newPassword;
      await redis.set(userId as string, JSON.stringify(user));
      await user?.save({ validateBeforeSave: false });

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//update profile picture
interface IRequestProfilePicture {
  avatar: string;
}

export const updateProfilePicture = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      
      const { avatar } = req.body as IRequestProfilePicture;

      const userId = (req.user?._id as string) || "";
      const user = await userModel.findById(userId);

      if (avatar && user) {
        if (user?.avatar?.public_id) {
          
          await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });

          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        } else {
          const myCloud = await cloudinary.v2.uploader.upload(avatar, {
            folder: "avatar",
            width: 150,
          });

          user.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
          };
        }
      }

      await redis.set(userId as string, JSON.stringify(user));
      await user?.save({ validateBeforeSave: false });

      res.status(201).json({
        success: true,
        user,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
