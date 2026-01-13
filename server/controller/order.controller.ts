import { Request, Response, NextFunction } from "express";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import ErrorHandler from "../utilis/ErroHandler";
import userModel from "../models/user.model";
import CourseModel from "../models/course.model";
import OrderModel, { IOrder } from "../models/orderModel";
import path from "path";
import { sendMail } from "../utilis/sendMails";
import NotificationModel from "../models/notificationModel";
import ejs from "ejs";
import { newOrder } from "../services/order.service";
import { redis } from "../utilis/redis";

//create Order

export const createOrder = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { courseId, payment_info } = req.body as IOrder;

      const user = await userModel.findById(req.user?.id);
      const courseExistHandler = user?.courses.some(
        (course: any) => course._id.toString() === courseId
      );

      if (courseExistHandler) {
        return next(
          new ErrorHandler("You have already applied this course", 500)
        );
      }

      const course = await CourseModel.findById(courseId);

      if (!course) {
        return next(
          new ErrorHandler("COurse is not exist in the Database", 500)
        );
      }

      const data: any = {
        courseId: course._id,
        userId: user?._id,
        payment_info
      };

      newOrder(data, res, next);

      const mailData = {
        order: {
          _id: course._id?.toString().slice(0, 6),
          name: course.name,
          price: course.price,
          date: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
        },
      };

      // send Mail
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/order-confirmation.ejs"),
        { order: mailData }
      );

      try {
        if (user) {
          await sendMail({
            email: user.email,
            subject: "Order Confirmation!",
            template: "order-confirmation.ejs",
            data: mailData,
          });
        }
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 400));
      }

      user?.courses.push({ courseId: course._id?.toString() } as any);
      await redis.set(req.user!._id as string, JSON.stringify(user));
      await user?.save();
      course.purchased = (course.purchased || 0) + 1;
      await course.save();

      await NotificationModel.create({
        user: user?._id,
        title: "New Order",
        message: `You have a new Ordr from ${course.name}`,
      });

      newOrder(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
