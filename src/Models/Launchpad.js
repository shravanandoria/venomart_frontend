import mongoose from "mongoose";

const Launchpad = new mongoose.Schema(
  {
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
    phases: [{
      phaseName: String,
      maxMint: String,
      mintPrice: Number,
      startDate: String,
      startDateUNIX: Number,
      EndDate: String,
      EndDateUNIX: Number,
      EligibleWallets: [String]
    }],
    status: {
      type: String,
      enum: ["upcoming", "live", "sold out", "ended"],
      default: "upcoming",
    }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Launchpad || mongoose.model("Launchpad", Launchpad);
