const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
// const createImage = require("./nftGen");
const generateNFTs = require("./nftGen");

const { promisify } = require("util");
const { existsSync, mkdirSync, rmSync, rmdirSync, readdir, rm } = require("fs");
const Art = require("../models/artModel");
const AppError = require("../utils/appErrors");
const { mkdir, rmdir, writeFile } = require("fs").promises;

const multerStorage = multer.memoryStorage(); // Store uploaded files in RAM
/*
  |-------------------------------------------------------------------------|
  |                 Only allow SVG images to be uploaded                    |
  |-------------------------------------------------------------------------|
*/
const multerFilter = (req, file, cb) => {
  console.log("File Type : " + file.mimetype);
  if (file.mimetype === "image/svg+xml") cb(null, true);
  else
    cb(new AppError("Not an SVG file!, Please upload svg images only!"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadArt = upload.single("art"); // upload single image, passed in the req.body, with name "art"

/*
  |-------------------------------------------------------------------------|
  |                NOTE: Resizing an SVG causes errors in our case          |
  |         MAKE CHANGES TO UPLOADED FILE if any ex:resize, scale to        |
  |         specific dimensions                                             |
  |         Lastly store image at given location                            |
  |-------------------------------------------------------------------------|
*/
exports.resizeArt = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  req.file.filename = req.file.originalname;
  await writeFile(
    `public/img/arts/${req.user.id}/layers/${req.file.filename}`,
    req.file.buffer //Uploaded image in the memory
  );
  res.status(200).json({
    status: "success",
  });
});

exports.generateArts = catchAsync(async (req, res, next) => {
  const user = req.user;
  //   console.log("User.id : ", user.id);
  //--------------------------Uncomment if you want to regenerate arts--------------------------
  try {
    await Art.deleteMany({ artist: user.id });
    if (existsSync(`./public/img/arts/${user.id}/out/`))
      rmdirSync(`./public/img/arts/${user.id}/out/`, {
        recursive: true,
        force: true,
      });
  } catch (err) {}

  //-----------------------------------------------------------------------------------------------

  //--------------------------Check if art is already generated------------------------------------
  try {
    let outFileProm = new Promise((resolve, reject) => {
      return readdir(`./public/img/arts/${user.id}/out`, (err, filenames) =>
        err != null ? reject(err) : resolve(filenames)
      );
    });
    const out = await outFileProm;
    if (out.length > 0)
      return next(new AppError("Your arts have already been generated")); // Don't allow regeneration of arts
  } catch (err) {}
  //-----------------------------------------------------------------------------------------------

  // If 'out folder' doesn't exist for a given artist ID, make an 'out' folder
  if (!existsSync(`./public/img/arts/${user.id}/out/`)) {
    mkdirSync(`./public/img/arts/${user.id}/out/`);
  }

  // If 'out folder' doesn't exist for a given artist ID, make an 'out' folder
  const readLayersProm = new Promise((resolve, reject) => {
    return readdir(`./public/img/arts/${user.id}/layers`, (err, filenames) =>
      err != null ? reject(err) : resolve(filenames)
    );
  });
  const files = await readLayersProm;
  const attributeCount = {
    beard: 0,
    bg: 0,
    eyes: 0,
    hair: 0,
    head: 0,
    mouth: 0,
    nose: 0,
  };
  files.map(file => {
    //Count the attributes (i.e. no of files for each attribute)
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
  console.log("Attribute Count : " + JSON.stringify(attributeCount));
  //No Files are found, return error message
  if (
    attributeCount.bg == 0 ||
    attributeCount.hair == 0 ||
    attributeCount.eyes == 0 ||
    attributeCount.nose == 0 ||
    attributeCount.mouth == 0 ||
    attributeCount.beard == 0 ||
    attributeCount.head == 0
  ) {
    res.status(404).json({
      status: "fail",
      message:
        "You don't have any / insufficient layers uploaded, please upload layers to generate NFTs",
    });
  } else {
    // Layer Files are found, calculate possible combinations from the files
    let possibleCombinations =
      (attributeCount.bg - 1 != 0 ? attributeCount.bg - 1 : 1) *
      (attributeCount.hair - 1 != 0 ? attributeCount.hair - 1 : 1) *
      (attributeCount.eyes - 1 != 0 ? attributeCount.eyes - 1 : 1) *
      (attributeCount.nose - 1 != 0 ? attributeCount.nose - 1 : 1) *
      (attributeCount.mouth - 1 != 0 ? attributeCount.mouth - 1 : 1) *
      (attributeCount.beard - 1 != 0 ? attributeCount.beard - 1 : 1) *
      (attributeCount.head - 1 != 0 ? attributeCount.head - 1 : 1);

    // Exactly 1 Layer File, for each attribute, generate single art
    if (possibleCombinations == 1) possibleCombinations = 0; // value is set because, art is generated in do-while loop
    // console.log(`Combinations : ${possibleCombinations}`);

    // An artist can only generate 200 NFTs
    let index = Math.min(possibleCombinations - 1, 199);

    await generateNFTs(index, user.id, attributeCount);
    // NFTs generation successful, send acknowledgement
    res.status(200).json({
      status: "success",
      message: "Your NFTs have been generated!",
    });
  }
});
