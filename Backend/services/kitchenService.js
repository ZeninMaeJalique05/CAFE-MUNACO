import kitchenModel from "../models/kitchenModel.js";

export const getIncomingOrders = async () => {
  return kitchenModel.getIncomingOrders();
};

export const getPreparingOrders = async () => {
  return kitchenModel.getPreparingOrders();
};

export const getReadyOrders = async () => {
  return kitchenModel.getReadyOrders();
};

export const getOrderHistory = async () => {
  return kitchenModel.getOrderHistory();
};

export const getDashboardStats = async () => {
  return kitchenModel.getDashboardStats();
};

export const updateOrderStatus = async (id, status) => {
  const allowedStatuses = ["preparing", "ready", "served"];

  if (!allowedStatuses.includes(status)) {
    throw new Error("Invalid order status.");
  }

  const affectedRows = await kitchenModel.updateOrderStatus(
    id,
    status
  );

  if (affectedRows === 0) {
    throw new Error("Order not found.");
  }

  return true;
};
