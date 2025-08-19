const mongoose = require('mongoose');
require('dotenv').config();

const dbUrl = process.env.DB_URL || '';

if (!dbUrl) {
  throw new Error("MongoDB connection string (DB_URL) is missing in .env file");
}

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(dbUrl);
    console.log(`✅ Database connected with ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    setTimeout(connectDb, 5000); // Retry after 5 seconds
  }
};

module.exports = connectDb;
