import mongoose from "mongoose";
import Config from "./";

const connectDB = async () => {
  const DB_URL = Config.DB_URL;
  if (!DB_URL) throw Error("Db not connected!");
  await mongoose.connect(DB_URL);
};

export default connectDB;
