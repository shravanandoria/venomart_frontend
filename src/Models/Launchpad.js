import mongoose from "mongoose";

const Launchpad = new mongoose.Schema({
  logo: String,
  coverImage: String,
  name: String,
  description: String,
  contractAddress: String,
  maxSupply: String,
  nftImage: String,
  jsonURL: String,
  mintPrice: String,
  creatorRoyalty: String,
  isActive: Boolean,
  startDate: String,
  endDate: String,
  comments: String,
});

module.exports =
  mongoose.models.Launchpad || mongoose.model("Launchpad", Launchpad);
