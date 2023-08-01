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
  Date: String,
  isArtist: Boolean,
  socials: [String],
  nftCollections: [
    {
      type: Schema.Types.ObjectId,
      ref: "Collection",
    },
  ],
  transactions: [String],
});

module.exports = mongoose.models?.User || mongoose.model("User", UserSchema);
