import mongoose, { Model, Models } from "mongoose";

const userSchema = new mongoose.Schema({
  userWalletAddress: { type: String, required: true, unique: true },
  ownedNFTs: [
    {
      tokenId: { type: String, required: true },
      contractAddress: { type: String, required: true },
    },
  ],
});

// Restart server after changing models
export default mongoose.models.Users || mongoose.model("Users", userSchema);
