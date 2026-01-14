import { Response } from "express";
import ErrorHandler from "../utilis/ErroHandler";
import { CatchAsyncError } from "../middleware/catchAsyncError";
import CourseModel from "../models/course.model";
require("dotenv").config();


export const createCourse = CatchAsyncError(async(data:any,res:Response)=>{
   const course =await CourseModel.create(data);
   res.status(201).json({
    success:true,
    course
   });
})




//get all courses by admin
export const getAllCoursesServices = async (res: Response) => {
  const courses = await CourseModel.find().sort({ createdAt: -1 });
  res.status(201).json({
    success: true,
    courses,
  });
};