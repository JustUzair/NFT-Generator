const catchAsync = require("./../utils/catchAsync");
const AppError = require("../utils/appErrors");
const User = require("./../models/userModel");
const Art = require("./../models/artModel");
const { readdir } = require("fs");
const crypto = require("crypto");

/*
  |-------------------------------------------|
  |         Render Connect Wallet Page        |
  |-------------------------------------------|
*/
exports.getWalletConnect = (req, res) => {
  res.status(200).render("connectWallet", {
    title: "Connect Wallet",
  });
};

/*
  |--------------------------------------------|
  |         Render Artist Overview Page        |
  |--------------------------------------------|
*/
exports.getOverview = catchAsync(async (req, res, next) => {
  //Renders all the users with role = artist
  const artists = await User.find({ role: "artist" });
  console.log(`${artists[0]._id}`);
  res.status(200).render("overview", {
    title: "All Artists",
    artists,
  });
});

/*
  |--------------------------------------------|
  |         Render Generated Arts Page         |
  |--------------------------------------------|
*/
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

/*
  |-----------------------------------------------------------------------|
  |         Render Layer files uploaded by an artist                      |
  |-----------------------------------------------------------------------|
*/
exports.getMyUploads = catchAsync(async (req, res, next) => {
  const generatedFilesProm = new Promise((resolve, reject) => {
    return readdir(`./public/img/arts/${req.user.id}/out`, (err, filenames) =>
      err != null ? reject(err) : resolve(filenames)
    );
  });
  const generatedFiles = await generatedFilesProm;
  //   console.log(`Generated Arts : ${generatedFiles.length}`);
  const uploadedFilesProm = new Promise((resolve, reject) => {
    return readdir(
      `./public/img/arts/${req.user.id}/layers`,
      (err, filenames) => (err != null ? reject(err) : resolve(filenames))
    );
  });
  const uploadedFiles = await uploadedFilesProm;
  const attributeCount = {
    beard: 0,
    bg: 0,
    eyes: 0,
    hair: 0,
    head: 0,
    mouth: 0,
    nose: 0,
  };
  uploadedFiles.map(file => {
    if (file.startsWith("beard")) {
      attributeCount.beard = attributeCount.beard + 1;
    } else if (file.startsWith("bg")) {
      attributeCount.bg = attributeCount.bg + 1;
    } else if (file.startsWith("eyes")) {
      attributeCount.eyes = attributeCount.eyes + 1;
    } else if (file.startsWith("hair")) {
      attributeCount.hair = attributeCount.hair + 1;
    } else if (file.startsWith("head")) {
      attributeCount.head = attributeCount.head + 1;
    } else if (file.startsWith("mouth")) {
      attributeCount.mouth = attributeCount.mouth + 1;
    } else if (file.startsWith("nose")) {
      attributeCount.nose = attributeCount.nose + 1;
    }
  });
  //   console.log(`Attribute Count : ${JSON.stringify(attributeCount)}`);
  /*
  |----------------------------------------------------------------------------------------------------|
  |         Return the attribute count object, in order to iterate over files and render images        |
  |----------------------------------------------------------------------------------------------------|
*/
  res.status(200).render("uploadedArts", {
    title: "My Uploads",
    attributeCount,
    generatedCount: generatedFiles.length,
  });
});

/*
  |----------------------------------|
  |         Render Login Form        |
  |----------------------------------|
*/
exports.getLoginForm = (req, res) => {
  res.status(200).render("login", {
    title: "Login",
  });
};
/*
  |-----------------------------------|
  |         Render Signup Form        |
  |-----------------------------------|
*/
exports.getSignUpForm = (req, res) => {
  res.status(201).render("signup", {
    title: "Sign Up",
  });
};

/*
  |--------------------------------------------|
  |         Render Account/Profile Page        |
  |--------------------------------------------|
*/
exports.getAccount = (req, res) => {
  res.status(200).render("account", {
    title: `${req.user.name}`,
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
