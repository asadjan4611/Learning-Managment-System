import express from "express";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controller/layout.controller";
import { updateAccessToken } from "../controller/user.controller";
const layoutRouter = express.Router();


layoutRouter.post(
  "/create-layout",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  createLayout
);


layoutRouter.put("/edit-layout",
    updateAccessToken,
    isAuthenticated,
    authorizeRole("admin"),
    editLayout
);

layoutRouter.get("/get-layout/:type",
    getLayoutByType
);
export default layoutRouter;
