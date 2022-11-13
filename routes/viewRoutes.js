const express = require('express');
const router = express.Router();
const viewController = require('../controllers/viewController');
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');
// router.use(authController.isLoggedIn);
router.use(viewController.alerts);

router.get('/signup', authController.isLoggedIn, viewController.getSignUpForm);
router.get(
	'/',
	// bookingController.createBookingCheckout,
	authController.isLoggedIn,
	viewController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.getLoginForm);
router.get(
	'/my-bookings',
	authController.protect,
	viewController.getMyBookings
);
// router.post('/resetPassword/:token', viewController.getResetPasswordForm);
router.get('/resetPassword/:token', viewController.getResetPasswordForm);
router.get('/forgotPassword', viewController.getForgotPasswordForm);

router.get('/me', authController.protect, viewController.getAccount);

router.post(
	'/submit-user-data',
	authController.protect,
	viewController.updateUserData
);
module.exports = router;
