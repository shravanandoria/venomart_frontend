import mongoose from "mongoose";

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
    description: String,
    socials: [String],
    isVerified: Boolean,
    NFTs: [
      {
        type: Schema.Types.ObjectId,
        ref: "NFT",
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models?.Collection || mongoose.model("Collection", CollectionSchema);
