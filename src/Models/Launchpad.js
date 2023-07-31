import { Schema } from "mongoose";

const LaunchpadSchema = new Schema({
  name: String,
});

module.exports =
  mongoose.models?.Launchpad || mongoose.model("Launchpad", LaunchpadSchema);
