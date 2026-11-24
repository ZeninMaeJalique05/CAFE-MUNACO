import { useCallback, useEffect, useState } from "react";
import KitchenOrderCard from "../components/KitchenOrderCard";

const API = "http://localhost:5000/api/kitchen";

export default function PreparingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadOrders = useCallback(async () => {
    try {
      const response = await fetch(`${API}/orders/preparing`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load orders.");
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

  const markAsReady = async (id) => {
    try {
      setUpdatingId(id);

      const response = await fetch(`${API}/orders/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "ready" }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update order.");
      }

      await loadOrders();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="kitchen-page">
      <div className="kitchen-page-heading">
        <h1>Preparing Orders</h1>
        <p>This page refreshes every 10 seconds.</p>
      </div>

      {error && <div className="kitchen-error">{error}</div>}

      {loading ? (
        <p>Loading preparing orders...</p>
      ) : orders.length === 0 ? (
        <div className="kitchen-empty">
          No orders are currently being prepared.
        </div>
      ) : (
        <div className="kitchen-orders-grid">
          {orders.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              actionLabel={
                updatingId === order.id
                  ? "Updating..."
                  : "Mark as ready"
              }
              actionDisabled={updatingId === order.id}
              onAction={markAsReady}
            />
          ))}
        </div>
      )}
    </div>
  );
}
