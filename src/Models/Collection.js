import mongoose from "mongoose";
const { Schema } = mongoose;

const CollectionSchema = new mongoose.Schema(
  {
    contractAddress: {
      type: String,
      unique: true,
    },
    creatorAddress: String,
    coverImage: String,
    logo: String,
    name: String,
    royalty: String,
    royaltyAddress: String,
    description: String,
    keywords: [String],
    socials: [String],
    isVerified: Boolean,
    Category: [String],
    TotalSupply: Number,
    TotalListed: Number,
    FloorPrice: Number,
    TotalVolume: Number,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models?.Collection || mongoose.model("Collection", CollectionSchema);
