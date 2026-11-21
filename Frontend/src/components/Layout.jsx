import { NavLink, Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">☕</span>
          <span className="brand-name">Cafe Munaco</span>
        </div>

        <nav className="nav">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/orders/new">New Order</NavLink>
          <NavLink to="/orders" end>Order List</NavLink>
          <NavLink to="/orders/details">Order Details</NavLink>
        </nav>

        <div className="user-box">
          <strong>Maria Santos</strong>
          <small>Cashier / Service staff</small>
          <button type="button">Sign out</button>
        </div>
      </aside>

      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}