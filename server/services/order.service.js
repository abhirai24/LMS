const orderModel = require("../models/order.model");

const createOrderService = async (data) => {
  return await orderModel.create(data);
};

const getAllOrder = async(res) =>{

    const users = await orderModel.find().sort({createdAt : -1});
    res.status(200).json({
        success: true,
        users,
    });
};

module.exports = { createOrderService, getAllOrder };