import { Navigate, Route, Routes } from "react-router-dom";

// Cashier components
import Layout from "./components/Layout.jsx";
import CashierDashboard from "./pages/cashierDashboard.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import OrderList from "./pages/OrderList.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";

// Kitchen components
import KitchenLayout from "./components/KitchenLayout.jsx";
import KitchenDashboard from "./pages/KitchenDashboard.jsx";
import IncomingOrders from "./pages/IncomingOrders.jsx";
import PreparingOrders from "./pages/PreparingOrders.jsx";
import ReadyOrders from "./pages/ReadyOrders.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";

export default function App() {
  return (
    <Routes>
      {/* Cashier Portal */}
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<CashierDashboard />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/details" element={<OrderDetails />} />
      </Route>

      {/* Kitchen Portal */}
      <Route element={<KitchenLayout />}>
        <Route path="/kitchen" element={<Navigate to="/kitchen/dashboard" replace />} />
        <Route path="/kitchen/dashboard" element={<KitchenDashboard />} />
        <Route path="/kitchen/incoming" element={<IncomingOrders />} />
        <Route path="/kitchen/preparing" element={<PreparingOrders />} />
        <Route path="/kitchen/ready" element={<ReadyOrders />} />
        <Route path="/kitchen/history" element={<OrderHistory />} />
      </Route>

      {/* Unknown routes */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
