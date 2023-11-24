import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);

  if (!process.env.MONGODB_URL) return console.log("Missing MONGODB_URL");

  if (isConnected) {
    return console.log("MONGODB_URL is already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devFlow",
    });
    isConnected = true;

    console.log("MONGODB is connected");
  } catch (error) {}
};
