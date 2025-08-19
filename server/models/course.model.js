const mongoose = require("mongoose");
const { Schema, model } = mongoose;

// Review Schema
const reviewSchema = new Schema({
  user: Object,
  rating: {
    type: Number,
    default: 0,
  },
  comment: String,
});

// Link Schema
const linkSchema = new Schema({
  title: String,
  url: String,
});

// Comment Schema
const commentSchema = new Schema({
  user: Object,
  comment: String,
  commentReplies: [Object],
});

// Course Data Schema
const courseDataSchema = new Schema({
  videoUrl: String,
  title: String,
  videoSection: String,
  description: String,
  videoLength: Number,
  videoPlayer: String,
  links: [linkSchema],
  suggestion: String,
  questions: [commentSchema],
});

// Course Schema
const courseSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  estimatedPrice: {
    type: Number,
  },
  thumbnail: {
    public_id: {
      type: String,
    },
    url: {
      type: String,
    },
  },
  tags: {
    type: String,
    required: true,
  },
  level: {
    type: String,
    required: true,
  },
  demoUrl: {
    type: String,
    required: true,
  },
  benefits: [{ title: String }],
  prerequisites: [{ title: String }],
  reviews: [reviewSchema],
  courseData: [courseDataSchema],
  ratings: {
    type: Number,
    default: 0,
  },
  purchased: {
    type: Number,
    default: 0,
  },
});

// Create and export the model
const CourseModel = model("Course", courseSchema);
module.exports = CourseModel;