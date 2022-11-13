const mongoose = require("mongoose");
const crypto = require("crypto");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const artSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: [true, "An art must have a photo"],
  },
  artist: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: [true, "An art must belong to an artist"],
  },
  price: {
    type: Number,
    required: [true, "An art must have a price"],
  },
});

const Art = mongoose.model("Art", artSchema);

module.exports = Art;
