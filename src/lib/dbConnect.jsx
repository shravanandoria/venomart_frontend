import mongoose from "mongoose";
const mongodb_uri = process.env.NEXT_PUBLIC_Mongo_URI;
let db;
if (!mongodb_uri) {
  throw new error("missing uri");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
    };
    cached.promise = mongoose.connect(mongodb_uri, opts).then((mongoose) => {
      db = mongoose;
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;

export const disconnect = async () => {
  await db.disconnect();
};
