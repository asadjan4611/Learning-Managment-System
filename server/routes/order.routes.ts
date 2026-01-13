import express from "express";
import OrderModel from "../models/orderModel";
import { isAuthenticated } from "../middleware/auth";
import { createOrder } from "../controller/order.controller";
const orderRouter = express.Router();

orderRouter.post("/createOrder",isAuthenticated,createOrder);



export default orderRouter;