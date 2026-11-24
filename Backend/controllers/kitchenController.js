import * as kitchenService from "../services/kitchenService.js";

export const getIncomingOrders = async (req, res) => {
  try {
    const orders = await kitchenService.getIncomingOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getPreparingOrders = async (req, res) => {
  try {
    const orders = await kitchenService.getPreparingOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getReadyOrders = async (req, res) => {
  try {
    const orders = await kitchenService.getReadyOrders();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getOrderHistory = async (req, res) => {
  try {
    const orders = await kitchenService.getOrderHistory();

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const stats = await kitchenService.getDashboardStats();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await kitchenService.updateOrderStatus(
      req.params.id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
