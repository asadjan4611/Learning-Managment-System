import express from "express";
import {
  activateUser,
  getUserInfo,
  loginUser,
  logout,
  registrationUser,
  socialAuth,
  updatePassword,
  updateProfilePicture,
  updateUserInfo,
} from "../controller/user.controller";
import {
  authorizeRole,
  isAuthenticated,
  updateAccessToken,
} from "../middleware/auth";
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




export default userRouter;
