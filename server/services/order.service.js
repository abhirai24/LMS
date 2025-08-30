const orderModel = require("../models/order.model");

const createOrderService = async (data) => {
  return await orderModel.create(data);
};

module.exports = { createOrderService };