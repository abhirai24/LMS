const notificationModel = require("../models/notification.model");
const CatchAsyncError = require('../middleware/catchAsyncErrors');
const ErrorHandler = require("../utils/ErrorHandler");

// get all notification for admin
const getNotifications = CatchAsyncError(async (req, res, next) => {
    try{
        const notifications = await notificationModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            notifications
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }
});


const updateNotification = CatchAsyncError(async (req, res, next) => {
    const { id } = req.params;
    const { title, message } = req.body;

    try {
        const notification = await notificationModel.findById(id);

        if (!notification) {
            return next(new ErrorHandler("Notification not found", 404));
        }

       notification.status ? notification.status = "read" : notification.status ;
        await notification.save();
        const notifications =   await notificationModel.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            notification
        });
    } catch (error) {
        return next(new ErrorHandler(error.message, 500));
    }

});

module.exports = {
    getNotifications,
    updateNotification,
};
