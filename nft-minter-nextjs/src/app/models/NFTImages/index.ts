import mongoose, { Model, Models } from "mongoose";
const Schema = mongoose.Schema;

const nftImagesSchema = new mongoose.Schema({
  artist: {
    type: Schema.Types.ObjectId,
    ref: "Artists",
  },
  nftImagesLinks: [
    {
      url: String,
      required: true,
    },
  ],
});

// Restart server after changing models
export default mongoose.models.Artists ||
  mongoose.model("NFTImages", nftImagesSchema);
