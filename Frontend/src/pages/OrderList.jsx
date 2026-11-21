import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./OrderList.css";

const API = "http://localhost:5000/api/customer";

const STATUS_LABEL = {
  pending: "Not sent yet",
  sent: "Sent",
  preparing: "Preparing",
  ready: "Ready",
  served: "Served",
  cancelled: "Cancelled",
};

const TYPE_LABEL = {
  dine_in: "Dine-in",
  takeout: "Take-out",
  reservation: "Reservation",
  buffet: "Buffet",
  birthday: "Birthday celebration",
  special_event: "Special event",
  advance_order: "Advance order",
};

const COLUMNS = ["Order", "Customer", "Type", "Items", "Total", "Status", "Created", ""];

const peso = (n) => `₱${Number(n).toLocaleString()}`;

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await fetch(`${API}/orders`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setOrders(data);
      setError("");
    } catch (err) {
      setError(err.message || "Cannot load orders.");
    }
  }, []);

  useEffect(() => {
    load();
    const timer = setInterval(load, 10000); // auto-update kada 10 seconds
    return () => clearInterval(timer);
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchSearch =
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q);
      const matchStatus = !status || o.status === status;
      const matchType = !type || o.order_type === type;
      return matchSearch && matchStatus && matchType;
    });
  }, [orders, search, status, type]);

  return (
    <div className="ol-page">
      <div className="ol-top">
        <div>
          <h1>Order List</h1>
          <p className="ol-sub">Updates by itself, so you can see when an order is ready.</p>
        </div>
        <Link to="/orders/new" className="ol-new">New order</Link>
      </div>

      {error && <div className="ol-error">{error}</div>}

      <div className="ol-filters">
        <input
          className="ol-search"
          placeholder="Search order number or customer"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All order types</option>
          {Object.entries(TYPE_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      <div className="ol-card">
        <table className="ol-table">
          <thead>
            <tr>
              {COLUMNS.map((c, i) => (
                <th key={i} className={c === "Total" ? "right" : ""}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="ol-empty">No orders to show.</td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id}>
                  <td><strong>{o.order_number}</strong></td>
                  <td>
                    {o.customer_name}
                    {o.table_area && <span className="ol-area"> · {o.table_area}</span>}
                  </td>
                  <td>{TYPE_LABEL[o.order_type] || o.order_type}</td>
                  <td>{o.items_count}</td>
                  <td className="right">{peso(o.total)}</td>
                  <td><span className={`ol-badge ${o.status}`}>{STATUS_LABEL[o.status]}</span></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td>
                    <Link to={`/orders/details?id=${o.id}`} className="ol-open">Open</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}