import db from "../config/db.js";

const TIME_COLUMN = {
  sent: "sent_at",
  preparing: "preparing_at",
  ready: "ready_at",
  served: "served_at",
};

export const findOrders = async (status) => {
  let sql = "SELECT *, order_no AS order_number FROM orders";
  const params = [];
  if (status) {
    sql += " WHERE status = ?";
    params.push(status);
  }
  sql += " ORDER BY created_at DESC";
  const [rows] = await db.query(sql, params);
  return rows;
};

export const findOrderById = async (id) => {
  const [rows] = await db.query(
    "SELECT *, order_no AS order_number FROM orders WHERE id = ?",
    [id]
  );
  return rows[0];
};

export const findItemsByOrderId = async (orderId) => {
  const [rows] = await db.query(
    "SELECT id, item_name, unit_price AS price, quantity FROM order_items WHERE order_id = ?",
    [orderId]
  );
  return rows;
};

export const updateOrderStatus = async (id, status) => {
  const col = TIME_COLUMN[status];
  if (col) {
    await db.query(`UPDATE orders SET status = ?, ${col} = NOW() WHERE id = ?`, [status, id]);
  } else {
    await db.query("UPDATE orders SET status = ? WHERE id = ?", [status, id]);
  }
};

export const insertNotification = async (title, message, orderId) => {
  await db.query(
    "INSERT INTO notifications (title, message, order_id) VALUES (?, ?, ?)",
    [title, message, orderId]
  );
};

export const findNotifications = async (limit = 20) => {
  const [rows] = await db.query(
    "SELECT * FROM notifications ORDER BY created_at DESC LIMIT ?",
    [limit]
  );
  return rows;
};

export const countByStatus = async () => {
  const [rows] = await db.query(
    "SELECT status, COUNT(*) AS total FROM orders GROUP BY status"
  );
  return rows;
};

export const countToday = async () => {
  const [rows] = await db.query(
    "SELECT COUNT(*) AS total FROM orders WHERE DATE(created_at) = CURDATE()"
  );
  return rows[0].total;
};

export const findMenu = async () => {
  const [rows] = await db.query(
    "SELECT id, name, category, price FROM menu_items WHERE is_available = 1 ORDER BY category, name"
  );
  return rows;
};

export const findMenuItemsByIds = async (ids) => {
  const [rows] = await db.query(
    "SELECT id, name, price FROM menu_items WHERE is_available = 1 AND id IN (?)",
    [ids]
  );
  return rows;
};

export const createOrder = async (order, items) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const tempNumber = `TMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = new Date();

    const [result] = await conn.query(
      `INSERT INTO orders
        (order_no, customer_name, order_type, table_area, guests,
         special_requests, payment_method, payment_status, paid_at,
         total, status, sent_at, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tempNumber,
        order.customer_name,
        order.order_type,
        order.table_area,
        order.guests,
        order.special_requests,
        order.payment_method,
        order.payment_status,
        order.payment_status === "paid" ? now : null,
        order.total,
        order.status,
        order.status === "sent" ? now : null,
        order.created_by,
      ]
    );

    const orderId = result.insertId;
    const orderNumber = `MUN-${String(orderId).padStart(5, "0")}`;

    await conn.query("UPDATE orders SET order_no = ? WHERE id = ?", [
      orderNumber,
      orderId,
    ]);

    const rows = items.map((i) => [
      orderId,
      i.menu_item_id,
      i.item_name,
      i.quantity,
      i.price,
      i.price,
    ]);
    await conn.query(
      `INSERT INTO order_items
        (order_id, menu_item_id, item_name, quantity, unit_price, price)
       VALUES ?`,
      [rows]
    );

    await conn.commit();
    return orderId;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};