
import { useState, useEffect } from "react";

function IncomingOrders() {

  const [orders, setOrders] = useState([
    {
      id: "MUN-00005",
      customer: "Garcia Table",
      table: "T2",
      minutes: 52,
      items: [
        {
          quantity: 1,
          name: "Beef Kare-Kare",
          instruction: "No peanut sauce"
        },
        {
          quantity: 1,
          name: "Sinigang na Hipon",
          instruction: ""
        },
        {
          quantity: 4,
          name: "Plain Rice",
          instruction: ""
        },
        {
          quantity: 4,
          name: "Calamansi Juice",
          instruction: ""
        }
      ],
      specialRequest:
        "One guest allergic to peanuts (kare-kare without peanut sauce)."
    }
  ]);

  const [currentTime, setCurrentTime] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 10000);

    return () => clearInterval(timer);
  }, []);

  const startPreparing = (orderId) => {

    const confirmed = window.confirm(
      `Start preparing order ${orderId}?`
    );

    if (!confirmed) return;

    setOrders(previous =>
      previous.filter(order => order.id !== orderId)
    );

    alert(`${orderId} moved to Preparing Orders.`);
  };

  return (
    <div className="incoming-page">

      <div className="page-heading">
        <h1>Incoming Orders</h1>
      </div>

      <div className="incoming-orders-grid">

        {orders.map(order => (

          <div className="order-card" key={order.id}>

            {/* Order Header */}
            <div className="order-card-header">

              <div>
                <strong>{order.id}</strong>
                <p>{order.customer}</p>
              </div>

              <div className="order-card-meta">
                <strong>{order.table}</strong>
                <p>{order.minutes} min ago</p>
              </div>

            </div>

            {/* Food Items */}
            <div className="order-items">

              {order.items.map((item, index) => (

                <div className="order-item" key={index}>

                  <span className="item-quantity">
                    {item.quantity}×
                  </span>

                  <div className="item-information">
                    <span>{item.name}</span>

                    {item.instruction && (
                      <small>{item.instruction}</small>
                    )}
                  </div>

                </div>

              ))}

            </div>

            {/* Special Request */}
            {order.specialRequest && (
              <div className="special-request">

                <strong>Special request</strong>

                <p>{order.specialRequest}</p>

              </div>
            )}

            {/* Start Preparing */}
            <button
              className="start-preparing-button"
              onClick={() => startPreparing(order.id)}
            >
              Start preparing
            </button>

          </div>

        ))}

      </div>

      {orders.length === 0 && (
        <div className="no-orders">
          <h3>No incoming orders</h3>
          <p>New orders from the cashier will appear here.</p>
        </div>
      )}

    </div>
  );
}

export default IncomingOrders;
