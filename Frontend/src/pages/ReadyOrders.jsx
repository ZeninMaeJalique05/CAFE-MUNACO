import { useCallback, useEffect, useState } from "react";
import KitchenOrderCard from "../components/KitchenOrderCard";

const API = "http://localhost:5000/api/kitchen";

export default function ReadyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API}/orders/ready`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load ready orders.");
      }

      setOrders(result.data || []);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();

    const timer = setInterval(loadOrders, 10000);

    return () => clearInterval(timer);
  }, [loadOrders]);

  return (
    <div className="kitchen-page">
      <div className="kitchen-page-heading">
        <h1>Ready Orders</h1>
        <p>This page refreshes every 10 seconds.</p>
      </div>

      {error && <div className="kitchen-error">{error}</div>}

      {loading ? (
        <p>Loading ready orders...</p>
      ) : orders.length === 0 ? (
        <div className="kitchen-empty">
          No orders are ready for pickup.
        </div>
      ) : (
        <div className="kitchen-orders-grid">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              showWaiting
            />
          ))}
        </div>
      )}
    </div>
  );
}
