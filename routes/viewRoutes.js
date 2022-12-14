const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

/*|------------------------------------------------------------------------------|
  |     MiddleWare Function in this route and their uses (Other than views)      |
  |     authController.isLoggedIn => Check if user is already logged in          |
  |                                                                              |
  |     authController.protect => Check if user is logged in before allowing     |
  |     access to private routes                                                 |
  |                                                                              |
  |     authController.restrictTo(role) => Allow access to the route only if user|
  |     has the authority                                                        |           
  |------------------------------------------------------------------------------|     
*/

router.get("/", authController.isLoggedIn, viewController.getOverview); //ROOT URL - Render Home page
router.get(
  "/artists/:id/arts",
  authController.isLoggedIn, // Check if the user is already logged in
  viewController.getGeneratedArts // Get NFTs generated by artist
);
router.get("/signup", authController.isLoggedIn, viewController.getSignUpForm); // Render a signup form.
router.get("/login", authController.isLoggedIn, viewController.getLoginForm); // Render a login form
router.get("/resetPassword/:token", viewController.getResetPasswordForm); // Render form for given password reset token
router.get("/forgotPassword", viewController.getForgotPasswordForm); // Render forgot password page
router.get("/me", authController.protect, viewController.getAccount); // Render Profile/My Account Page of currently logged in user.
router.get(
  "/myUploads",
  authController.protect,
  authController.restrictTo("artist"),
  viewController.getMyUploads // Get art layers uploaded by the artist
);

router.use("*", authController.isLoggedIn); // For un-mounted routes, display if the user is logged in or not
module.exports = router;
