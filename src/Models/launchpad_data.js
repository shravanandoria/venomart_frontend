import mongoose from "mongoose";
const { Schema } = mongoose;

const LaunchpadData = new mongoose.Schema(
  {
    launchpad_addr: String,
    tokenId: Number,
    unReserved: Boolean,
  },
  { timestamps: true },
);

module.exports = mongoose.models?.Activity || mongoose.model("Activity", LaunchpadData);
