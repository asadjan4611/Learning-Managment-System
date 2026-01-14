import express from "express";
import OrderModel from "../models/orderModel";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controller/order.controller";
import { getOrderAnalytics } from "../controller/analytics.controller";
import { updateAccessToken } from "../controller/user.controller";
const orderRouter = express.Router();

orderRouter.post(
  "/createOrder",
  updateAccessToken,
  isAuthenticated,
  createOrder
);
orderRouter.get(
  "/get-all-Orders",
  updateAccessToken,
  isAuthenticated,
  authorizeRole("admin"),
  getAllOrders
);

export default orderRouter;
