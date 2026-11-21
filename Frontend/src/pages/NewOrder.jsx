import { useEffect, useMemo, useState } from "react";
import "./NewOrder.css";

const API = "http://localhost:5000/api/customer";

const emptyForm = {
  customer_name: "",
  order_type: "Dine-in",
  table_area: "",
  guests: "",
  special_requests: "",
  payment_method: "Cash",
};

export default function NewOrder() {
  const [menu, setMenu] = useState([]);
  const [category, setCategory] = useState("All");
  const [form, setForm] = useState(emptyForm);
  const [cart, setCart] = useState([]); // [{ id, name, price, quantity }]
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // { type, text }

  // kunin ang menu
 useEffect(() => {
  fetch(`${API}/menu`)
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMenu(data);
    })
    .catch((err) =>
      setMessage({ type: "error", text: `Cannot load menu: ${err.message}` })
    );
}, []);

  const categories = useMemo(
    () => ["All", ...new Set(menu.map((m) => m.category))],
    [menu]
  );

  const visibleMenu =
    category === "All" ? menu : menu.filter((m) => m.category === category);

  const total = cart.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const addItem = (item) => {
    setCart((prev) => {
      const found = prev.find((i) => i.id === item.id);
      if (found) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const changeQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, quantity: i.quantity + delta } : i))
        .filter((i) => i.quantity > 0)
    );
  };

  const submitOrder = async (action) => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch(`${API}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          action, // "send" o "draft"
          items: cart.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setMessage({
        type: "success",
        text:
          action === "send"
            ? `${data.order_number} was sent to the kitchen.`
            : `${data.order_number} was saved as draft.`,
      });
      setForm(emptyForm);
      setCart([]);
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="no-page">
      <h1>New Order</h1>
      <p className="no-sub">Fill in the details, pick the items, then send it to the kitchen.</p>

      {message && <div className={`no-alert ${message.type}`}>{message.text}</div>}

      <div className="no-layout">
        <div className="no-left">
          {/* CUSTOMER */}
          <section className="no-card">
            <h3>Customer</h3>
            <div className="no-grid">
              <label>
                Customer name
                <input name="customer_name" value={form.customer_name} onChange={handleChange} />
              </label>

              <label>
                Order type
                <select name="order_type" value={form.order_type} onChange={handleChange}>
                  <option>Dine-in</option>
                  <option>Take-out</option>
                </select>
              </label>

              <label>
                Table or area
                <input
                  name="table_area"
                  placeholder="T4, Garden 1, Hall"
                  value={form.table_area}
                  onChange={handleChange}
                />
              </label>

              <label>
                Guests
                <input
                  type="number"
                  min="1"
                  name="guests"
                  value={form.guests}
                  onChange={handleChange}
                />
              </label>
            </div>

            <label>
              Special requests for the kitchen
              <textarea
                name="special_requests"
                rows="3"
                placeholder="Allergies, celebration notes, serving time"
                value={form.special_requests}
                onChange={handleChange}
              />
            </label>
          </section>

          {/* MENU */}
          <section className="no-card">
            <h3>Menu</h3>
            <div className="no-tabs">
              {categories.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={c === category ? "active" : ""}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="no-menu">
              {visibleMenu.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="no-item"
                  onClick={() => addItem(item)}
                >
                  <span>{item.name}</span>
                  <strong>₱{Number(item.price).toLocaleString()}</strong>
                </button>
              ))}
            </div>
          </section>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="no-card no-summary">
          <h3>Order summary</h3>

          {cart.length === 0 ? (
            <div className="no-empty">Tap a menu item to add it.</div>
          ) : (
            <ul className="no-cart">
              {cart.map((i) => (
                <li key={i.id}>
                  <div>
                    <div>{i.name}</div>
                    <small>₱{Number(i.price).toLocaleString()}</small>
                  </div>
                  <div className="no-qty">
                    <button type="button" onClick={() => changeQty(i.id, -1)}>−</button>
                    <span>{i.quantity}</span>
                    <button type="button" onClick={() => changeQty(i.id, 1)}>+</button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <div className="no-total">
            <span>Total</span>
            <strong>₱{total.toLocaleString()}</strong>
          </div>

          <label>
            Payment method
            <select name="payment_method" value={form.payment_method} onChange={handleChange}>
              <option>Cash</option>
              <option>GCash</option>
              <option>Card</option>
            </select>
          </label>

          <button
            type="button"
            className="no-btn primary"
            disabled={loading}
            onClick={() => submitOrder("send")}
          >
            {loading ? "Saving..." : "Mark paid & send to kitchen"}
          </button>
          <button
            type="button"
            className="no-btn"
            disabled={loading}
            onClick={() => submitOrder("draft")}
          >
            Save draft
          </button>
        </aside>
      </div>
    </div>
  );
}