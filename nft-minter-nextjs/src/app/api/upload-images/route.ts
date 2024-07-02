import { getPinataClient } from "@/lib/utils";
import multer from "multer";
import { NextApiRequest, PageConfig } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { Request as ExpressRequest } from "express";
import * as nc from "next-connect";
import fs, { read } from "fs";
import Artists from "@/app/models/Artists";
import { dbConnect } from "@/lib/db";
const memoryStorage = multer.memoryStorage();

// export const uploadImages = multer({
//   storage: memoryStorage,
//   fileFilter(req, file, cb) {
//     if (!file.originalname.match(/\.(svg)$/)) {
//       return cb(new Error("Please upload only svg image file"));
//     }
//     cb(null, true);
//   },
// });

function randInt(max: number) {
  return Math.floor(Math.random() * (max + 1));
}
function randElement(arr: any) {
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

interface AttributeProps {
  bg: number;
  hair: number;
  eyes: number;
  nose: number;
  mouth: number;
  beard: number;
  head: number;
}
const takenNames: any = {};
const takenFaces: any = {};
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

interface FileTypeProps {
  type: "bg" | "head" | "hair" | "eyes" | "nose" | "mouth" | "beard";
}

async function getLayer(
  layersFiles: LayerFilesProps,
  fileType: FileTypeProps,
  layerFileNumber: number,
  skip = 0.0
) {
  console.log("Inside getLayer");

  const svg = await getContentsOfFile(
    layersFiles[`${fileType.type}Layers`][layerFileNumber]
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
  // @ts-ignore
  const layer = svg.match(re)[0];
  return Math.random() > skip ? layer : ""; //return the layer
}

async function createImage(
  index: number,
  user: string,
  attribute: AttributeProps,
  layersFiles: LayerFilesProps
) {
  console.log("Inside createImage");
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

    console.log(`bg: ${bg}`);
    console.log(`hair: ${hair}`);
    console.log(`eyes: ${eyes}`);
    console.log(`nose: ${nose}`);
    console.log(`mouth: ${mouth}`);
    console.log(`beard: ${beard}`);
    console.log(`faceCut: ${faceCut}`);

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
      createImage(index, user, attribute, layersFiles);
    } else {
      const name = getRandomName();
      const description = `A drawing of ${name.split("-").join(" ")}`;
      //   console.log(name);
      takenFaces[face] = face; // <---- Accept new combination, and add it to object of taken faces

      const final = template
        // pass the random generated integers into the template string to select a layer
        .replace("<!-- bg -->", await getLayer(layersFiles, { type: "bg" }, bg))
        .replace(
          "<!-- head -->",
          await getLayer(layersFiles, { type: "head" }, faceCut)
        )
        .replace(
          "<!-- hair -->",
          await getLayer(layersFiles, { type: "hair" }, hair)
        )
        .replace(
          "<!-- eyes -->",
          await getLayer(layersFiles, { type: "eyes" }, eyes)
        )
        .replace(
          "<!-- nose -->",
          await getLayer(layersFiles, { type: "nose" }, nose)
        )
        .replace(
          "<!-- mouth -->",
          await getLayer(layersFiles, { type: "mouth" }, mouth)
        )
        .replace(
          "<!-- beard -->",
          await getLayer(layersFiles, { type: "beard" }, beard, 0.5)
        );
      // Create a json object to write to JSON file

      console.log(`Final SVG`, Buffer.from(final).toString("base64"));

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
      // @TODO
      /*
      1. Generate JSON
      2. Upload NFT to IPFS
      3. Put in json file
      4. upload json to IPFS
      */

      // try {
      //   await writeFile(
      //     // Write JSON data to json file
      //     `./public/img/arts/${user}/out/${index}.json`,
      //     JSON.stringify(meta)
      //   );

      //   // Write the generated SVG file to its own SVG file

      //   await writeFile(`./public/img/arts/${user}/out/${index}.svg`, final);
      // } catch (err: any) {
      //   console.log(err.message);
      // }

      // await svgToPng(index, user); // Convert SVG image to PNG
      const basePrice = 0.05; // static price for each art

      // await Art.create({
      //   // Persist the newly created art in the database
      //   artist: user,
      //   photo: `${index}.png`,
      //   price: basePrice,
      //   name,
      //   description,
      // });
    }
  } catch (err: any) {
    console.log(err.message);
  }
}

