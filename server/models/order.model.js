const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const orderSchema = new Schema({
    courseId: {
        type : String,
        required: true
    },
    userId: {
        type : String,
        required: true
    },
    payment_info: {
        type: Object,
        //required: true
    }
}, {timestamps: true});

const orderModel = model("Order", orderSchema);
module.exports = orderModel;