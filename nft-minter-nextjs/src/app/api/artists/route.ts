import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "../../../lib/db";
import Artists from "../../models/Artists";
import NFTImages from "@/app/models/NFTImages";
import mongoose, { ObjectId } from "mongoose";
import { IArtistCollection } from "@/lib/interfaces";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // console.log(
    //   "Total documents:",
    //   await Artists.countDocuments({ active: true })
    // );
    // console.log("Page:", page);
    // console.log("Limit:", limit);
    // console.log("Skip:", skip);
    // console.log(page, limit);

    const artists = await Artists.find({ active: true })
      .sort({ _id: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Artists.countDocuments({ active: true });

    return NextResponse.json(
      {
        artists: artists,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.log((error as any).message);

    return NextResponse.json(
      { error: "Unable to fetch artists and arts" },
      {
        status: 500,
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
    const collectionData = data.get(
      "nftCollection"
    ) as unknown as IArtistCollection;

    // console.log(data);

    console.log(artistName, artistWalletAddress, collectionData);
    // Save the collection details to MongoDB
    const newArtist = new Artists({
      artistName: artistName,
      artistWalletAddress: artistWalletAddress,
      nftCollection: collectionData,
    });
    await newArtist.save();

    return NextResponse.json(
      {
        message: "Artist saved to DB!",
        artist: newArtist,
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
