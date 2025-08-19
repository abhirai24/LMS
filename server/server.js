const { app } = require('./app');
const cloudinary = require('cloudinary');
const connectDb = require('./utils/db');
require('dotenv').config();


cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_SECRET_KEY
});

app.listen(process.env.PORT, () => {
  console.log(`Server is connected with PORT ${process.env.PORT}`);
  connectDb();
});
