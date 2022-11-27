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

/*
  |-------------------------------------------------|
  |                max + 1 is non-inclusive         |
  |                floor(5.95) = 5                  |
  |-------------------------------------------------|
*/
function randInt(max) {
  return Math.floor(Math.random() * (max + 1));
}
/*
  |-------------------------------------------------|
  |                arr.length =10                   |
  |                floor(5.95) = 5                  |
  |               return 5th element from array     |
  |-------------------------------------------------|
*/
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
    return getRandomName(); //if name is taken get a new name
  } else {
    takenNames[name] = name; //accept the name
    return name;
  }
}

async function getLayer(user, name, skip = 0.0) {
  const svg = await readFile(
    `./public/img/arts/${user}/layers/${name}.svg`,
    "utf-8"
  );
  /*
        |--------------------------------------------------------|
        |                get 'layer' within svg tag              |   
        |        Following layers are to be fetched from svg tag |                
        |                    <!-- bg -->                         |   
        |                    <!-- head -->                       |     
        |                    <!-- hair -->                       |       
        |                    <!-- eyes -->                       |   
        |                    <!-- nose -->                       |  
        |                    <!-- mouth -->                      |   
        |                    <!-- beard -->                      |   
        |--------------------------------------------------------|
      */

  const re = /(?<=\<svg\s*[^>]*>)([\s\S]*?)(?=\<\/svg\>)/g;
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : ""; //return the layer
}

async function svgToPng(name, user) {
  const src = `./public/img/arts/${user}/out/${name}.svg`; // Src file = newly generated svg
  const dest = `./public/img/arts/${user}/out/${name}.png`; // Destination file = png format

  const img = await sharp(src); // read the svg file into sharp
  const resized = await img.resize(1024); // resize the image using sharp
  await resized.toFile(dest); // write the resized image to destination file, png format
}

async function createImage(index, user, attribute) {
  /*
      |---------------------------------------------------|
      |             1) Generate Combinations              |
      |         const bg = randInt(5); ---> o/p: 0        |
      |         const hair = randInt(7); ---> o/p: 1      |
      |         const eyes = randInt(9); ---> o/p: 5      |
      |         const nose = randInt(5); ---> o/p: 6      |
      |         const mouth = randInt(5); ---> o/p: 7     |
      |         const beard = randInt(3); ---> o/p: 8     |
      |         const faceCut = randInt(4); ---> o/p: 9   |
    --|---------------------------------------------------|
    */
  try {
    const bg = randInt(attribute.bg - 1);
    const hair = randInt(attribute.hair - 1);
    const eyes = randInt(attribute.eyes - 1);
    const nose = randInt(attribute.nose - 1);
    const mouth = randInt(attribute.mouth - 1);
    const beard = randInt(attribute.beard - 1);
    const faceCut = randInt(attribute.head - 1);
    /*
  |-------------------------------------------------------------------------|
  |                 2) Generate Combination key                             |
  |         From 1st block we join the random number for all the attributes |
  |         We get, face = 0156789                                          |
  |-------------------------------------------------------------------------|
*/
    const face = [hair, eyes, mouth, nose, beard, faceCut].join("");

    /*
      |-----------------------------------------------------------------------------------------------|
      |                             3) Generate Combination key                                       |
      |     Check if a face combination already exists, if so, generate a new one                     |
      |     and check again (recusrively)                                                             |
      |                                 WORKING                                                       |
      |     When a new face is generated we add it to the current combination                         |
      |      |____ takenFaces[face] = face (face variable from step 2)                                |
      |      |____ In next iteration, again check if current combination is equal to previous one     |
      |              if, so generate a new one                                                        |
      |                                                                                               |
      |                                  EXAMPLE                                                      |
      |          On generation check new combination with existing ones in the object,                |
      |          if not, use it and mark new one as taken, take a look below                          |
      |-----------------------------------------------------------------------------------------------|
*/
    if (takenFaces[face]) {
      createImage(index, user, attribute);
    } else {
      const name = getRandomName();
      const description = `A drawing of ${name.split("-").join(" ")}`;
      //   console.log(name);
      takenFaces[face] = face; // <---- Accept new combination, and add it to object of taken faces

      const final = template
        // pass the random generated integers into the template string to select a layer
        .replace("<!-- bg -->", await getLayer(user, `bg${bg}`))
        .replace("<!-- head -->", await getLayer(user, `head${faceCut}`))
        .replace("<!-- hair -->", await getLayer(user, `hair${hair}`))
        .replace("<!-- eyes -->", await getLayer(user, `eyes${eyes}`))
        .replace("<!-- nose -->", await getLayer(user, `nose${nose}`))
        .replace("<!-- mouth -->", await getLayer(user, `mouth${mouth}`))
        .replace("<!-- beard -->", await getLayer(user, `beard${beard}`, 0.5));
      // Create a json object to write to JSON file
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
          // Write JSON data to json file
          `./public/img/arts/${user}/out/${index}.json`,
          JSON.stringify(meta)
        );

        // Write the generated SVG file to its own SVG file

        await writeFile(`./public/img/arts/${user}/out/${index}.svg`, final);
      } catch (err) {
        console.log(err.message);
      }

      await svgToPng(index, user); // Convert SVG image to PNG
      const basePrice = 0.05; // static price for each art

      await Art.create({
        // Persist the newly created art in the database
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

async function generateNFT(index, id, attributeCount) {
  do {
    try {
      await createImage(index, id, attributeCount);
      index--;
    } catch (err) {
      console.log(err.message);
      break;
    }
  } while (index >= 0);
  //   console.log(JSON.stringify(takenNames)); // prints the taken names, type = object
}

// module.exports = createImage;
module.exports = generateNFT;
