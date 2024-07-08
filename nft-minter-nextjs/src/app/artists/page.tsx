"use client";
import GradientButton from "@/components/custom/buttons/gradient";
import GradientCard from "@/components/custom/cards/gradient-card";
import { useState, useEffect } from "react";

interface IArtistCollection {
  chainId: number;
  contractAddress: string;
}

interface Artist {
  _id: string;
  artistName: string;
  artistWalletAddress: string;
  nftCollection: IArtistCollection;
  pfp: {
    decentralizedURL: string;
    url: string;
  };
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchArtists(currentPage);
  }, [currentPage]);

  const fetchArtists = async (page: number) => {
    try {
      const res = await fetch(`/api/artists?page=${page}&limit=12`);
      const data = await res.json();
      setArtists(data.artists);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };

  const getCardSize = (index: number) => {
    const sizes = [
      "row-span-[1.5] col-span-1",
      "row-span-1 col-span-2",
      "row-span-[1.5] col-span-2",
      // "row-span-[1.5] col-span-2",
      // "row-span-2 col-span-1",

      // "col-span-1 row-span-2",
      // "col-span-1 row-span-1",
      // "col-span-2 row-span-2",
      // "col-span-1 row-span-1",
      // "col-span-1 row-span-2",
      // "col-span-2 row-span-1",
      // "col-span-1 row-span-1",
      // "col-span-1 row-span-1",
      // "col-span-1 row-span-1",
      // "col-span-1 row-span-1",
    ];
    return sizes[index % sizes.length];
  };

  return (
    <div className="max-w-[85%] mx-auto">
      <div className="grid grid-cols-3 grid-rows-auto w-full gap-10 pb-20 mx-auto">
        {artists.map((artist, index) => (
          <div key={artist._id} className={`${getCardSize(index)}`}>
            <GradientCard artist={artist} className="" />
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-x-10 w-full max-w-6xl pb-10">
        {currentPage > 1 && (
          <GradientButton
            onClick={() => setCurrentPage(currentPage - 1)}
            btnText="Previous"
            className="w-40"
          />
        )}
        {currentPage < totalPages && (
          <GradientButton
            onClick={() => setCurrentPage(currentPage + 1)}
            btnText="Next"
            className="w-40"
          />
        )}
      </div>
    </div>
  );
}
