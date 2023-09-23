import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new mongoose.Schema(
    {
        from: String,
        to: String,
        price: String,
        nft: {
            type: Schema.Types.ObjectId,
            ref: "NFT",
        },
        type: {
            type: String,
            enum: ["sale", "bid"],
            default: "no activity",
        }
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.Activity || mongoose.model("Notification", NotificationSchema);
