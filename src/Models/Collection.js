import mongoose from "mongoose";
const { Schema } = mongoose;

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
    activity: [
      {
        type: Schema.Types.ObjectId,
        ref: "Activity",
      },
    ],
  },
  { timestamps: true }
);

module.exports =
  mongoose.models?.Collection || mongoose.model("Collection", CollectionSchema);
