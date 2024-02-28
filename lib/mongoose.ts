import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectToDatabase = async () => {
  mongoose.set("strictQuery", true);
  if (!process.env.MONGODB_URL) {
    return console.log("MISSING MONGODB URL");
  }

  if (isConnected) {
    return console.log("MONGODB is already connected");
  }

  try {
    await mongoose.connect(process.env.MONGODB_URL, {
      dbName: "devflow",
    });

    isConnected = true;
    console.log("MONGODB Is Connected");
  } catch (error) {
    console.log("MONGODB Connection Error", error);
  }
};
