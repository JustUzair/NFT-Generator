const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

// router.use(authController.isLoggedIn);
router.get("/", authController.isLoggedIn, viewController.getOverview);
router.use(viewController.alerts);
router.get(
  "/artists/:id/arts",
  authController.isLoggedIn,
  viewController.getGeneratedArts
);
router.get("/signup", authController.isLoggedIn, viewController.getSignUpForm);
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/resetPassword/:token", viewController.getResetPasswordForm);
router.get("/forgotPassword", viewController.getForgotPasswordForm);
router.get("/me", authController.protect, viewController.getAccount);
router.get(
  "/myUploads",
  authController.protect,
  authController.restrictTo("artist"),
  viewController.getMyUploads
);

router.post(
  "/submit-user-data",
  authController.protect,
  viewController.updateUserData
);
router.use("*", authController.isLoggedIn);
module.exports = router;
