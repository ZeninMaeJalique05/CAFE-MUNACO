import { Clock, CheckCircle } from "lucide-react";

const getOrderType = (order) => {
  if (order.table_no) return order.table_no;

  return order.order_type === "takeout" ? "Take-out" : "Dine-in";
};

const timeAgo = (date) => {
  if (!date) return "";

  const minutes = Math.floor(
    (Date.now() - new Date(date).getTime()) / 60000
  );

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);

  if (hours < 24) return `${hours} hr ago`;

  return `${Math.floor(hours / 24)} days ago`;
};

export default function KitchenOrderCard({
  order,
  actionLabel,
  onAction,
  actionDisabled = false,
  showWaiting = false,
}) {
  return (
    <article className="kitchen-order-card">
      <div className="kitchen-order-header">
        <div>
          <strong>{order.order_no}</strong>
          <p>{order.customer_name}</p>
        </div>

        <div className="kitchen-order-meta">
          <strong>{getOrderType(order)}</strong>
          <small>
            {timeAgo(
              order.ready_at ||
              order.preparing_at ||
              order.created_at
            )}
          </small>
        </div>
      </div>

      <div className="kitchen-order-items">
        {order.items?.map((item, index) => (
          <div className="kitchen-order-item" key={index}>
            <span>{item.quantity}×</span>
            <span>{item.item_name}</span>
          </div>
        ))}
      </div>

      {order.special_requests && (
        <div className="kitchen-special-request">
          <strong>Special request</strong>
          <p>{order.special_requests}</p>
        </div>
      )}

      {showWaiting ? (
        <p className="kitchen-waiting">
          <Clock size={15} />
          Waiting for service staff to pick it up.
        </p>
      ) : actionLabel ? (
        <button
          type="button"
          className="kitchen-order-action"
          onClick={() => onAction(order.id)}
          disabled={actionDisabled}
        >
          <CheckCircle size={16} />
          {actionLabel}
        </button>
      ) : null}
    </article>
  );
}
