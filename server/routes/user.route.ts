import express from "express";
import {
  activateUser,
  deleteUser,
  getAllUsers,
  getUserInfo,
  loginUser,
  logout,
  registrationUser,
  socialAuth,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
  updateUserRole,
} from "../controller/user.controller";
import {
  authorizeRole,
  isAuthenticated,
  updateAccessToken,
} from "../middleware/auth";
import { getUserAnalytics } from "../controller/analytics.controller";
const userRouter = express.Router();

userRouter.post("/registration", registrationUser);
userRouter.post("/activate-user", activateUser);
userRouter.post("/login-user", loginUser);
userRouter.get("/logout-user", isAuthenticated, logout);
userRouter.get("/refresh", updateAccessToken);
userRouter.get("/me", isAuthenticated, getUserInfo);
userRouter.post("/socialAuth", socialAuth);
userRouter.post("/update-user-info", isAuthenticated, updateUserInfo);
userRouter.post("/update-password", isAuthenticated, updatePassword);
userRouter.post("/update-avatar", isAuthenticated, updateProfilePicture);
userRouter.get(
  "/get-users",
  isAuthenticated,
  authorizeRole("admin"),
  getAllUsers
);
userRouter.put(
  "/update-user-role",
  isAuthenticated,
  authorizeRole("admin"),
  updateUserRole
);

userRouter.delete(
  "/delete-user/:id",
  isAuthenticated,
  authorizeRole("admin"),
  deleteUser
);



export default userRouter;
