import mongoose from "mongoose";
const { Schema } = mongoose;
const ActivitySchema = new mongoose.Schema(
  {
    chain: String,
    hash: String,
    from: String,
    to: String,
    price: String,
    item: {
      type: Schema.Types.ObjectId,
      ref: "NFT",
    },
    type: {
      type: String,
      enum: ["mint", "list", "cancel", "sale", "offer", "canceloffer", "no activity"],
      default: "no activity",
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    nft_collection: {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models?.Activity || mongoose.model("Activity", ActivitySchema);
