import mongoose, { Mongoose } from "mongoose";

(global as any).mongoose = {
  conn: null,
  promise: null,
};

export async function dbConnect() {
  try {
    const DB = process.env.MONGODB_URI || "";
    // console.log("DB URL", DB);

    if ((global as any).mongoose && (global as any).mongoose.conn) {
      console.log("Connected from previous");
      return (global as any).mongoose.conn;
    } else {
      const promise = mongoose.connect(DB, {
        autoIndex: true,
      });

      (global as any).mongoose = {
        conn: await promise,
        promise,
      };

      console.log("Newly connected");
      return await promise;
    }
  } catch (error) {
    console.error("Error connecting to the database:", error);
    throw new Error("Database connection failed");
  }
}

export const disconnect = () => {
  if (!(global as any).mongoose.conn) {
    return;
  }
  (global as any).mongoose.conn = null;
  mongoose.disconnect();
};
