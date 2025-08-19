require("dotenv").config();
const userModel = require("../models/user.model");
// const redis = require("./redis"); // Uncomment if needed

const sendToken = async (user, statusCode, res) => {
  // Generate tokens from instance methods
  const accessToken = await user.SignAccessToken();
  const refreshToken = await user.SignRefreshToken();

  // Optionally store user session in Redis
  // await redis.set(user._id.toString(), JSON.stringify(user));

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

  // Send response
  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};

module.exports = { sendToken };
