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
courseRouter.put(
  "/addReviewReply",
  isAuthenticated,
  authorizeRole("admin"),
  addReplyToReview
);
courseRouter.get(
  "/getAllCourses",
  isAuthenticated,
  authorizeRole("admin"),
  getAllCourse
);
courseRouter.delete(
  "/delete_course/:id",
  isAuthenticated,
  authorizeRole("admin"),
  deleteCourse
);




export default courseRouter;
