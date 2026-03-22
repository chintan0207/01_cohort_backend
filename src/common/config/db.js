import mongoose from "mongoose";

const DB_URL = process.env.MONGODB_URI;
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB_URL);
    console.log(`MongoDB connected on ${conn.connection._connectionString}`);
    console.log(`host: ${conn.connection.host}`);
  } catch (error) {
    console.log("Failed to connect mongoDB", error);
  }
};

export default connectDB;
