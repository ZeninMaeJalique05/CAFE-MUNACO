import * as Customer from "../models/customerModel.js";
import { ValidationError, NotFoundError } from "../utils/validationError.js";

const STATUSES = ["pending", "sent", "preparing", "ready", "served", "cancelled"];

const TRANSITIONS = {
  pending: ["sent", "cancelled"],
  sent: ["preparing", "ready", "cancelled"],
  preparing: ["ready", "cancelled"],
  ready: ["served", "cancelled"],
  served: [],
  cancelled: [],
};

const ORDER_TYPES = { "Dine-in": "dine_in", "Take-out": "takeout" };
const PAYMENT_METHODS = { Cash: "cash", Card: "card", GCash: "e_wallet" };

export const getOrders = async (status) => {
  if (status && !STATUSES.includes(status)) {
    throw new ValidationError(`Invalid status: ${status}`);
  }
  return Customer.findOrders(status);
};

export const getOrderDetails = async (id) => {
  const order = await Customer.findOrderById(id);
  if (!order) throw new NotFoundError();
  const items = await Customer.findItemsByOrderId(id);
  return { ...order, items };
};

export const changeStatus = async (id, newStatus) => {
  if (!STATUSES.includes(newStatus)) {
    throw new ValidationError(`Invalid status: ${newStatus}`);
  }

  const order = await Customer.findOrderById(id);
  if (!order) throw new NotFoundError();

  if (!TRANSITIONS[order.status].includes(newStatus)) {
    throw new ValidationError(
      `Cannot change order from "${order.status}" to "${newStatus}"`
    );
  }

  await Customer.updateOrderStatus(id, newStatus);

  if (newStatus === "ready") {
    await Customer.insertNotification(
      `${order.order_number} is ready`,
      `${order.customer_name}'s order is ready to serve.`,
      id
    );
  }

  return getOrderDetails(id);
};

export const sendToKitchen = (id) => changeStatus(id, "sent");

export const getSummary = async () => {
  const [rows, today] = await Promise.all([
    Customer.countByStatus(),
    Customer.countToday(),
  ]);
  const c = { pending: 0, sent: 0, preparing: 0, ready: 0, served: 0, cancelled: 0 };
  rows.forEach((r) => (c[r.status] = r.total));
  return {
    today,
    not_sent: c.pending,
    preparing: c.sent + c.preparing,
    ready: c.ready,
    served: c.served,
    cancelled: c.cancelled,
  };
};

export const getNotifications = () => Customer.findNotifications();

export const getMenu = () => Customer.findMenu();

export const createOrder = async (body) => {
  const {
    customer_name,
    order_type = "Dine-in",
    table_area = null,
    guests = null,
    special_requests = null,
    payment_method = "Cash",
    items,
    action,
  } = body;

  if (!customer_name || !customer_name.trim()) {
    throw new ValidationError("Customer name is required");
  }
  if (!ORDER_TYPES[order_type]) throw new ValidationError("Invalid order type");
  if (!PAYMENT_METHODS[payment_method]) throw new ValidationError("Invalid payment method");
  if (!["send", "draft"].includes(action)) {
    throw new ValidationError("Action must be 'send' or 'draft'");
  }
  if (guests !== null && guests !== "" && (isNaN(guests) || Number(guests) < 1)) {
    throw new ValidationError("Guests must be a number greater than 0");
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new ValidationError("Add at least one menu item");
  }

  const ids = items.map((i) => i.menu_item_id);
  const menuRows = await Customer.findMenuItemsByIds(ids);
  const menuMap = new Map(menuRows.map((m) => [m.id, m]));

  let total = 0;
  const cleanItems = items.map((i) => {
    const menu = menuMap.get(Number(i.menu_item_id));
    const qty = Number(i.quantity);
    if (!menu) throw new ValidationError("A menu item is not available");
    if (!Number.isInteger(qty) || qty < 1) throw new ValidationError("Invalid quantity");
    total += Number(menu.price) * qty;
    return {
      menu_item_id: menu.id,
      item_name: menu.name,
      price: menu.price,
      quantity: qty,
    };
  });

  const isSend = action === "send";

  const orderId = await Customer.createOrder(
    {
      customer_name: customer_name.trim(),
      order_type: ORDER_TYPES[order_type],
      table_area: table_area || null,
      guests: guests ? Number(guests) : null,
      special_requests: special_requests || null,
      payment_method: PAYMENT_METHODS[payment_method],
      payment_status: isSend ? "paid" : "unpaid",
      total,
      status: isSend ? "sent" : "pending",
      created_by: Number(process.env.DEFAULT_USER_ID) || 2,
    },
    cleanItems
  );

  return getOrderDetails(orderId);
};