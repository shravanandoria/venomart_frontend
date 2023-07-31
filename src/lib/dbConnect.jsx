import mongoose from "mongoose";
// 123Snaahaha
const mongodb_uri =
  "mongodb+srv://shravanandoria21437:123Snaahaha@cluster0.xdumlze.mongodb.net/?retryWrites=true&w=majority";
// "mongodb+srv://venomartspace:anu@2000@venom-testnet.niuxzx8.mongodb.net/?retryWrites=true&w=majority";


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
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // bufferCommands: false,
      // bufferMaxEntries: 0,
      // useFindAndModify: true,
      // useCreateIndex: true,
    };
    cached.promise = mongoose.connect(mongodb_uri, opts).then((mongoose) => {
      console.log("wallet connected");
      return mongoose;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
