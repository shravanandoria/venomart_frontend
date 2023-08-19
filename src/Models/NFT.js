import mongoose from "mongoose";

const NFTSchema = new mongoose.Schema(
    {
        NFTAddress: {
            type: String,
            unique: true,
        },
        ownerAddress: String,
        managerAddress: String,
        logo: String,
        title: String,
        description: String,
        socials: [String],
        isVerified: Boolean,
    },
    { timestamps: true }
);

module.exports =
    mongoose.models?.NFT || mongoose.model("NFT", NFTSchema);
