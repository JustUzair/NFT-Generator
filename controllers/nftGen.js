const { writeFile, readFile } = require("fs").promises;
const { promisify } = require("util");
const catchAsync = require("../utils/catchAsync");
const sharp = require("sharp");
const AppError = require("../utils/appErrors");
const Art = require("../models/artModel");

const template = `
    <svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- bg -->
        <!-- head -->
        <!-- hair -->
        <!-- eyes -->
        <!-- nose -->
        <!-- mouth -->
        <!-- beard -->
    </svg>
`;

const takenNames = {};
const takenFaces = {};
let index = 100;

function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}

function randElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomName() {
  const adjectives =
    "fired cool chad gigachad bozo normy nerd nerdy little jazzy funny creepy lil dusty fiery trashy tubular nasty jacked swol buff ferocious firey flamin agnostic artificial bloody crazy cringey crusty dirty eccentric glutinous harry juicy simple stylish awesome creepy corny freaky shady sketchy lame sloppy hot intrepid juxtaposed killer ludicrous mangy pastey ragin rusty rockin sinful shameful stupid sterile ugly vascular wild young old zealous flamboyant super sly shifty trippy fried injured depressed anxious clinical".split(
      " "
    );
  const names =
    "aaron bart chad dale earl fred grady harry ivan jeff joe kyle lester steve tanner lucifer todd mitch hunter mike arnold norbert olaf plop quinten randy saul balzac tevin jack ulysses vince will xavier yusuf zack roger raheem rex dustin seth bronson dennis".split(
      " "
    );

  const randAdj = randElement(adjectives);
  const randName = randElement(names);
  const name = `${randAdj}-${randName}`;

  if (takenNames[name] || !name) {
    return getRandomName();
  } else {
    takenNames[name] = name;
    return name;
  }
}

async function getLayer(user, name, skip = 0.0) {
  //   console.log("USER GET LAYER ");
  //   const svg = readFileSync(`./public/img/temp/layers/${name}.svg`, "utf-8");
  const svg = await readFile(
    `./public/img/arts/${user}/layers/${name}.svg`,
    "utf-8"
  );

  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : "";
}

async function svgToPng(name, user) {
  const src = `./public/img/arts/${user}/out/${name}.svg`;
  const dest = `./public/img/arts/${user}/out/${name}.png`;

  const img = await sharp(src);
  const resized = await img.resize(1024);
  await resized.toFile(dest);
}

async function createImage(index, user, attribute) {
  try {
    const bg = randInt(attribute.bg - 1);
    const hair = randInt(attribute.hair - 1);
    const eyes = randInt(attribute.eyes - 1);
    const nose = randInt(attribute.nose - 1);
    const mouth = randInt(attribute.mouth - 1);
    const beard = randInt(attribute.beard - 1);
    const faceCut = randInt(attribute.head - 1);
    // 18,900 combinations

    const face = [hair, eyes, mouth, nose, beard, faceCut].join("");

    if (face[takenFaces]) {
      createImage();
    } else {
      const name = getRandomName();
      const description = `A drawing of ${name.split("-").join(" ")}`;
      //   console.log(name);
      face[takenFaces] = face;

      const final = template
        .replace("<!-- bg -->", await getLayer(user, `bg${bg}`))
        .replace("<!-- head -->", await getLayer(user, `head${faceCut}`))
        .replace("<!-- hair -->", await getLayer(user, `hair${hair}`))
        .replace("<!-- eyes -->", await getLayer(user, `eyes${eyes}`))
        .replace("<!-- nose -->", await getLayer(user, `nose${nose}`))
        .replace("<!-- mouth -->", await getLayer(user, `mouth${mouth}`))
        .replace("<!-- beard -->", await getLayer(user, `beard${beard}`, 0.5));

      const meta = {
        name,
        description,
        image: `${index}.png`,
        attributes: [
          {
            beard: "",
            rarity: 0.01,
          },
        ],
      };
      try {
        await writeFile(
          `./public/img/arts/${user}/out/${index}.json`,
          JSON.stringify(meta)
        );

        await writeFile(`./public/img/arts/${user}/out/${index}.svg`, final);
      } catch (err) {
        console.log(err.message);
      }

      await svgToPng(index, user);
      const basePrice = 0.05;

      await Art.create({
        artist: user,
        photo: `${index}.png`,
        price: basePrice,
        name,
        description,
      });
    }
  } catch (err) {
    console.log(err.message);
  }
}

module.exports = createImage;
