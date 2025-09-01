const ErrorHandler = require('../utils/ErrorHandler');
const CatchAsyncError = require('../middleware/catchAsyncErrors');
const cloudinary = require('cloudinary');
const { createCourse, getAllCourses } = require('../services/course.service');
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


//get course content

const getCourseByUser = CatchAsyncError(async(req, res, next) =>{ 
   try{
   
    const userCourseList  = req.user?.courses;
    const user = await User.findById(req.user.id).populate("courses");

    
    const courseId = req.params.id;
    console.log("courseId", userCourseList);
    const courseExists = userCourseList?.find(
  (course) => course._id.toString() === courseId
);


    if(!courseExists){
      return next(
        new ErrorHandler("Your are not eligible to access this course", 404)
      );
    }

    const course = await CourseModel.findById(courseId);
    const content = course?.courseData;

    res.status(200).json({
      success: true,
      content,
    });

   }catch(error){
    return next(new ErrorHandler(error.message, 500));
   }
});


//  add review and rating 

const addReview = CatchAsyncError(async(req, res, next) =>{
   try{
    const { rating, comment } = req.body;
    const courseId = req.params.id;
    const userCourseList = Array.isArray(req.user?.courses)
  ? req.user.courses
  : Object.values(req.user?.courses || {});

const courseExists = userCourseList.find(
  (course) => course._id.toString() === courseId.toString()
);

    if (!courseExists) {
      return next(
        new ErrorHandler("You are not eligible to review this course", 404)
      );
    }

    const course = await CourseModel.findById(courseId);
    
    const reviewData = {
      user: req.user,
      rating: Number(rating),
      comment
    };

    course.reviews.push(review);
    course.numOfReviews = course.reviews.length;

    // Calculate average rating
    course.ratings = course.reviews.reduce((acc, item) => item.rating + acc, 0) / course.reviews.length;

    await course.save();

    // create notification
    const notification = {
      title: "New Review Added",
      message: `${req.user.name} added a new review for ${course.name}`,
    };

    // create notification controller

    res.status(201).json({
      success: true,
      course,
    });

   }catch(error){
    return next(new ErrorHandler(error.message, 500));
   }
});


const replyToReview = CatchAsyncError(async(req, res, next) =>{
   
   try{
     const {comment, courseId, reviewId} = req.body;
     const course = await CourseModel.findById(courseId);

     if (!course) {
       return next(new ErrorHandler("Course not found", 404));
     }

     const review = course?.reviews?.find((rev) => rev._id.toString() === reviewId.toString());

     if (!review) {
       return next(new ErrorHandler("Review not found", 404));
     }

     const replyData = {
       user: req.user,
       comments : comment
     };

     if(!review.commentReplies){
        review.commentReplies = [];
     }
     
     review.commentReplies.push(replyData);

     await course.save();

     res.status(201).json({
       success: true,
       course,
     });

   }catch(error){
    return next(new ErrorHandler(error.message, 500));
   }
});

// get all courses
const getAllCoursesController = CatchAsyncError(async (req, res, next) => {
  try {
     getAllCourses(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

module.exports = {
    uploadCourse,
    editCourse,
    getSingleCourse,
    getAllCourse,
    getCourseByUser,
    addReview,
    replyToReview,
};