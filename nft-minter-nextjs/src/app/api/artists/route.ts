import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Artists from "@/app/models/Artists";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const artists = await Artists.find();

    return NextResponse.json(
      {
        message: "success",
        artists,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    // @ts-ignore
    console.log("🔴", err.message);

    return NextResponse.json(
      {
        message: "error",
        // @ts-ignore
        errorData: `🔴 🔴 ${err.message}`,
      },
      {
        status: 400,
      }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.formData();
    const artistName = data.get("artistName") as unknown as string;
    const artistWalletAddress = data.get(
      "artistWalletAddress"
    ) as unknown as string;
    const collectionsAddresses = data.get(
      "collectionsAddresses"
    ) as unknown as string;

    // console.log(data);

    console.log(artistName, artistWalletAddress, collectionsAddresses);
    // Save the collection details to MongoDB
    const collection = new Artists({
      artistName: artistName,
      artistWalletAddress: artistWalletAddress,
      collectionsAddresses: collectionsAddresses,
    });
    await collection.save();

    return NextResponse.json(
      {
        message: "Artist saved to DB!",
        collection,
      },
      {
        status: 200,
      }
    );
  } catch (err: any) {
    console.log("🔴", err.message);

    return NextResponse.json(
      {
        message: "error",
        errorData: `🔴 🔴 ${err.message}`,
      },
      {
        status: 400,
      }
    );
  }
}
