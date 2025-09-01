require('dotenv').config();
const mongoose = require('mongoose');
const userModel = require('../models/user.model');
const ErrorHandler = require('../utils/ErrorHandler');
const CatchAsyncError = require('../middleware/catchAsyncErrors');
const jwt = require('jsonwebtoken');
const ejs = require('ejs');
const path = require('path');
const sendMail = require('../utils/sendMail');
const {sendToken} = require("../utils/jwt");
const { getUserById, getAllUsers } = require('../services/user.services');
const cloudinary = require('cloudinary');
// 🔐 Create activation token and code
const createActivationToken = (name,email, password) => {
  const activationCode = Math.floor(1000 + Math.random() * 9000).toString();
  console.log("name", name, email, password, activationCode);
   const user = {
      name,
      email,
      password,
    };

  const token = jwt.sign(
    {
      user,
      activationCode,
    },
    process.env.ACTIVATION_SECRET,
    {
      expiresIn: '5m',
    }
  );
  return {
    token,
    activationCode,
  };
};

// 📝 Register user and send activation email
const registrationUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const isEmailExist = await userModel.findOne({ email });
    console.log("isEmailExist", isEmailExist);
    if (isEmailExist) {
      return next(new ErrorHandler('Email Already Exist', 400));
    }

    const user = {
      name,
      email,
      password,
    };

    const activationToken = createActivationToken(name, email, password);
    const activationCode = activationToken.activationCode;
    const activationLink = activationToken.token;

    console.log("activationCode", activationCode);

    const data = {
      user: name,
      activationCode,
      activationLink
    };
    console.log("data", data);
    const html = await ejs.renderFile(
      path.join(__dirname, '../mails/activation-mail.ejs'),
      data
    );


    try {
      await sendMail({
        email: email,
        subject: 'Activate your account',
        template: 'activation-mail.ejs',
        data,
      });

      res.status(201).json({
        success: true,
        message: `Please check your email: ${user.email} to activate your account!`,
        activationToken: activationToken.token,
      });
    } catch (error) {
      return next(new ErrorHandler(error.message, 400));
    }
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


const activateUser = CatchAsyncError(async (req, res, next) => {
  try {
    const { activation_token, activation_code } = req.body;

     console.log("req", req.body);

    const newUser = jwt.verify(
      activation_token,
      process.env.ACTIVATION_SECRET
    );

    console.log("newUser", newUser);

    if (newUser.activationCode !== activation_code) {
      return next(new ErrorHandler('Invalid activation code', 400));
    }

    const { name, email, password } = newUser.user;

    const existUser = await userModel.findOne({ email });

    if (existUser) {
      return next(new ErrorHandler('Email already exists', 400));
    }

    const user = await userModel.create({
      name,
      email,
      password,
    });

    res.status(201).json({
      success: true,
      user,
    });
  } catch (error) {
    console.log("error", error);
    return next(new ErrorHandler(error.message, 500));
  }
});


// login user

const loginUser = CatchAsyncError(async (req, res, next) => {
  try{
    const {email, password} = req.body;
    if(!email || !password){
      return next(new ErrorHandler("Please Enter Email and Password", 400));
    }

    const user = await userModel.findOne({email}).select("+password");
    if(!user){
      return next(new ErrorHandler("Invalid Email or Password", 400));
    }

    const isPasswordMatch = await user.comparePassword(password);

    if(!isPasswordMatch){
      return next(new ErrorHandler("Invalid Password", 400));
    }

    sendToken(user, 200, res);
   
  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});

const logOutUser = CatchAsyncError( async (req, res, next) =>{
   try{
    console.log("logout table");
    res.cookie("access_token", "", {maxAge: 1});
    res.cookie("refresh_token", "", {maxAge: 1});
    res.status(200).json({
      success: true,
      message: "Logged Out successfully"
    });

   }catch(error){
     return next(new ErrorHandler(error.message, 400));
   }
});

// update refresh token 
const updateAccessToken = CatchAsyncError(async(req, res, next) =>{
  try{
    console.log("req", req);
    const refresh_token = req.cookies.refresh_token;
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN);
    if(!decoded){
      return next(new ErrorHandler('Could not refresh token', 400));
    }
    const id = decoded.id;
    const objectId = new mongoose.Types.ObjectId(id);

    const session = await userModel.findOne({ _id: objectId })

    if(!session){
      return next(new ErrorHandler('Could not refresh token', 400));
    }

    const user = session;
    const accessToken = jwt.sign({id: user._id}, process.env.ACCESS_TOKEN, {
      expiresIn : "5m",
    });

    const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_TOKEN, {
      expiresIn : "3d",
    })
   req.user = user;
  const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '300', 10); // in seconds
  const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '1000', 10); // in seconds

  // Cookie options
  const accessTokenOptions = {
    expires: new Date(Date.now() + accessTokenExpire * 60 * 60 * 1000),
    maxAge: accessTokenExpire *  60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  };

  const refreshTokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
    maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: 'lax',
  };

  if (process.env.NODE_ENV === 'production') {
    accessTokenOptions.secure = true;
    refreshTokenOptions.secure = true;
  }

  // Set cookies
  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(200).json({
    status: "success",
    accessToken,
  });

  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});

