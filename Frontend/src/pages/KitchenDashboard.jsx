
import { useState, useEffect } from "react";

function KitchenDashboard() {

  const [orders, setOrders] = useState([
    {
      id: "MUN-00005",
      customer: "Garcia Table",
      table: "T2",
      status: "Pending",
      minutes: 52,
      specialRequest: true
    }
  ]);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const incoming = orders.filter(
    order => order.status === "Pending"
  ).length;

  const preparing = orders.filter(
    order => order.status === "Preparing"
  ).length;

  const ready = orders.filter(
    order => order.status === "Ready"
  ).length;

  const served = orders.filter(
    order => order.status === "Completed"
  ).length;

  const greeting = currentDate.getHours() < 12
    ? "Good morning"
    : currentDate.getHours() < 18
    ? "Good afternoon"
    : "Good evening";

  return (
    <div className="dashboard-page">

      <div className="page-heading">
        <h1>{greeting}, Jose</h1>

        <p>
          {currentDate.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric"
          })}
        </p>
      </div>

      {/* Statistics */}
      <div className="dashboard-stats">

        <div className="stat-card">
          <h2>{incoming}</h2>
          <p>Waiting to start</p>
        </div>

        <div className="stat-card">
          <h2>{preparing}</h2>
          <p>Being prepared</p>
        </div>

        <div className="stat-card">
          <h2>{ready}</h2>
          <p>Ready for service</p>
        </div>

        <div className="stat-card">
          <h2>{served}</h2>
          <p>Served today</p>
        </div>

      </div>

      {/* Oldest Orders */}
      <div className="oldest-orders-card">

        <h3>Oldest orders waiting</h3>

        {orders
          .filter(order => order.status === "Pending")
          .sort((a, b) => b.minutes - a.minutes)
          .slice(0, 3)
          .map(order => (

            <div className="oldest-order-item" key={order.id}>

              <div className="oldest-order-left">
                <strong>{order.id}</strong>
                <span>{order.customer}</span>
              </div>

              <div className="oldest-order-right">
                {order.table} · sent {order.minutes} min ago
                {order.specialRequest && " · has special request"}
              </div>

            </div>

          ))}

        {incoming === 0 && (
          <p className="empty-message">
            No orders waiting.
          </p>
        )}

      </div>

    </div>
  );
}

export default KitchenDashboard;
