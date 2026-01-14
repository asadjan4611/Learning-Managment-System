import express from "express";
import {
  addAnswer,
  addQuestionToCourse,
  addReplyToReview,
  addReview,
  courseCreate,
  deleteCourse,
  editCourse,
  getAllCourse,
  getAllCourses,
  getCourseByUser,
  getSingleCourse,
} from "../controller/course.controller";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics } from "../controller/analytics.controller";
import { updateAccessToken } from "../controller/user.controller";
const courseRouter = express.Router();
courseRouter.post(
  "/create-course",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  courseCreate
);
courseRouter.put(
  "/edit-course/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  editCourse
);
courseRouter.get("/get-course/:id", getSingleCourse);
courseRouter.get("/get-courses", getAllCourses);
courseRouter.get("/get-course-content/:id",updateAccessToken, isAuthenticated, getCourseByUser);
courseRouter.put("/add-question",updateAccessToken, isAuthenticated, addQuestionToCourse);
courseRouter.put("/addAnswer",updateAccessToken, isAuthenticated, addAnswer);
courseRouter.put("/addReview/:id",updateAccessToken, isAuthenticated, addReview);
courseRouter.put(
  "/addReviewReply",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  addReplyToReview
);
courseRouter.get(
  "/getAllCourses",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getAllCourse
);
courseRouter.delete(
  "/delete_course/:id",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  deleteCourse
);




export default courseRouter;
