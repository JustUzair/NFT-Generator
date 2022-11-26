const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
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

router.post("/signup", authController.signup); //API route for signup functionality
router.post("/login", authController.login); // API route for login functionality
router.get("/logout", authController.logout); // API route for logout functionality

router.patch("/resetPassword/:token", authController.resetPassword); // API route to reset password based on the passed token

router.post("/forgotPassword", authController.forgotPassword); // API route to handle forgot password functionality

router.use(authController.protect); // All the routes after this line-of-code requires, user to be logged in

router.get("/me", userController.getMe, userController.getUser); // API route to fetch data of current user
router.patch(
  "/updateMe",
  userController.uploadUserPhoto, // Get new pfp uploaded by the user
  userController.resizeUserPhoto, // Resize the pfp for fixed dimensions
  userController.updateMe // Store new pfp, and updated data of user in database
);
router.delete("/deleteMe", userController.deleteMe); // Mark current user as in-active, rather than deleting entire data of user

router.patch("/updateMyPassword", authController.updatePassword); //API route to update password of currently logged-in users

/*|--------------------------------------------------------|
  | .restrictTo("admin") => only admin can perform actions |
  |--------------------------------------------------------|
*/
router
  .route("/")
  .get(authController.restrictTo("admin"), userController.getAllUsers) // Only admin can view all users of the system
  .post(authController.restrictTo("admin"), userController.createUser); // Only admin can create a user, directly via API
router
  .route("/:id") // id => id of a user
  .get(authController.restrictTo("admin"), userController.getUser) // Only admin can view data of other users
  .patch(authController.restrictTo("admin"), userController.updateUser) // Only admin can update data of other users
  .delete(authController.restrictTo("admin"), userController.deleteUser); // Only admin can delete data of other users

module.exports = router;
