import { Request, Response, NextFunction } from "express";
import CourseModel from "../models/course.model";
import ErrorHandler from "../utilis/ErroHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
require("dotenv").config();
import { redis } from "../utilis/redis";
import cloudinary from "cloudinary";
import { createCourse } from "../services/course.service";
import mongoose from "mongoose";
import { title } from "process";
import ejs from "ejs";
import path from "path";
import { sendMail } from "../utilis/sendMails";

// create COurse

export const courseCreate = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "course_pictures",
          width: 150,
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      createCourse(data, res, next);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//  edit course
export const editCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = req.body;
      const thumbnail = data.thumbnail;
      if (thumbnail) {
        await cloudinary.v2.uploader.destroy(thumbnail.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
          folder: "course_pictures",
          width: 150,
        });

        data.thumbnail = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const courseId = req.params.id;
      const course = await CourseModel.findByIdAndUpdate(
        courseId,
        {
          $set: data,
        },
        {
          new: true,
        }
      );

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get single course without purhacing

export const getSingleCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const courseId = req.params.id;
      const isCacheExits = await redis.get(courseId);
      if (isCacheExits) {
        const course = JSON.parse(isCacheExits);
        res.status(201).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.findById(req.params.id).select(
          "-courseData.videoUrl -courseData.questions -courseData.links -courseData.suggestion"
        );

        await redis.set(courseId, JSON.stringify(course), "EX", 604800);
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// get all course without purhacing

export const getAllCourses = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isCacheExits = await redis.get("allCourses");
      if (isCacheExits) {
        const course = JSON.parse(isCacheExits);

        res.status(200).json({
          success: true,
          course,
        });
      } else {
        const course = await CourseModel.find().select(
          "-courseData.videoUrl -courseData.questions -courseData.links -courseData.suggestion"
        );
        await redis.set("allCourses", JSON.stringify(course), "EX", 604800);
        res.status(201).json({
          success: true,
          course,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

//get COurse Content  .... only for valid user

export const getCourseByUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      const courseId = req.params.id;
      const courseExist = userCourseList?.find(
        (course: any) => course._id.toString() === courseId.toString()
      );
      if (!courseExist) {
        return next(
          new ErrorHandler("You are not eligible to access this course.", 404)
        );
      }
      const course = await CourseModel.findById(courseId);
      const content = course?.courseData;
      res.status(200).json({
        success: true,
        content,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add question in course

interface IAddQuestionData {
  questions: string;
  courseId: string;
  contentId: string;
}

export const addQuestionToCourse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questions, courseId, contentId }: IAddQuestionData = req.body;
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id.", 400));
      }
      const course = await CourseModel.findById(courseId);
      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(
          new ErrorHandler(
            "Course Content is not valid for this contentID",
            400
          )
        );
      }
      // create  a question object

      const newQuestion: any = {
        user: req.user,
        questions,
        questionReplies: [],
      };

      courseContent.questions.push(newQuestion);

      //save the course

      await course?.save({ validateBeforeSave: false });
      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// addd reply
interface IAddAnswerData {
  answer: string;
  courseId: string;
  contentId: string;
  questionId: string;
}

export const addAnswer = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answer, courseId, contentId, questionId }: IAddAnswerData =
        req.body;
      if (!mongoose.Types.ObjectId.isValid(contentId)) {
        return next(new ErrorHandler("Invalid content id.", 400));
      }
      const course = await CourseModel.findById(courseId);
      const courseContent = course?.courseData.find((item: any) =>
        item._id.equals(contentId)
      );
      if (!courseContent) {
        return next(
          new ErrorHandler(
            "Course Content is not valid for this contentID",
            400
          )
        );
      }

      const question = courseContent.questions.find((item: any) =>
        item._id.equals(questionId)
      );
      if (!question) {
        return next(new ErrorHandler("Invalid Question", 400));
      }

      const newAnswer: any = {
        user: req.user,
        answer,
      };
      question?.questionsReplies?.push(newAnswer);
      await course?.save({ validateBeforeSave: false });

      // if (req.user?._id === question.user._id) {
      //   // create notification
      // } else {
      const data = {
        name: question.user.name,
        title: courseContent.title,
      };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mails/question-reply.ejs"),
        data
      );

      // send mail
      try {
        await sendMail({
          email: question.user.email,
          subject: "Question Reply",
          template: "question-reply.ejs",
          data,
        });
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 500));
      }

      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

// add review in the course
interface IAddReviewData {
  courseId: string;
  review: string;
  rating: number;
  userId: string;
}
export const addReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userCourseList = req.user?.courses;
      //  console.log(userCourseList)
      const courseId = req.params.id;
      //  console.log(courseId)
      //check if the course id exist in then UserCourseList based on the _id
      const courseExists = userCourseList?.find(
        (course: any) => course?._id?.toString() === courseId
      );

      if (!courseExists) {
        return next(
          new ErrorHandler("You are not eligible for this course", 403)
        );
      }
      const course = await CourseModel.findById(courseId);
      console.log(course);
      const { review, rating } = req.body as IAddReviewData;
      const ReviewData: any = {
        user: req.user,
        comment: review,
        rating: rating,
      };
      course?.reviews.push(ReviewData);
      let avg = 0;
      course?.reviews.forEach((rev: any) => {
        avg += rev.rating;
      });
      if (course) {
        course.rating = avg / course.reviews.length;
      }
      await course?.save({ validateBeforeSave: false });

      const notificationData = {
        title: "New Review Notification",
        message: `${req.user?.name} has given a review in ${req.user?.courses}`,
      };

      res.status(200).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

//add reply in review
interface IAddReviewReplyData {
  comment: string;
  courseId: string;
  reviewId: string;
}
export const addReplyToReview = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { comment, courseId, reviewId } = req.body as IAddReviewReplyData;
      const course = await CourseModel.findById(courseId);
      if (!courseId) {
        return next(new ErrorHandler("Course not found.", 404));
      }
      const review = course?.reviews.find(
        (rev: any) => rev._id.toString() === reviewId
      );

      if (!review) {
        return next(new ErrorHandler("Review not found", 400));
      }
      const replyData: any = {
        user: req.user,
        comment,
        createdAt:new Date().toISOString(),
        updatedAt:new Date().toISOString()
      };
      if (!review.reviewReplies) {
        review.reviewReplies = [];
      }

        //  review.commentReplies.push(replyData);
      // console.log(review.reviewReplies)
      review?.reviewReplies.push(replyData);
     await redis.set(courseId,JSON.stringify(course),'EX',604800);
      console.log(review.reviewReplies);

      await course?.save({ validateBeforeSave: false });
      console.log(course?.reviews);
      res.status(201).json({
        success: true,
        course,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
