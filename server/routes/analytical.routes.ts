import express from "express";
const analyticsRouter = express.Router();
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { getCourseAnalytics, getOrderAnalytics, getUserAnalytics } from "../controller/analytics.controller";
import { updateAccessToken } from "../controller/user.controller";


analyticsRouter.get(
  "/get-user-analytics",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getUserAnalytics
);


analyticsRouter.get(
  "/get-order-analytics",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getOrderAnalytics
);

analyticsRouter.get(
  "/get-course-analytics",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getCourseAnalytics
);

export default analyticsRouter;