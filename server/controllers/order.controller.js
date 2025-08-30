const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/catchAsyncErrors");
const orderModel = require("../models/order.model");
const CourseModel = require("../models/course.model");
const userModel = require("../models/user.model");
const ejs = require("ejs");
const path = require("path");
const sendMail = require("../utils/sendMail");
const notificationModel = require("../models/notification.model");
const { newOrder } = require("../services/order.service");
const  {createOrderService } = require("../services/order.service");

const createOrder = CatchAsyncError(async (req, res, next) => {
  try {
    const { courseId, payment_info } = req.body;
    const user = await userModel.findById(req.user?._id);
    console.log("user", user);

    const courseExistInUser = Array.isArray(user?.courses) && user.courses.some(
  (course) => String(course._id) === String(courseId)
);

    if (courseExistInUser) {
      return next(
        new ErrorHandler("You have already enrolled in this course", 400)
      );
    }

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return next(new ErrorHandler("Course not found", 404));
    }

    const data = {
      userId: user._id,
      courseId: course._id,
    };


    const mailData = {
      order: {
        _id: course._id.toString().slice(0, 6),
        name: course.name,
        price: course.price,
        date: new Date().toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
    };
    const html = await ejs.renderFile(
      path.join(__dirname, "../mails/order-confirmation.ejs"),
      { order: mailData }
    );
    try {
      if (user) {
        await sendMail({
          email: user.email,
          subject: "Order Confirmation",
          template: "order-confirmation.ejs",
          data: mailData,
        });
      }
    } catch (error) {
      return next(new ErrorHandler(error.message, 500));
    }


const userId = user._id;

// Push new course if it doesn't exist already
await userModel.findByIdAndUpdate(
  userId,
  {
    $addToSet: { courses: { _id: courseId } } // $addToSet avoids duplicates
  },
  { new: true } // returns the updated document
);
    await user?.save();

    const notification = await notificationModel.create({
        userId: user._id,
        title: "New Course Enrolled",
        message: `You have successfully enrolled in ${course.name} course`,
    });
    const order = await createOrderService(data);

  // Send response
  res.status(201).json({
    success: true,
    order,
  });

  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
});

module.exports = { createOrder };
