import mongoose from "mongoose";

const artistSchema = new mongoose.Schema({
  artistName: { type: String, required: true },
  artistWalletAddress: { type: String, required: true, unique: true },
  collectionsAddresses: [{ type: String, required: true }],
});

export default mongoose.models.Artists ||
  mongoose.model("Artists", artistSchema);
