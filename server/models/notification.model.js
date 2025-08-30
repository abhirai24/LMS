const mongoose = require("mongoose");
const { Schema, model } = mongoose;


const notificationSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
   status: {
        type: String,
        //enum: ["unread", "read"],
        default: "unread",
        //required: true
    },
    userId :{
        type: String,
        required: true  
    }

}, {timestamps: true});

const notificationModel = model("Notification", notificationSchema);
module.exports = notificationModel;
