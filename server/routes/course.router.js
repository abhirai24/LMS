const express = require('express');
const {uploadCourse, editCourse, getSingleCourse, getAllCourse, getCourseByUser, addReview, replyToReview} = require('../controllers/course.controller');
const { isAuthenticated, authorizedRoles } = require('../middleware/auth');
const courseRouter = express.Router();

courseRouter.post(
 "/createCourse",
 //isAuthenticated,
 //authorizedRoles("admin"),
 uploadCourse
);

courseRouter.put(
 "/editCourse/:id",
  //isAuthenticated,
 //authorizedRoles("admin"),
 editCourse
);

courseRouter.get(
    "/getSingleCourse/:id",
     // isAuthenticated,
    getSingleCourse
);

courseRouter.get(
    "/getAllCourse",
    getAllCourse
);


courseRouter.get(
    "/getCourseContent/:id",
    isAuthenticated,
    getCourseByUser
);


// courseRouter.put(
//     "/addQuestion",
//     isAuthenticated,
//     addQuestion
// );

// courseRouter.put(
//     "/addAnswer",
//     isAuthenticated,
//     addAnswer
// );

courseRouter.put(
    "/addReview/:id",
    isAuthenticated,
    addReview
);

courseRouter.put(
    "/replyToReview",
    isAuthenticated,
    //authorizedRoles("admin"),
    replyToReview
);

module.exports = courseRouter;