import express from "express";
import * as kitchenController from "../controllers/kitchenController.js";

const router = express.Router();

// Dashboard statistics
router.get("/dashboard", kitchenController.getDashboardStats);

// Incoming orders
router.get("/orders/incoming", kitchenController.getIncomingOrders);

// Preparing orders
router.get("/orders/preparing", kitchenController.getPreparingOrders);

// Ready orders
router.get("/orders/ready", kitchenController.getReadyOrders);

// Completed order history
router.get("/orders/history", kitchenController.getOrderHistory);

// Update order status
router.put("/orders/:id/status", kitchenController.updateOrderStatus);

export default router;
