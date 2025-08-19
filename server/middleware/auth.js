require("dotenv").config();
const mongoose = require('mongoose');
const CatchAsyncError = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/ErrorHandler");
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');
// const redis = require("../utils/redis");

const isAuthenticated = CatchAsyncError(async(req, res, next)=>{
        
        const access_token = req.cookies.access_token;
        if(!access_token){
            return next(new ErrorHandler("Please login to access this resource", 400));
        }

        const decoded = jwt.verify(access_token, process.env.ACCESS_TOKEN);
        if(!decoded){
            return next(new ErrorHandler("access token is not valid", 400));
        }
        const id = decoded.id;
        const objectId = new mongoose.Types.ObjectId(id);

       // Correct: pass an object as the filter
        const user = await userModel.findOne({ _id: objectId });
        //const user = await redis.get(decode.id);
        console.log("user", user);

        if(!user){
            return next(new ErrorHandler("User Not found", 400));
        }
        req.user = user; 

        next();
    
});

const authorizedRoles = (...roles) =>{
    return (req, res, next) =>{
        console.log("come inside this")
        if(!roles.includes(req.user?.role) || ''){
            return next(new ErrorHandler(`Role: ${req.user?.role} is not allowed to access this resource`, 400));
        }
        console.log("come outside", roles);
    }
}

module.exports ={
    isAuthenticated,
    authorizedRoles,
};