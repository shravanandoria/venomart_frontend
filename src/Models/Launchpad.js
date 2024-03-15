import mongoose from "mongoose";

const Launchpad = new mongoose.Schema({
  chain: String,
  logo: String,
  coverImage: String,
  pageName: {
    type: String,
    unique: true,
  },
  name: String,
  description: String,
  contractAddress: String,
  creatorAddress: String,
  royaltyAddress: String,
  royalty: String,
  socials: [String],
  maxSupply: String,
  mintPrice: String,
  isActive: Boolean,
  isVerified: Boolean,
  isPropsEnabled: Boolean,
  startDate: String,
  endDate: String,
  comments: String,
  jsonURL: String,
  phases: [{
    phaseName: String,
    maxMint: String,
    mintPrice: Number,
    startDate: String,
    EndDate: String,
    EligibleWallets: [String]
  }],
  status: {
    type: String,
    enum: ["upcoming", "live", "sold out", "ended"],
    default: "upcoming",
  }
});

module.exports = mongoose.models.Launchpad || mongoose.model("Launchpad", Launchpad);
