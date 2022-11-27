const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appErrors");
const factory = require("./handlerFactory");

const multerStorage = multer.memoryStorage();

/*
  |-------------------------------------------------------------------------|
  |                 Only allow images to be uploaded                        |
  |-------------------------------------------------------------------------|
*/
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an image!, Please upload images only!"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadUserPhoto = upload.single("photo");

/*
  |-------------------------------------------------------------------------|
  |         MAKE CHANGES TO UPLOADED FILE if any ex:resize, scale to        |
  |         specific dimensions                                             |
  |         Lastly store image at given location                            |
  |-------------------------------------------------------------------------|
*/
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90, // percent
    })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

// Returns an object with allowedFields; fields which are allowed to be updated.
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(key => {
    //extract allowedFields from the obj
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj; // return new obj containing only allowed fields.
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file); ==> User PFP
  // console.log(req.body); ==> User data like: email, name, etc

  /*
  |-------------------------------------------------------------------------|
  |                1. Create error if user tries to update password         |
  |-------------------------------------------------------------------------|
*/
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        "This route does not support password update. Go to '/updateMyPassword' for password update.",
        400
      )
    );

  /*
  |-------------------------------------------------------------------------|
  |           2. Filter out unwanted fields                                 |
  |-------------------------------------------------------------------------|
*/
  const filteredBody = filterObj(req.body, "name", "email"); //only name and email are allowed to be modified

  // If an image is uploaded, add it to the object, containing values for fields to be updated
  if (req.file) {
    filteredBody.photo = req.file.filename;
  }

  /*
  |-----------------------------------------------|
  |          3. Update user document              |
  |-----------------------------------------------|
*/
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true, // return the new, updated document
    runValidators: true, // ex: check if name is not null, email is unique, etc. ==> Validations are defined within the DB Schemas
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updatedUser,
    },
  });
});

/*
  |-----------------------------------------------|
  |      Delete the user, mark them as inactive   |
  |-----------------------------------------------|
*/
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: "success",
    data: null,
  });
});

/*
  |-----------------------------------------------|
  |    Set URL parameter id = id of current user  |
  |-----------------------------------------------|
*/
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.createUser = (req, res) => {
  res.status(500).json({
    status: "error",
    message: "This Route not defined, use /signup instead!!",
  });
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const doc = await User.find(); // Query the DB
  res.status(200).json({
    status: "success",
    length: doc.length, // length of document
    data: {
      data: doc, // return doc
    },
  });
});
exports.getUser = factory.getOne(User); // Get a particular User
exports.updateUser = factory.updateOne(User); // Update a  user
exports.deleteUser = factory.deleteOne(User); // Delete a user
