import express from "express";

import { authorizeRole, isAuthenticated } from "../middleware/auth";
import {
  getNotifications,
  updateNotificationStatus,
} from "../controller/notification.controller";
const notificationROuter = express.Router();

notificationROuter.put(
  "/get-all-Notifications",
  isAuthenticated,
  authorizeRole("admin"),
  getNotifications
);

notificationROuter.put(
  "/update-Notification/:id ",
  isAuthenticated,
  authorizeRole("admin"),
  updateNotificationStatus
);

export default notificationROuter;
