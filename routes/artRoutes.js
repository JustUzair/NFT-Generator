const express = require("express");
const router = express.Router();
const artController = require("../controllers/artController");
const authController = require("../controllers/authController");

/*|------------------------------------------------------------------------------|
  |     Important MiddleWare Function in this route and their uses               |
  |                                                                              |
  |     authController.protect => Check if user is logged in before allowing     |
  |     access to private routes                                                 |
  |                                                                              |
  |     authController.restrictTo(role) => Allow access to the route only if user|
  |     has the authority                                                        |           
  |------------------------------------------------------------------------------|     
*/
router.route("/uploadArt").post(
  authController.protect, // user needs to be logged in to access this route
  authController.restrictTo("artist"), //only artist can upload layers/art layers
  artController.uploadArt, // Get new layer uploaded by the artist
  artController.resizeArt // Resize the pfp for fixed dimensions
);
router.route("/generateArts").post(
  authController.protect, // user needs to be logged in to access this route
  authController.restrictTo("artist"), //only artist can generate arts/NFTs
  artController.generateArts // Generate arts/NFTs
);
module.exports = router;
