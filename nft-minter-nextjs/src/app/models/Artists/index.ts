import mongoose, { Model, Models } from "mongoose";

const artistSchema = new mongoose.Schema({
  artistName: { type: String, required: true },
  artistWalletAddress: { type: String, required: true, unique: true },
  nftCollection: {
    chainId: {
      type: Number,
      default: 80002,
    },
    contractAddress: {
      type: String,
      default: "",
    },
  },
  pfp: {
    decentralizedURL: {
      type: String,
    },
    url: {
      type: String,
      required: true,
      default: "/mintrrs-logo-bg.jpeg",
    },
  },
  active: {
    type: Boolean,
    default: true,
  },
});

// Restart server after changing models
export default mongoose.models.Artists ||
  mongoose.model("Artists", artistSchema);
