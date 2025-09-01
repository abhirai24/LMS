const ErrorHandler = require("../utils/ErrorHandler");
const CatchAsyncError = require("../middleware/catchAsyncErrors");
const userModel = require("../models/user.model");
const {generateLast12MonthData } = require("../utils/analytics.generator");

const getUserAnalytics = CatchAsyncError( async(req, res, next) => {
    try{
        const users = await generateLast12MonthData(userModel);

        res.status(200).json({
           success : true,
           users
        });


    }catch(error){
        return next( new ErrorHandler(error.message, 400));
    }

});

module.exports = {
    getUserAnalytics
};