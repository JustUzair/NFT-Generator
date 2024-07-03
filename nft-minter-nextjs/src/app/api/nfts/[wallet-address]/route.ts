import Artists from "@/app/models/Artists";
import NFTImages from "@/app/models/NFTImages";
import { dbConnect } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>
  try {
    await dbConnect();
    const artistWalletAddress: string = context.params["wallet-address"];
    console.log(`context : `, context);
    // console.log(`req : `, req.nextUrl.searchParams.get("name"));
    // console.log(`req : `);

    console.log(`wallet - address : `, artistWalletAddress);

    const artist = await Artists.findOne({
      artistWalletAddress,
      /*
        above line equals to 
  
        artistWalletAddress : artistWalletAddress, 
        for example: artistWalletAddress: 0xA72e562f24515C060F36A2DA07e0442899D39d2c
        */
    });
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
    // console.log(artist);
    const artistImages = await NFTImages.findOne({
      artist: artist._id,
    }).populate("artist");

    if (!artistImages) {
      return NextResponse.json(
        {
          message: "error",
          errorData: `No NFTs found for the artist`,
        },
        {
          status: 404,
        }
      );
    }
    return NextResponse.json(
      {
        message: "success",
        artistData: artistImages,
      },
      {
        status: 200,
      }
    );
  } catch (err) {
    console.log("🔴", err);
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
