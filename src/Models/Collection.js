import mongoose, { Schema } from "mongoose";

const CollectionSchema = new mongoose.Schema({
    contractAddress: {
        type: String,
        unique: true,
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    coverImage: String,
    logo: String,
    name: String,
    royalty: String,
    description: String,
});

module.exports =
    mongoose.models?.Collection || mongoose.model("Collection", CollectionSchema);
