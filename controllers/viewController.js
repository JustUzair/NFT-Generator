const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appErrors");
const User = require("./../models/userModel");
const Art = require("./../models/artModel");

const crypto = require("crypto");

exports.getOverview = catchAsync(async (req, res, next) => {
  // 1. Get tour data from collection
  const artists = await User.find({ role: "artist" });
  console.log(`${artists[0]._id}`);
  // 2. Build template
  // 3. render template
  res.status(200).render("overview", {
    title: "All Artists",
    artists,
  });
});
exports.getGeneratedArts = catchAsync(async (req, res, next) => {
  const id = req.params.id;
  const artist = await User.findById(id);
  const arts = await Art.find({ artist: id });
  res.status(200).render("artsPage", {
    title: artist.name,
    arts,
    artCount: arts.length,
    artist,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};

exports.getSignUpForm = (req, res) => {
  res.status(201).render("signup", {
    title: "Sign Up",
  });
};

exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: `${req.user.name}`,
  });
};

exports.updateUserData = async (req, res) => {
  // console.log(req.body);
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
    },
    {
      new: true,
      runValidators: true,
    }
  );
  res.status(200).render("account", {
    title: `${req.user.name}`,
    user: updatedUser,
  });
};

exports.getResetPasswordForm = catchAsync(async (req, res, next) => {
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError("Token is invalid or has expired", 400));
  res.status(200).render("passwordResetForm", {
    title: "Reset Password",
  });
});

exports.getForgotPasswordForm = catchAsync(async (req, res, next) => {
  res.status(200).render("passwordForgotForm", {
    title: "Reset Password",
  });
});

exports.alerts = (req, res, next) => {
  const { alert } = req.query;
  if (alert === "booking")
    res.locals.alert = `Your booking has been successful!, If your booking doesn't show up here immediately, please come back later.`;
  next();
};
