import Artists from "@/app/models/Artists";
import { dbConnect } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(req: NextRequest, context: any, res: NextResponse) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>

  try {
    await dbConnect();
    // console.log("triggering in ");
    console.log("====================================");
    console.log(context.params);
    console.log("====================================");
    const data = await req.formData();
    const artistWalletAddress = data.get(
      "artistWalletAddress"
    ) as unknown as string;

    const contractAddress = data.get("contractAddress") as unknown as string;

    // console.log(data);
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
    const updatedArtist = await Artists.findOneAndUpdate(
      {
        artistWalletAddress,
      },
      {
        nftCollection: {
          contractAddress,
        },
      }
    );

    await updatedArtist.save();

    return NextResponse.json(
      {
        status: "success",
        message: "Contract Address saved!",
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
