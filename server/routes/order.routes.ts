import express from "express";
import OrderModel from "../models/orderModel";
import { authorizeRole, isAuthenticated } from "../middleware/auth";
import { createOrder, getAllOrders } from "../controller/order.controller";
import { getOrderAnalytics } from "../controller/analytics.controller";
const orderRouter = express.Router();

orderRouter.post("/createOrder", isAuthenticated, createOrder);
orderRouter.get(
  "/getOrders",
  isAuthenticated,
  authorizeRole("admin"),
  getAllOrders
);



export default orderRouter;
