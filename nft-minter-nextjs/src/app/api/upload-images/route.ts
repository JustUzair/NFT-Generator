import { getPinataClient } from "@/lib/utils";
import multer from "multer";
import { NextApiRequest, PageConfig } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
import { Request as ExpressRequest } from "express";
import * as nc from "next-connect";
import fs from "fs";
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

async function generateArtsFromLayers() {}
function getLayers(imagesData: FormData) {
  const noseLayers: File[] = [];
  const faceLayers: File[] = [];
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
    else if (file.name.toString().startsWith("face")) {
      faceLayers.push(file as File);
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
    faceLayers,
    mouthLayers,
    bgLayers,
    beardLayers,
    eyesLayers,
    hairLayers,
  };
}
export async function POST(req: Request, res: Response) {
  //   uploadImages.array("images");
  const pinata = await getPinataClient();
  const imagesData = await req.formData();
  //   console.log(`imagesData\n`, imagesData);
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
    faceLayers,
    mouthLayers,
    bgLayers,
    beardLayers,
    eyesLayers,
    hairLayers,
  } = getLayers(imagesData);
  console.log(`noseLayers`, noseLayers);
  console.log(`faceLayers`, faceLayers);
  console.log(`mouthLayers`, mouthLayers);
  console.log(`bgLayers`, bgLayers);
  console.log(`beardLayers`, beardLayers);
  console.log(`eyesLayers`, eyesLayers);
  console.log(`hairLayers`, hairLayers);

  console.log(
    `Total files`,
    noseLayers.length +
      faceLayers.length +
      mouthLayers.length +
      bgLayers.length +
      beardLayers.length +
      eyesLayers.length +
      hairLayers.length
  );

  //   console.log("here");

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
