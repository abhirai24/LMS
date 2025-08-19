const express = require('express');
const {uploadCourse, editCourse, getSingleCourse, getAllCourse} = require('../controllers/course.controller');
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
    getSingleCourse
);

courseRouter.get(
    "/getAllCourse",
    getAllCourse
);

module.exports = courseRouter;