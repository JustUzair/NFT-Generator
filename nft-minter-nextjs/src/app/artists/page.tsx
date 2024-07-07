"use client";
import GradientButton from "@/components/custom/buttons/gradient";
import GradientCard from "@/components/custom/cards/gradient-card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
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
  const [artists, setArtists] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    fetchArtists(currentPage);
  }, [currentPage]);

  const fetchArtists = async (page: number) => {
    try {
      const res = await fetch(`/api/artists?page=${page}&limit=9`);
      const data = await res.json();
      setArtists(data.artists);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching artists:", error);
    }
  };
  console.log("====================================");
  console.log(artists);
  console.log("====================================");
  return (
    <div className="max-w-[85%] mx-auto">
      <div className="text-white lg:grid lg:grid-cols-3 gap-x-32 gap-y-10 flex items-center justify-center flex-wrap pb-20">
        {artists.map((artist: Artist) => (
          <div key={artist._id}>
            {/* <Image src={artist.pfp.url} alt="" width={100} height={100} />
            <h2>{artist?.artistName}</h2>
            <p>Wallet Address: {artist.artistWalletAddress}</p> */}
            <GradientCard artist={artist} />
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
