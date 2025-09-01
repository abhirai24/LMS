const express = require("express");
const { isAuthenticated, authorizedRoles } = require("../middleware/auth");
const {getNotifications, updateNotification} = require("../controllers/notification.controller");
const notificationRouter = express.Router();



notificationRouter.get("/getAllNotification", isAuthenticated, getNotifications);
notificationRouter.put("/updateNotification/:id", isAuthenticated, updateNotification);
module.exports = notificationRouter;