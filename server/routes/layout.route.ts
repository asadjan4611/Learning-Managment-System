import express from "express";
import { authorizeRole, isAuthenticated, updateAccessToken } from "../middleware/auth";
import { createLayout, editLayout, getLayoutByType } from "../controller/layout.controller";
const layoutRouter = express.Router();


layoutRouter.post(
  "/create-layout",
  isAuthenticated,
  authorizeRole("admin"),
  createLayout
);


layoutRouter.put("/edit-layout",
    isAuthenticated,
    authorizeRole("admin"),
    editLayout
);

layoutRouter.get("/get-layout/:type",
    getLayoutByType
);
export default layoutRouter;
