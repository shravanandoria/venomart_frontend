import mongoose from "mongoose";
const { Schema } = mongoose;

const OfferSchema = new mongoose.Schema(
    {
        chain: String,
        from: String,
        offerContract: String,
        offerPrice: String,
        nft: {
            type: Schema.Types.ObjectId,
            ref: "NFT",
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled", "accepted", "outbidded"],
            default: "active",
        },
        expiration: {
            type: String,
            enum: ["1day", "7days", "15days", "30days"],
            default: "7days",
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.Offer || mongoose.model("Offer", OfferSchema);
