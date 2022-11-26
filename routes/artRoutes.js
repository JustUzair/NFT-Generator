const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");
const authController = require("../controllers/authController");

router
  .route("/uploadArt")
  .post(
    authController.protect,
    authController.restrictTo("artist"),
    artController.uploadArt,
    artController.resizeArt
  );
router
  .route("/generateArts")
  .post(
    authController.protect,
    authController.restrictTo("artist"),
    artController.generateArts
  );
module.exports = router;
