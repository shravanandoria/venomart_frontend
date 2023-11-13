import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema(
    {
        chain: String,
        user: String,
        soldTo: String,
        price: String,
        hash: String,
        nft: {
            type: Schema.Types.ObjectId,
            ref: "NFT",
        },
        type: {
            type: String,
            enum: ["sale", "bid", "offer"],
            default: "sale",
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.Notification || mongoose.model("Notification", NotificationSchema);
