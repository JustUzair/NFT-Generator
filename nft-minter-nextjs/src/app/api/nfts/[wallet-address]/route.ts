import Artists from "@/app/models/Artists";
import NFTImages from "@/app/models/NFTImages";
import { dbConnect } from "@/lib/db";
import { PaginatedResponse, PaginationInfo } from "@/lib/interfaces";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: any) {
  try {
    await dbConnect();
    const artistWalletAddress: string = context.params["wallet-address"];

    const page = parseInt(req.nextUrl.searchParams.get("page") || "1");
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");

    const artist = await Artists.findOne({ artistWalletAddress });
    if (!artist) {
      return NextResponse.json(
        {
          message: "error",
          errorData: "No artist found with the wallet address",
        },
        { status: 404 }
      );
    }

    const artistImages = await NFTImages.findOne({
      artist: artist._id,
    }).populate("artist");

    if (!artistImages) {
      return NextResponse.json(
        { message: "error", errorData: "No NFTs found for the artist" },
        { status: 404 }
      );
    }

    // Paginate the nftImagesLinks array
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const paginatedNFTImages = artistImages.nftImagesLinks.slice(
      startIndex,
      endIndex
    );

    const totalItems = artistImages.nftImagesLinks.length;
    const totalPages = Math.ceil(totalItems / limit);

    const paginationInfo: PaginationInfo = {
      currentPage: page,
      totalPages: totalPages,
      totalItems: totalItems,
      itemsPerPage: limit,
    };

    if (endIndex < totalItems) {
      paginationInfo.nextPage = page + 1;
    }

    if (startIndex > 0) {
      paginationInfo.previousPage = page - 1;
    }

    const paginatedResponse: PaginatedResponse = {
      message: "success",
      artistNFTData: {
        ...artistImages.toObject(),
        nftImagesLinks: paginatedNFTImages,
      },
      pagination: paginationInfo,
    };

    return NextResponse.json(paginatedResponse, { status: 200 });
  } catch (err) {
    console.log("🔴", err);
    return NextResponse.json(
      {
        message: "error",
        errorData: `🔴 🔴 ${
          err instanceof Error ? err.message : "Unknown error"
        }`,
      },
      { status: 400 }
    );
  }
}
