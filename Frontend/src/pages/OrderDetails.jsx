import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./OrderDetails.css";

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

const peso = (n) => `₱${Number(n).toLocaleString()}`;

const formatDateTime = (date) =>
  new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function OrderDetails() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get("id");

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [detail, setDetail] = useState(null);
  const [error, setError] = useState("");

  // listahan ng orders
  useEffect(() => {
    fetch(`${API}/orders`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrders(data);
      })
      .catch((err) => setError(err.message || "Cannot load orders."));
  }, []);

  // detalye ng napiling order
  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    fetch(`${API}/orders/${selectedId}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setDetail(data);
        setError("");
      })
      .catch((err) => setError(err.message || "Cannot load order."));
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        !q ||
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q)
    );
  }, [orders, search]);

  return (
    <div className="od-page">
      <h1>Order Details</h1>
      <p className="od-sub">Search by order number or customer name, then open the order.</p>

      {error && <div className="od-error">{error}</div>}

      <input
        className="od-search"
        placeholder="Order number (for example MUN-00005) or customer name"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {detail && (
        <div className="od-card od-detail">
          <div className="od-detail-top">
            <div>
              <h2>{detail.order_number}</h2>
              <p>{detail.customer_name}</p>
            </div>
            <span className={`od-badge ${detail.status}`}>{STATUS_LABEL[detail.status]}</span>
          </div>

          <div className="od-info">
            <div><small>Type</small><span>{TYPE_LABEL[detail.order_type] || detail.order_type}</span></div>
            <div><small>Table or area</small><span>{detail.table_area || "-"}</span></div>
            <div><small>Guests</small><span>{detail.guests || "-"}</span></div>
            <div><small>Payment</small><span>{detail.payment_status} · {detail.payment_method || "-"}</span></div>
            <div><small>Created</small><span>{formatDateTime(detail.created_at)}</span></div>
          </div>

          {detail.special_requests && (
            <div className="od-note">
              <small>Special requests</small>
              <p>{detail.special_requests}</p>
            </div>
          )}

          <table className="od-items">
            <thead>
              <tr><th>Item</th><th>Qty</th><th className="right">Price</th><th className="right">Subtotal</th></tr>
            </thead>
            <tbody>
              {detail.items.map((i) => (
                <tr key={i.id}>
                  <td>{i.item_name}</td>
                  <td>{i.quantity}</td>
                  <td className="right">{peso(i.price)}</td>
                  <td className="right">{peso(i.price * i.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="od-total"><span>Total</span><strong>{peso(detail.total)}</strong></div>
        </div>
      )}

      <div className="od-card">
        {filtered.length === 0 ? (
          <p className="od-empty">No orders to show.</p>
        ) : (
          <ul className="od-list">
            {filtered.map((o) => (
              <li
                key={o.id}
                className={String(o.id) === selectedId ? "active" : ""}
                onClick={() => setParams({ id: o.id })}
              >
                <div><strong>{o.order_number}</strong> {o.customer_name}</div>
                <div className="od-right">
                  <span className={`od-badge ${o.status}`}>{STATUS_LABEL[o.status]}</span>
                  <small>{TYPE_LABEL[o.order_type] || o.order_type} · {formatDateTime(o.created_at)}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}