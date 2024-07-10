import Artists from "@/app/models/Artists";
import { getPinataClient } from "@/lib/api-utils";
import { dbConnect } from "@/lib/db";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

export async function POST(req: NextRequest, context: any) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>
  try {
    await dbConnect(); // Connect to MongoDB

    const pinata = await getPinataClient(); // Get Pinata client for IPFS

    const formData = await req.formData(); // Parse form data
    const pfpImage = formData.get("pfp-image") as File; // Get profile picture
    const artistName = formData.get("artistName") as string; // Get artist name
    const artistWalletAddress = formData.get("artistWalletAddress") as string; // Get wallet address

    // Check if the artist already exists
    let artist = await Artists.findOne({ artistWalletAddress });

    if (artist) {
      return NextResponse.json(
        { message: "error", errorData: "Artist already exists" },
        {
          status: 400,
        }
      );
    }

    // Pin profile picture to IPFS if provided
    let pinResult;
    if (pfpImage) {
      pinResult = await pinata.pinFileToIPFS(
        Readable.from(Buffer.from(await pfpImage.arrayBuffer())),
        {
          pinataMetadata: {
            name: `PFP ${artistName}`, // Adjust metadata as needed
          },
          pinataOptions: {
            cidVersion: 0,
          },
        }
      );
    }

    // Create new artist object
    artist = new Artists({
      artistWalletAddress,
      artistName,
      pfp: {
        decentralizedURL: pinResult ? `ipfs://${pinResult.IpfsHash}` : "", // IPFS decentralized URL
        url: pinResult ? `https://ipfs.io/ipfs/${pinResult.IpfsHash}` : "", // IPFS gateway URL
      },
    });

    // Save artist to database
    await artist.save();

    return NextResponse.json(
      { message: "success", artist },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error registering artist:", error);
    return NextResponse.json(
      {
        message: "error",
        // @ts-ignore
        errorData: error.message,
      },
      {
        status: 400,
      }
    );
  }
}
