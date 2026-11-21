import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import CashierDashboard from "./pages/cashierDashboard.jsx";
import NewOrder from "./pages/NewOrder.jsx";
import OrderList from "./pages/OrderList.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<CashierDashboard />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="/orders" element={<OrderList />} />
        <Route path="/orders/details" element={<OrderDetails />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}