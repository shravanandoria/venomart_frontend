import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema(
  {
    hash: String,
    from: String,
    to: String,
    price: String,
    nft: {
      type: Schema.Types.ObjectId,
      ref: "NFT",
    },
    status: String,
  },
  { timestamps: true }
);

module.exports =
  mongoose.models?.Transaction || mongoose.model("Transaction", NFTSchema);
