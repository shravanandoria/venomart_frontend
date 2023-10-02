import mongoose from "mongoose";
const { Schema } = mongoose;

const OfferSchema = new mongoose.Schema(
    {
        from: String,
        to: String,
        offerPrice: String,
        hash: String,
        nft: {
            type: Schema.Types.ObjectId,
            ref: "NFT",
        },
        status: {
            type: String,
            enum: ["active", "expired", "cancelled", "aceepted"],
            default: "active",
        },
        expiration: {
            type: String,
            enum: ["1day", "7days", "30days"],
            default: "7days",
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.Offer || mongoose.model("Offer", OfferSchema);
