const express = require('express');
const { isAuthenticated, authorizedRoles } = require('../middleware/auth');
const {createOrder} = require("../controllers/order.controller");
const orderRouter = express.Router();


orderRouter.post("/createOrder", isAuthenticated, createOrder);

module.exports =   orderRouter;

