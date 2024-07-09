import mongoose, { Model, Models } from "mongoose";
const Schema = mongoose.Schema;

const nftImagesSchema = new mongoose.Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artists",
  },
  nftImagesLinks: [
    {
      name: { type: String, required: true },
      description: { type: String, required: true },
      decentralizedURL: { type: String, required: true },
      centralizedURL: { type: String, required: true },
      jsonFileDecentralizedURL: { type: String, required: false },
      basePrice: { type: Number, required: true },
      tokenId: { type: Number, required: true },
    },
  ],
  collectionIPFSLink: { type: String, required: false },
});

// Restart server after changing models
export default mongoose.models.NFTImages ||
  mongoose.model("NFTImages", nftImagesSchema);
