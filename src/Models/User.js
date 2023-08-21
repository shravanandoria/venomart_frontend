import mongoose, { Schema } from "mongoose";

const UserSchema = new mongoose.Schema({
  wallet_id: {
    type: String,
    unique: true,
  },
  user_name: {
    type: String,
    sparse: true,
  },
  email: {
    type: String,
    sparse: true,
  },
  bio: {
    type: String,
    sparse: true,
  },
  profileImage: {
    type: String,
    sparse: true,
  },
  coverImage: {
    type: String,
    sparse: true,
  },
  isArtist: Boolean,
  socials: [String],
  nftCollections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
  launchpad_collections: [String],
  listedNFTs: [
    {
      type: Schema.Types.ObjectId,
      ref: "NFT",
    },
  ],
  activity: [
    {
      type: Schema.Types.ObjectId,
      ref: "Activity",
    },
  ],
});

module.exports = mongoose.models?.User || mongoose.model("User", UserSchema);
