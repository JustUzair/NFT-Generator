import Artists from "@/app/models/Artists";
import { dbConnect } from "@/lib/db";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: Request, context: any) {
  try {
    await dbConnect();
    const artistWalletAddress: string = context.params["wallet-address"];
    // console.log(`context : `, context);
    // console.log(`wallet - address : `, artistWalletAddress);

    const artist = await Artists.findOne({
      artistWalletAddress,
      /*
      above line equals to 

      artistWalletAddress : artistWalletAddress, 
      for example: artistWalletAddress: 0xA72e562f24515C060F36A2DA07e0442899D39d2c
      */
    });
    console.log(artist);

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
    return NextResponse.json(
      {
        message: "success",
        artist,
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
