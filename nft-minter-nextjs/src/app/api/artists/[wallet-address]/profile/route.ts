import Artists from "@/app/models/Artists";
import { getPinataClient } from "@/lib/api-utils";
import { dbConnect } from "@/lib/db";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";
export async function POST(req: NextRequest, context: any) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>
  try {
    await dbConnect();
    const pinata = await getPinataClient();
    const artistWalletAddress: string = context.params["wallet-address"];
    const formData = await req.formData();
    const pfpImage = formData.get("pfp-image") as File;
    const artistName = formData.get("artistName");

    console.log("====================================");
    console.log(artistName);
    console.log("====================================");
    const artist = await Artists.findOne({
      artistWalletAddress,
    });
    // console.log(artist);

    if (!artist) {
      return NextResponse.json(
        {
          message: "error",
          // @ts-ignore
          errorData: `No artist found with the wallet address`,
        },
        {
          status: 404,
        }
      );
    }
    let pinResult;
    if (pfpImage) {
      pinResult = await pinata.pinFileToIPFS(
        Readable.from(Buffer.from(await pfpImage.arrayBuffer())),
        {
          pinataMetadata: {
            name: `PFP ${artist._id} : ${artist.artistName}`,
          },
          pinataOptions: {
            cidVersion: 0,
          },
        }
      );
    }
    console.log("====================================");
    console.log("🟢", pinResult);
    console.log("====================================");
    const updatedArtist = await Artists.findOneAndUpdate(
      {
        artistWalletAddress,
      },
      {
        pfp:
          pfpImage && pinResult
            ? {
                decentralizedURL: `ipfs://${pinResult.IpfsHash}`,
                url: `https://ipfs.io/ipfs/${pinResult.IpfsHash}`,
              }
            : artist.pfp,
        artistName: artistName ? artistName : artist.artistName,
      }
    );
    return NextResponse.json(
      {
        message: "success",
        artist: updatedArtist,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("🔴", err);
    // @ts-ignore
    // console.log("🔴", err.message);

    return NextResponse.json(
      {
        message: "error",
        // @ts-ignore
        errorData: `${err.message}`,
      },
      {
        status: 400,
      }
    );
  }
}
