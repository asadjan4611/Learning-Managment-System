import express from "express";
const analyticsRouter = express.Router();
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controller/analytics.controller";


analyticsRouter.get(
  "/get-user-analytics",
  isAuthenticated,
  authorizeRole("admin"),
  getUserAnalytics
);


analyticsRouter.get(
  "/get-order-analytics",
  isAuthenticated,
  authorizeRole("admin"),
  getOrderAnalytics
);

analyticsRouter.get(
  "/get-course-analytics",
  isAuthenticated,
  authorizeRole("admin"),
  getCourseAnalytics
);

export default analyticsRouter;