// get user Info 
const getUserInfo = CatchAsyncError(async(req, res, next) =>{
  try{
    const userId = req.user?._id;
    getUserById(userId, res);
  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});


// social auth
const socialAuth = CatchAsyncError(async(req, res, next) =>{

  try{
    const {email, name, avatar} = req.body;
    const user = await userModel.findOne({email});
    if(!user){
        const newUser = await userModel.create({email, name, avatar});
        sendToken(user, 200, res);
    }else{
      sendToken(user, 200, res);
    }
  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});


// update userInfo 

const updateUserInfo = CatchAsyncError(async(req, res, next) =>{
  try{
    const {email, name} = req.body;
    const userId = req.user?._id;
    const user = await userModel.findById(userId);
    if(email && user){
      const isEmailExist = await userModel.findOne({email});
      if(isEmailExist){
        return next(new ErrorHandler("Email already Exist", 400));
      }
      user.email = email;
    }

    if(name && user){
      user.name = name;
    }

    await user?.save();
    // await redis.set(userId, JSON.stringify(user));

    res.status(201).json({
      success: true,
      user
    });
  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});

// update user password 
const updateUserPassword = CatchAsyncError(async(req, res, next) =>{
  try{
    const {oldPassword , newPassword} = req.body;

    const user = await userModel.findById(req.user?._id).select("+password");
    console.log("user", user);

    if(user.password == undefined){
      return next( new ErrorHandler("Invalid user", 400));
    }

    const isPasswordMatch = await user?.comparePassword(oldPassword);
    if(!isPasswordMatch){
      return next(new ErrorHandler('Please enter correct password', 400));
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      user,
    });

  }catch(error){
    return next(new ErrorHandler(error.message, 400));
  }
});


// update profile picture

const updateProfilePicture = CatchAsyncError(async(req, res, next) =>{
  try{
    const { avatar} = req.body;
    const userId = req.user?._id;

    const user = await userModel.findById(userId);

    if(avatar && user){
      if(user?.avatar?.public_id){
        await cloudinary.v2.uploader.destroy(user?.avatar?.public_id);

        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatar",
          width: 150,
        });

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }else{
        const myCloud = await cloudinary.v2.uploader.upload(avatar, {
          folder: "avatar",
          width: 150,
        });

        user.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
    }

    await user?.save();

    // await redis.set(userId, JSON.stringify(user));
    res.status(200).json({
      success: true,
      user
    });
    
  }catch(error){
    return next(new ErrorHandler(error.message,400));
  }
});


const getAllUserController = CatchAsyncError(async (req, res, next) => {
  try {
     getAllUsers(res);
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});


// update user role

const updateUserRole = CatchAsyncError(async (req, res, next) => {
  try {
    const { role, id } = req.body;

    const user = await userModel.findByIdAndUpdate(id, { role }, { new: true });
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }

     await user.save();
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// Delete user
const deleteUser = CatchAsyncError(async (req, res, next) => {
  try {
    const userId = req.params.id;

    const user = await userModel.findById(userId);
    if (!user) {
      return next(new ErrorHandler("User not found", 404));
    }
    await user.deleteOne({ _id: userId });

    // await redis.del(userId);

    res.status(200).json({
      success: true,
      message: "User deleted successfully"
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 400));
  }
});

// ✅ Export both functions
module.exports = {
  registrationUser,
  createActivationToken,
  activateUser,
  loginUser,
  logOutUser,
  updateAccessToken,
  getUserInfo,
  socialAuth,
  updateUserInfo,
  updateUserPassword,
  updateProfilePicture,
  getAllUserController,
  updateUserRole,
  deleteUser,
};
