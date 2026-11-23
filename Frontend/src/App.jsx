
import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import CashierDashboard from "./pages/cashierDashboard.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import OrderList from "./pages/OrderList.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";

import KitchenLayout from "./components/KitchenLayout.jsx";
import KitchenDashboard from "./pages/KitchenDashboard.jsx";
import IncomingOrders from "./pages/IncomingOrders.jsx";

export default function App() {
  return (
    <Routes>
      {/* Cashier Routes */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<CashierDashboard />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/details" element={<OrderDetails />} />
      </Route>

      {/* Kitchen Routes */}
      <Route element={<KitchenLayout />}>
        <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
        <Route path="/kitchen/incoming" element={<IncomingOrders />} />
      </Route>

      {/* Unknown Routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
