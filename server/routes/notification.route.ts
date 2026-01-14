import express from "express";

import { authorizeRole, isAuthenticated } from "../middleware/auth";
import {
  getNotifications,
  updateNotificationStatus,
} from "../controller/notification.controller";
import { updateAccessToken } from "../controller/user.controller";
const notificationROuter = express.Router();

notificationROuter.put(
  "/get-all-Notifications",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getNotifications
);

notificationROuter.put(
  "/update-Notification/:id ",
  isAuthenticated,
  updateAccessToken,
  authorizeRole("admin"),
  updateNotificationStatus
);

export default notificationROuter;
