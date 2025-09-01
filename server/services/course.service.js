const CourseModel = require("../models/course.model");
const CatchAsyncError = require('../middleware/catchAsyncErrors');

const createCourse = CatchAsyncError(async(req, res, next) =>{
  const course = await CourseModel.create(req);
  res.status(201).json({
    success:true,
    course
  });
});


const getAllCourses = async(res) =>{
    const courses = await CourseModel.find();
    res.status(200).json({
        success: true,
        courses,
    });
};

module.exports = {createCourse, getAllCourses};