
import { useCallback, useEffect, useState } from "react";
import { CheckCircle } from "lucide-react";
import KitchenOrderCard from "../components/KitchenOrderCard";

const API = "http://localhost:5000/api/kitchen";

const formatDate = (date) => {
  if (!date) return "Date unavailable";

  return new Date(date).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHistory = useCallback(async () => {
    try {
      const response = await fetch(`${API}/orders/history`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load order history.");
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
    loadHistory();

    const timer = setInterval(loadHistory, 15000);

    return () => clearInterval(timer);
  }, [loadHistory]);

  return (
    <div className="kitchen-page">
      <div className="kitchen-page-heading">
        <h1>Order History</h1>
        <p>Completed orders, newest first.</p>
      </div>

      {error && <div className="kitchen-error">{error}</div>}

      {loading ? (
        <p>Loading order history...</p>
      ) : orders.length === 0 ? (
        <div className="kitchen-empty">
          No completed orders yet.
        </div>
      ) : (
        <div className="kitchen-history-grid">
          {orders.map((order) => (
            <div className="kitchen-history-card" key={order.id}>
              <div className="kitchen-history-date">
                <CheckCircle size={16} />
                <span>Served: {formatDate(order.served_at)}</span>
              </div>

              <KitchenOrderCard order={order} />

              <div className="kitchen-history-status">
                <CheckCircle size={15} />
                Completed
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
