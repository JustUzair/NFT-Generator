import mongoose, { Model, Models } from "mongoose";
const Schema = mongoose.Schema;

const artistSchema = new mongoose.Schema({
  artistName: { type: String, required: true },
  artistWalletAddress: { type: String, required: true, unique: true },
  collectionsAddresses: [{ type: String, required: true }],
  active: {
    type: Boolean,
    default: true,
  },
});

// Restart server after changing models
export default mongoose.models.Artists ||
  mongoose.model("Artists", artistSchema);
