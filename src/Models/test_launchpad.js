import mongoose from "mongoose";
const { Schema } = mongoose;

const ActivitySchema = new mongoose.Schema(
  {
    launchpad_addr: "0xasdsad",
    tokenId: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.models?.Activity || mongoose.model("Activity", ActivitySchema);