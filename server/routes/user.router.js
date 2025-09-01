const express = require('express');
const { registrationUser, activateUser, loginUser, logOutUser, updateAccessToken, getUserInfo, socialAuth, updateUserInfo, updateUserPassword, updateProfilePicture,  getAllUserController,  updateUserRole, deleteUser, } = require('../controllers/user.controller');
const { isAuthenticated } = require('../middleware/auth');

const userRouter = express.Router();

userRouter.post('/registration', registrationUser);

userRouter.post('/activate-user', activateUser);

userRouter.post('/login-user', loginUser);

userRouter.get('/logout', isAuthenticated, logOutUser);

userRouter.get('/refresh', updateAccessToken);

userRouter.get('/me', isAuthenticated, getUserInfo);

userRouter.post('/socialAuth', socialAuth);

userRouter.put('/update-user-info', isAuthenticated, updateUserInfo);

userRouter.put('/update-user-password', isAuthenticated, updateUserPassword);

userRouter.put('/update-user-avatar',isAuthenticated, updateProfilePicture);

userRouter.get('/all-users', isAuthenticated, getAllUserController);

userRouter.put('/update-user-role/:id', isAuthenticated, updateUserRole);
  
userRouter.delete('/deleteUser/:id', isAuthenticated, deleteUser);

module.exports = userRouter;
