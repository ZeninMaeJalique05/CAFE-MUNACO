import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import CashierDashboard from "./pages/cashierDashboard.jsx";
import NewOrder from "./pages/NewOrder.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<CashierDashboard />} />
        <Route path="/orders/new" element={<NewOrder />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}