async function generateNFT(
  index: number,
  id: string,
  attributeCount: AttributeProps,
  layersFiles: LayerFilesProps
) {
  console.log("Inside generateNFT");

  do {
    try {
      await createImage(index, id, attributeCount, layersFiles);
      index--;
    } catch (err: any) {
      console.log(err.message);
      break;
    }
  } while (index >= 0);
  //   console.log(JSON.stringify(takenNames)); // prints the taken names, type = object
}
interface LayerFilesProps {
  bgLayers: File[];
  headLayers: File[];
  hairLayers: File[];
  eyesLayers: File[];
  noseLayers: File[];
  mouthLayers: File[];
  beardLayers: File[];
}
async function generateArtsFromLayers(
  attributeCount: AttributeProps,
  artistWalletAddress: string,
  layersFiles: LayerFilesProps
) {
  await dbConnect();

  console.log("Inside generateArtsFromLayers");
  console.log(attributeCount);

  try {
    if (
      attributeCount.bg == 0 ||
      attributeCount.hair == 0 ||
      attributeCount.eyes == 0 ||
      attributeCount.nose == 0 ||
      attributeCount.mouth == 0 ||
      attributeCount.beard == 0 ||
      attributeCount.head == 0
    ) {
      // console.log("inside if");

      throw new Error(
        "You don't have any / insufficient layers uploaded, please upload layers to generate NFTs"
      );
    } else {
      // console.log("inside else");

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

      // NOTE - An artist can only generate 50 NFTs at a time
      let index = Math.min(possibleCombinations - 1, 1);
      const artist = await Artists.findOne({
        artistWalletAddress,
        /*
        above line equals to 
  
        artistWalletAddress : artistWalletAddress, 
        for example: artistWalletAddress: 0xA72e562f24515C060F36A2DA07e0442899D39d2c
        */
      });
      console.log("found artist");

      if (!artist) {
        return Response.json(
          {
            status: "error",
            message: "Artist not found",
          },
          {
            status: 404,
          }
        );
      }
      console.log("generating nfts");

      await generateNFT(index, artist.id, attributeCount, layersFiles);
      // NFTs generation successful, send acknowledgement
      return Response.json(
        {
          status: "success",
          message: "Your NFTs have been generated!",
        },
        {
          status: 200,
        }
      );
    }
  } catch (err) {
    console.error("🔴🔴🔴Error in generateArtsFromLayers:", err);
  }
}

// returns svg contents from a file
async function getContentsOfFile(file: File) {
  const reader = file.stream().getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const concatenated = new Uint8Array(
    chunks.reduce((acc, chunk) => acc + chunk.length, 0)
  );
  let offset = 0;
  for (const chunk of chunks) {
    concatenated.set(chunk, offset);
    offset += chunk.length;
  }
  const data = new TextDecoder().decode(concatenated);
  // console.log(data);

  return data;
}

function getLayers(imagesData: FormData) {
  const noseLayers: File[] = [];
  const headLayers: File[] = [];
  const mouthLayers: File[] = [];
  const bgLayers: File[] = [];
  const beardLayers: File[] = [];
  const eyesLayers: File[] = [];
  const hairLayers: File[] = [];

  imagesData.forEach((file) => {
    // @ts-ignore
    if (file.name.toString().startsWith("nose")) {
      noseLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("head")) {
      headLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("mouth")) {
      mouthLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("bg")) {
      bgLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("beard")) {
      beardLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("eyes")) {
      eyesLayers.push(file as File);
    }
    // @ts-ignore
    else if (file.name.toString().startsWith("hair")) {
      hairLayers.push(file as File);
    }
  });

  return {
    noseLayers,
    headLayers,
    mouthLayers,
    bgLayers,
    beardLayers,
    eyesLayers,
    hairLayers,
  };
}

