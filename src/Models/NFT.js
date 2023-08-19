import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema(
    {
        NFTAddress: {
            type: String,
            unique: true,
        },
        ownerAddress: String,
        managerAddress: String,
        imageURL: String,
        title: String,
        description: String,
        isListed: Boolean,
        isLike: String,
        listingPrice: String,
        properties: [String],
        collection: {
            type: Schema.Types.ObjectId,
            ref: "Collection",
        },
        transactions: [{
            type: Schema.Types.ObjectId,
            ref: "Transaction",
        }],
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.NFT || mongoose.model("NFT", NFTSchema);
