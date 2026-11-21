import { createContext, useContext, useState } from 'react'
import { seedOrders } from './data.js'

const OrdersContext = createContext(null)

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(seedOrders)

  const addOrder = (order) => {
    const next = String(orders.length + 1).padStart(5, '0')
    setOrders((prev) => [{ ...order, id: `MUN-${next}` }, ...prev])
  }

  const updateStatus = (id, status) =>
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)))

  return (
    <OrdersContext.Provider value={{ orders, addOrder, updateStatus }}>
      {children}
    </OrdersContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useOrders = () => useContext(OrdersContext)