export async function POST(req: Request, res: Response) {
  await dbConnect();
  //   uploadImages.array("images");
  const pinata = await getPinataClient();
  const imagesData = await req.formData();
  // Extracting params from url
  //  example url : http://localhost:3000/api/upload-images?artistWalletAddress=0xA72e562f24515C060F36A2DA07e0442899D39d2c
  // after split
  //  0 index - http://localhost:3000/api/upload-images
  //  1 index - artistWalletAddress=0xA72e562f24515C060F36A2DA07e0442899D39d2c
  // split 1 index : artistWalletAddress=0xA72e562f24515C060F36A2DA07e0442899D39d2c with "="
  // 0 index - artistWalletAddress
  // 1 index - 0xA72e562f24515C060F36A2DA07e0442899D39d2c
  const artistWalletAddress = req.url.split("?")[1].split("=")[1];
  // @NOTE - change this
  // console.log(`body : \n`, req.body);

  console.log(`artistWalletAddress\n`, artistWalletAddress);
  //   console.log(`req.files\n`, req.files);
  try {
    imagesData.forEach((image) => {
      // @ts-ignore
      if (image?.type !== "image/svg+xml") {
        // console.log("invalid file");
        throw new Error("Only SVG Files Allowed");
      }
      //   console.log(image);
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        errorData: err.message,
      },
      {
        status: 400,
      }
    );
  }

  const {
    noseLayers,
    headLayers,
    mouthLayers,
    bgLayers,
    beardLayers,
    eyesLayers,
    hairLayers,
  } = getLayers(imagesData);

  // console.log(`noseLayers`, noseLayers);
  // console.log(`headLayers`, headLayers);
  // console.log(`mouthLayers`, mouthLayers);
  // console.log(`bgLayers`, bgLayers);
  // console.log(`beardLayers`, beardLayers);
  // console.log(`eyesLayers`, eyesLayers);
  // console.log(`hairLayers`, hairLayers);

  const attributeCount = {
    bg: bgLayers.length,
    hair: hairLayers.length,
    eyes: eyesLayers.length,
    nose: noseLayers.length,
    mouth: mouthLayers.length,
    beard: beardLayers.length,
    head: headLayers.length,
  };

  // console.log(
  //   `Total files`,
  //   noseLayers.length +
  //     headLayers.length +
  //     mouthLayers.length +
  //     bgLayers.length +
  //     beardLayers.length +
  //     eyesLayers.length +
  //     hairLayers.length
  // );

  // getContentsOfFile(noseLayers[0]);
  //   console.log("here");

  generateArtsFromLayers(attributeCount, artistWalletAddress, {
    noseLayers,
    headLayers,
    mouthLayers,
    bgLayers,
    beardLayers,
    eyesLayers,
    hairLayers,
  });

  // console.log("------ FILES ------");

  // console.log(req.files);

  //   const files = JSON.parse(JSON.stringify(imagesData));
  //   console.log(files);

  // Upload multiple files
  //   let counter = 0;
  //   const filesToUpload = imagesData?.forEach((file: File) => {
  //     console.log(`Type of file`, typeof file);
  //     console.log(file);

  //     // return new File(Buffer.from(file), `${counter++}.json`);
  //   });
  //   console.log(`filesToUpload\n`, filesToUpload);

  // upload single file
  //   const fileToUpload = Readable.from(Buffer.from(files[0].buffer, "base64"));

  //   const pinResult = await pinata.pinFileToIPFS(fileToUpload, {
  //     pinataMetadata: {
  //       name: "Testing pins",
  //     },
  //     pinataOptions: {
  //       cidVersion: 0,
  //     },
  //   });

  // console.log("------ FILES  TO UPload------");
  //   console.log(pinResult);
  //   const ipfsHash = pinResult.IpfsHash; //IpfsHash

  // console.log(fileToUpload);

  return NextResponse.json(
    {
      message: "Uploaded to IPFS",
      //   imageURL: `ipfs://${ipfsHash}`,
    },
    {
      status: 200,
    }
  );
}

// const uploadNFTMetadataToIPFS = async (req: Request, res: Response) => {
//   try {
//     const pinata = await getPinataClient();

//     // console.log(req.body);

//     const { metadata, title } = req.body;
//     // console.log(metadata, title);

//     const parsedMetadata = JSON.parse(JSON.stringify(metadata));

//     // const pinResult = await pinata.pinJSONToIPFS({
//     //   parsedMetadata,
//     // },{
//     //   pinataMetadata: {
//     //     name: `Quest: ${title} metadata URI`
//     //     }
//     // },
//     // });

//     const pinResult = await pinata.pinJSONToIPFS(
//       {
//         ...parsedMetadata,
//       },
//       {
//         pinataMetadata: {
//           name: `Quest: "${title}" metadata URI`,
//         },
//       }
//     );

//     console.log(pinResult);
//     const ipfsHash = pinResult.IpfsHash; //IpfsHash
//     console.log(ipfsHash);

//     return res.status(200).json({
//       message: "success",
//       metadataURI: `ipfs://${ipfsHash}`,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(400).json({
//       message: "catch",
//     });
//   }
// };
