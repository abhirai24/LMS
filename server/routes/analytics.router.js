const express = require('express');
const { isAuthenticated, authorizedRoles } = require('../middleware/auth');
const {  getUserAnalytics} = require('../controllers/analytics.controller');
const analyticsRouter = express.Router();

analyticsRouter.get("/user-analytics", isAuthenticated, getUserAnalytics);

module.exports = analyticsRouter;
