import * as CustomerService from "../services/customerService.js";

const wrap = (fn, status = 200) => async (req, res, next) => {
  try {
    res.status(status).json(await fn(req));
  } catch (err) {
    next(err);
  }
};

export const getOrders = wrap((req) => CustomerService.getOrders(req.query.status));
export const getOrder = wrap((req) => CustomerService.getOrderDetails(req.params.id));
export const sendToKitchen = wrap((req) => CustomerService.sendToKitchen(req.params.id));
export const updateStatus = wrap((req) =>
  CustomerService.changeStatus(req.params.id, req.body.status)
);
export const getSummary = wrap(() => CustomerService.getSummary());
export const getNotifications = wrap(() => CustomerService.getNotifications());
export const getMenu = wrap(() => CustomerService.getMenu());
export const createOrder = wrap((req) => CustomerService.createOrder(req.body), 201);