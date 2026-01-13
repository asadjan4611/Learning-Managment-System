import express from "express";
import {
  addAnswer,
  addQuestionToCourse,
  addReplyToReview,
  addReview,
  courseCreate,
  editCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
} from "../controller/course.controller";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
const courseRouter = express.Router();
courseRouter.post(
  "/create-course",
  isAuthenticated,
  authorizeRole("admin"),
  courseCreate
);
courseRouter.put(
  "/edit-course/:id",
  isAuthenticated,
  authorizeRole("admin"),
  editCourse
);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id", isAuthenticated, getCourseByUser);
courseRouter.put("/add-question", isAuthenticated, addQuestionToCourse);
courseRouter.put("/addAnswer", isAuthenticated, addAnswer);
courseRouter.put("/addReview/:id", isAuthenticated, addReview);
courseRouter.put("/addReviewReply", isAuthenticated, authorizeRole("admin"),addReplyToReview);




export default courseRouter;
