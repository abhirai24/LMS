const ErrorHandler = require('../utils/ErrorHandler');
const CatchAsyncError = require('../middleware/catchAsyncErrors');
const cloudinary = require('cloudinary');
const { createCourse } = require('../services/course.service');
const CourseModel = require('../models/course.model');
const { trusted } = require('mongoose');


// upload course
const uploadCourse = CatchAsyncError(async(req, res, next) =>{
  try{
    const data = req.body;
    const thumbnail = data.thumbnail;
    if(thumbnail){
        const mycloud = await cloudinary.v2.uploader.upload(thumbnail, {
            folder: "courses"
        });
        data.thumbnail = {
            public_id : mycloud.public_id,
            url: mycloud.secure_url
        }
    }
    createCourse(data, res, next);
  } catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});

// edit course 

const editCourse = CatchAsyncError(async(req, res, next) =>{
  // console.log("req", req);
   try{
    const data = req.body;
    const thumbnail = data.thumbnail;

    if(thumbnail){
      await cloudinary.v2.uploader.destroy(thumbnail.public_id);

      const myCloud = await cloudinary.v2.uploader.upload(thumbnail, {
        folder: "courses",
      });

      data.thumbnail = {
        public_id : myCloud.public_id,
        url : myCloud.secure_url,
      };

    }

    const courseId = req.params.id;
    console.log("courseId", courseId);
    const course = await CourseModel.findByIdAndUpdate(
      courseId,
      {
        $set: data,
      },
      {
        $new: true,
      }
    );

    res.status(201).json({
      success: true,
      course,
    });


   }catch(error){
    return next(new ErrorHandler(error.message, 400));
   }
});

// get single course -- without purchasing

const getSingleCourse = CatchAsyncError(async(req, res, next) =>{
   try{
    const course = await CourseModel.findById(req.params.id).select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

    res.status(200).json({
      success : true,
      course,
    });

   }catch(error){
    return next(new ErrorHandler(error.message, 500));
   }
});

// get all courses 
const getAllCourse = CatchAsyncError(async(req, res, next) =>{
   try{
    const course = await CourseModel.find().select("-courseData.videoUrl -courseData.suggestion -courseData.questions -courseData.links");

    res.status(200).json({
      success : true,
      course,
    });

   }catch(error){
    return next(new ErrorHandler(error.message, 500));
   }
});


module.exports = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourse,
};