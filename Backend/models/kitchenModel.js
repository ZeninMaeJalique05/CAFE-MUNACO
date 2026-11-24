import db from "../config/db.js";

// Get orders by status, including their ordered items
const getOrdersByStatus = async (status) => {
  const [orders] = await db.query(
    `SELECT
      id,
      order_no,
      customer_name,
      order_type,
      table_no,
      guests,
      scheduled_at,
      special_requests,
      status,
      total,
      created_at,
      sent_at,
      preparing_at,
      ready_at,
      served_at
    FROM orders
    WHERE status = ?
    ORDER BY created_at ASC`,
    [status]
  );

  for (const order of orders) {
    const [items] = await db.query(
      `SELECT item_name, quantity
       FROM order_items
       WHERE order_id = ?`,
      [order.id]
    );

    order.items = items;
  }

  return orders;
};

const kitchenModel = {
  // Incoming orders
  getIncomingOrders: async () => {
    return getOrdersByStatus("sent");
  },

  // Orders being prepared
  getPreparingOrders: async () => {
    return getOrdersByStatus("preparing");
  },

  // Orders ready for serving
  getReadyOrders: async () => {
    return getOrdersByStatus("ready");
  },

  // Completed orders
  getOrderHistory: async () => {
    return getOrdersByStatus("served");
  },

  // Kitchen dashboard statistics
  getDashboardStats: async () => {
    const [rows] = await db.query(`
      SELECT
        SUM(status = 'sent') AS incoming,
        SUM(status = 'preparing') AS preparing,
        SUM(status = 'ready') AS ready,
        SUM(
          status = 'served'
          AND DATE(served_at) = CURDATE()
        ) AS servedToday
      FROM orders
    `);

    return rows[0];
  },

  // Update order status
  updateOrderStatus: async (id, status) => {
    const timestampColumns = {
      preparing: "preparing_at",
      ready: "ready_at",
      served: "served_at"
    };

    const timestampColumn = timestampColumns[status];

    if (!timestampColumn) {
      throw new Error("Invalid order status.");
    }

    const [result] = await db.query(
      `UPDATE orders
       SET status = ?, ${timestampColumn} = NOW()
       WHERE id = ?`,
      [status, id]
    );

    return result.affectedRows;
  }
};

export default kitchenModel;
