const multer = require("multer");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const createImage = require("./nftGen");
const { promisify } = require("util");
const multerStorage = multer.memoryStorage();
const {
  existsSync,
  mkdirSync,
  rmSync,
  rmdirSync,
  readdir,
  rm,
  //   writeFileSync,
} = require("fs");
const Art = require("../models/artModel");
const AppError = require("../utils/appErrors");
const { mkdir, rmdir, writeFile } = require("fs").promises;

//only allow images to be uploaded
const multerFilter = (req, file, cb) => {
  console.log("File Type : " + file.mimetype);
  if (file.mimetype === "image/svg+xml") cb(null, true);
  else
    cb(new AppError("Not an SVG file!, Please upload svg images only!"), false);
};
const upload = multer({ storage: multerStorage, fileFilter: multerFilter });
exports.uploadArt = upload.single("photo");

//MAKE CHANGES TO UPLOAD FILE Upload File Middleware
exports.resizeArt = catchAsync(async (req, res, next) => {
  if (!req.file) return next();

  //   req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  req.file.filename = req.file.originalname;
  //   console.log(req.file.buffer.toString());
  //   (await sharp(req.file.buffer)).toFile(
  //     `public/img/arts/${req.user.id}/layers/${req.file.filename}`
  //   );
  await writeFile(
    `public/img/arts/${req.user.id}/layers/${req.file.filename}`,
    req.file.buffer
  );
  res.status(200).json({
    status: "success",
  });
});

exports.generateArts = catchAsync(async (req, res, next) => {
  const user = req.user;
  //   console.log("User.id : ", user.id);
  //--------------------------Uncomment if you want to regenerate arts--------------------------
  //   try {
  //     await Art.deleteMany({ artist: user.id });
  //     if (existsSync(`./public/img/arts/${user.id}/out/`))
  //       rmdirSync(`./public/img/arts/${user.id}/out/`, {
  //         recursive: true,
  //         force: true,
  //       });
  //   } catch (err) {}

  //-----------------------------------------------------------------------------------------------

  try {
    let outProm = new Promise((resolve, reject) => {
      return readdir(`./public/img/arts/${user.id}/out`, (err, filenames) =>
        err != null ? reject(err) : resolve(filenames)
      );
    });
    const out = await outProm;
    if (out.length > 0)
      return next(new AppError("Your arts have already been generated"));
  } catch (err) {}

  // rm(`./public/img/arts/${user.id}/out/`, {
  //   recursive: true,
  // });
  if (!existsSync(`./public/img/arts/${user.id}/out/`)) {
    mkdirSync(`./public/img/arts/${user.id}/out/`);
  }

  const prom = new Promise((resolve, reject) => {
    return readdir(`./public/img/arts/${user.id}/layers`, (err, filenames) =>
      err != null ? reject(err) : resolve(filenames)
    );
  });
  const files = await prom;
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
    let possibleCombinations =
      (attributeCount.bg - 1 != 0 ? attributeCount.bg - 1 : 1) *
      (attributeCount.hair - 1 != 0 ? attributeCount.hair - 1 : 1) *
      (attributeCount.eyes - 1 != 0 ? attributeCount.eyes - 1 : 1) *
      (attributeCount.nose - 1 != 0 ? attributeCount.nose - 1 : 1) *
      (attributeCount.mouth - 1 != 0 ? attributeCount.mouth - 1 : 1) *
      (attributeCount.beard - 1 != 0 ? attributeCount.beard - 1 : 1) *
      (attributeCount.head - 1 != 0 ? attributeCount.head - 1 : 1);
    if (possibleCombinations == 1) possibleCombinations = 0;
    let index = Math.min(possibleCombinations, 199);
    do {
      try {
        await createImage(index, user.id, attributeCount);
        index--;
      } catch (err) {
        console.log(err.message);
        break;
      }
    } while (index >= 0);
    res.status(200).json({
      status: "success",
      message: "Your NFTs have been generated!",
    });
  }
});
