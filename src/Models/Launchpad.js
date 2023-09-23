import mongoose from "mongoose";

const Launchpad = new mongoose.Schema({
  logo: String,
  coverImage: String,
  name: String,
  description: String,
  contractAddress: String,
  creatorAddress: String,
  royaltyAddress: String,
  royalty: String,
  socials: [String],
  maxSupply: String,
  jsonURL: String,
  mintPrice: String,
  status: String,
  isActive: Boolean,
  isVerified: Boolean,
  isPropsEnabled: Boolean,
  startDate: String,
  endDate: String,
  comments: String,
});

module.exports =
  mongoose.models.Launchpad || mongoose.model("Launchpad", Launchpad);
