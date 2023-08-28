import mongoose from "mongoose";
const { Schema } = mongoose;
const NFTSchema = new mongoose.Schema(
  {
    NFTAddress: {
      type: String,
      unique: true,
    },
    ownerAddress: String,
    managerAddress: String,
    nft_image: String,
    name: String,
    description: String,
    isListed: Boolean,
    isLike: String,
    listingPrice: String,
    demandPrice: String,
    attributes: [String],
    NFTCollection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models?.NFT || mongoose.model("NFT", NFTSchema);
