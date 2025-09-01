const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const userRouter = require('./routes/user.router');
const courseRouter = require('./routes/course.router');
const orderRouter = require('./routes/order.router');
const ErrorMiddleware = require('./middleware/error');
const notificationRouter = require('./routes/notification.router');
require('dotenv').config();

const app = express();

// Body parser
app.use(express.json({ limit: "50mb" }));

// Cookie parser
app.use(cookieParser());

// CORS
app.use(cors({
    origin: process.env.ORIGIN
}));

// Test route
app.get("/test", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "API is working"
    });
});

// API routes
app.use("/api/v1", userRouter);
app.use("/api/v1", courseRouter);
app.use("/api/v1", orderRouter);
app.use("/api/v1", notificationRouter);

// Unknown route handler
// app.all("*", (req, res, next) => {
//     const err = new Error(`Route ${req.originalUrl} not found`);
//     err.statusCode = 404;
//     next(err);
// });

// Error middleware
app.use(ErrorMiddleware);

module.exports = { app };
