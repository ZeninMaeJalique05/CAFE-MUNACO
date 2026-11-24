import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Inbox,
  Clock,
  CircleCheck,
  Archive,
  Coffee,
  LogOut
} from "lucide-react";

function KitchenSidebar() {
  return (
    <aside className="kitchen-sidebar">

      {/* Brand */}
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Coffee size={20} />
        </div>
        <span>Cafe Munaco</span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-navigation">

        <NavLink to="/dashboard" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <LayoutDashboard size={16} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/kitchen/incoming" className={({ isActive }) =>
          `sidebar-link ${isActive ? "active" : ""}`
        }>
          <Inbox size={16} />
          <span>Incoming Orders</span>
        </NavLink>

        <NavLink to="/kitchen/preparing" className="sidebar-link">
          <Clock size={16} />
          <span>Preparing Orders</span>
        </NavLink>

        <NavLink to="/kitchen/ready" className="sidebar-link">
          <CircleCheck size={16} />
          <span>Ready Orders</span>
        </NavLink>

        <NavLink to="/kitchen/history" className="sidebar-link">
          <Archive size={16} />
          <span>Order History</span>
        </NavLink>

      </nav>

      {/* Staff Information */}
      <div className="sidebar-user">

        <div className="user-name">
          Jose Dela Cruz
        </div>

        <div className="user-role">
          Kitchen personnel
        </div>

        <button
          className="signout-button"
          onClick={() => alert("Sign out clicked")}
        >
          <LogOut size={14} />
          Sign out
        </button>

      </div>

    </aside>
  );
}

export default KitchenSidebar;
