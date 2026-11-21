import express from "express";
import * as ctrl from "../controllers/customerController.js";

const router = express.Router();

router.get("/summary", ctrl.getSummary);
router.get("/notifications", ctrl.getNotifications);
router.get("/menu", ctrl.getMenu);
router.get("/orders", ctrl.getOrders);
router.post("/orders", ctrl.createOrder);
router.get("/orders/:id", ctrl.getOrder);
router.post("/orders/:id/send", ctrl.sendToKitchen);
router.patch("/orders/:id/status", ctrl.updateStatus);

export default router;