import { useCallback, useEffect, useState } from "react";
import "./cashierDashboard.css";

const API = "http://localhost:5000/api/customer";

const STATUS_LABEL = {
  pending: "Not sent yet",
  sent: "Sent",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

const NEXT_ACTION = {
  pending: { label: "Send", status: "sent" },
  sent: { label: "Mark ready", status: "ready" },
  preparing: { label: "Mark ready", status: "ready" },
  ready: { label: "Serve", status: "served" },
};

const peso = (n) => `₱${Number(n).toLocaleString()}`;

const timeAgo = (date) => {
  if (!date) return "";
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  return `${Math.floor(hrs / 24)} d ago`;
};

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function CashierDashboard() {
  const [summary, setSummary] = useState({ today: 0, not_sent: 0, preparing: 0, ready: 0 });
  const [orders, setOrders] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotif, setShowNotif] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      const [s, o, n] = await Promise.all([
        fetch(`${API}/summary`).then((r) => r.json()),
        fetch(`${API}/orders`).then((r) => r.json()),
        fetch(`${API}/notifications`).then((r) => r.json()),
      ]);
      if (s.message || o.message || n.message) {
        throw new Error(s.message || o.message || n.message);
      }
      setSummary(s);
      setOrders(Array.isArray(o) ? o : []);
      setNotifications(Array.isArray(n) ? n : []);
      setError("");
    } catch (err) {
      setError(err.message || "Cannot connect to the server.");
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 15000);
    return () => clearInterval(timer);
  }, [loadData]);

  const changeStatus = async (id, status) => {
    try {
      const res = await fetch(`${API}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const readyOrders = orders
    .filter((o) => o.status === "ready")
    .sort((a, b) => new Date(b.ready_at) - new Date(a.ready_at));

  const latestOrders = orders.slice(0, 6);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="db-page">
      <div className="db-top">
        <div>
          <h1>{greeting}, Maria</h1>
          <p className="db-date">{today}</p>
        </div>

        <div className="db-bell-wrap">
          <button
            type="button"
            className="db-bell"
            onClick={() => setShowNotif((v) => !v)}
            aria-label="Notifications"
          >
            🔔
            {notifications.length > 0 && <span className="db-dot" />}
          </button>

          {showNotif && (
            <div className="db-notif">
              <div className="db-notif-title">Notifications</div>
              {notifications.length === 0 ? (
                <div className="db-notif-empty">No notifications yet.</div>
              ) : (
                notifications.map((n) => (
                  <div className="db-notif-item" key={n.id}>
                    <strong>{n.title}</strong>
                    <p>{n.message}</p>
                    <small>{formatDateTime(n.created_at)}</small>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {error && <div className="db-error">{error}</div>}

      <div className="db-stats">
        <div className="db-card db-stat"><strong>{summary.today}</strong><span>Orders today</span></div>
        <div className="db-card db-stat"><strong>{summary.not_sent}</strong><span>Not sent yet</span></div>
        <div className="db-card db-stat"><strong>{summary.preparing}</strong><span>In the kitchen</span></div>
        <div className="db-card db-stat"><strong>{summary.ready}</strong><span>Ready to serve</span></div>
      </div>

      <div className="db-grid">
        <section className="db-card">
          <h3>Ready to serve</h3>
          {readyOrders.length === 0 ? (
            <p className="db-empty">No orders are ready right now.</p>
          ) : (
            <ul className="db-list">
              {readyOrders.map((o) => (
                <li key={o.id}>
                  <div><strong>{o.order_number}</strong> {o.customer_name}</div>
                  <div className="db-right">
                    <small>{o.table_area ? `${o.table_area} · ` : ""}ready {timeAgo(o.ready_at)}</small>
                    <button type="button" className="db-action" onClick={() => changeStatus(o.id, "served")}>
                      Serve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="db-card">
          <h3>Latest orders</h3>
          {latestOrders.length === 0 ? (
            <p className="db-empty">No orders yet. Create one in New Order.</p>
          ) : (
            <ul className="db-list">
              {latestOrders.map((o) => {
                const next = NEXT_ACTION[o.status];
                return (
                  <li key={o.id}>
                    <div><strong>{o.order_number}</strong> {o.customer_name}</div>
                    <div className="db-right">
                      {next && (
                        <button type="button" className="db-action" onClick={() => changeStatus(o.id, next.status)}>
                          {next.label}
                        </button>
                      )}
                      <span className={`db-badge ${o.status}`}>{STATUS_LABEL[o.status]}</span>
                      <small>{peso(o.total)}</small>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}