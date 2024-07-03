import Artists from "@/app/models/Artists";
import { dbConnect } from "@/lib/db";
import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>
  try {
    await dbConnect();
    const artistWalletAddress: string = context.params["wallet-address"];
    // console.log(`context : `, context);
    // console.log(`req : `, req.nextUrl.searchParams.get("name"));
    // console.log(`req : `);

    // console.log(`wallet - address : `, artistWalletAddress);

    const artist = await Artists.findOne({
      artistWalletAddress,
      /*
      above line equals to 

      artistWalletAddress : artistWalletAddress, 
      for example: artistWalletAddress: 0xA72e562f24515C060F36A2DA07e0442899D39d2c
      */
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
export async function PATCH(req: NextRequest, context: any, res: NextResponse) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>

  try {
    await dbConnect();
    console.log("triggering in ");

    const data = await req.formData();
    const artistName = data.get("artistName") as unknown as string;
    const artistWalletAddress: string = context.params["wallet-address"];

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
        artistName,
      }
    );

    await updatedArtist.save();

    return NextResponse.json(
      {
        status: "success",
        message: "Artist data updated!",
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

export async function DELETE(
  req: NextRequest,
  context: any,
  res: NextResponse
) {
  // URL Structure - http://localhost:3000/api/artists/<wallet-address>

  try {
    await dbConnect();
    const artistWalletAddress: string = context.params["wallet-address"];

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
        active: false,
      }
    );

    await updatedArtist.save();

    return NextResponse.json(
      {
        status: "success",
        message: "Artist deleted!",
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
