const {
  readFileSync,
  writeFileSync,
  readdirSync,
  rmSync,
  existsSync,
  mkdirSync,
} = require("fs");
const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const createImage = "./nftGen.js";
const multerStorage = multer.memoryStorage();

//only allow images to be uploaded
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) cb(null, true);
  else cb(new AppError("Not an image!, Please upload images only!"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadArt = upload.single("photo");

//minor-fixes to allow image-url from other sources i.e cloudinary
exports.resizeArt = catchAsync(async (req, res, next) => {
  if (!req.files) return next();

  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat("jpeg")
    .jpeg({
      quality: 90, // percent
    })
    .toFile(`public/img/users/${req.file.filename}`);
  //   const cloudinary_URL = await cloudinary.uploader.upload(
  //     `public/img/users-${req.user}/${req.file.filename}`
  //   );
  //   // console.log('CLOUDINARY URL -----------------' + cloudinary_URL.url);
  //   req.file.filename = cloudinary_URL.url;
  next();
});

exports.generateArts = catchAsync(async (req, res, next) => {
  const user = req.user;
  console.log("User.id : ", user.id);
});
