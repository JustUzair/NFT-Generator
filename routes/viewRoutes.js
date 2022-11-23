const express = require("express");
const router = express.Router();
const viewController = require("../controllers/viewController");
const authController = require("../controllers/authController");

// router.use(authController.isLoggedIn);
router.use(viewController.alerts);
router.get("/artists/:id/arts", viewController.getGeneratedArts);
router.get("/signup", authController.isLoggedIn, viewController.getSignUpForm);
router.get("/", authController.isLoggedIn, viewController.getOverview);
router.get("/login", authController.isLoggedIn, viewController.getLoginForm);
router.get("/resetPassword/:token", viewController.getResetPasswordForm);
router.get("/forgotPassword", viewController.getForgotPasswordForm);
router.get("/me", authController.protect, viewController.getAccount);

router.post(
  "/submit-user-data",
  authController.protect,
  viewController.updateUserData
);
module.exports = router;
