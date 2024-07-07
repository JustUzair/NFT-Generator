"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { IconAppWindow } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import ShimmerButton from "../buttons/shimmer-button";
import { useRouter } from "next/navigation";
import GradientButton from "../buttons/gradient";
import { useAccount } from "wagmi";

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
export default function ArtistGradientCard({ artist }: { artist: Artist }) {
  const router = useRouter();
  const { chain } = useAccount();
  console.log("====================================");
  console.log(chain?.blockExplorers?.default.url);
  console.log("====================================");
  return (
    <div>
      <BackgroundGradient className="rounded-[22px] max-w-sm p-4 sm:p-10  bg-neutral-950">
        <Image
          src={artist.pfp.url}
          alt={artist.artistName}
          height="100"
          width="100"
          className="object-contain rounded-full mx-auto"
        />
        <p className="text-base sm:text-xl mt-4 mb-2 text-neutral-200 text-center font-extralight tracking-tight">
          Creator Tag :{" "}
          <span
            className="cursor-pointer hover:underline transition-all duration-150 !tracking-widest !font-semibold"
            onClick={() => {
              router.push(`/artists/${artist.artistWalletAddress}`);
            }}
          >
            {artist.artistName}
          </span>
        </p>

        {/* <p className="text-sm  text-neutral-400">
          {artist.artistWalletAddress}
        </p> */}
        {artist.nftCollection &&
          artist.nftCollection.contractAddress != null &&
          artist.nftCollection.contractAddress != "" &&
          artist.nftCollection.contractAddress.length == 42 && (
            <GradientButton
              btnText="View on Block Explorer"
              onClick={() => {
                window.open(
                  `${chain?.blockExplorers?.default.url}/address/${artist.nftCollection.contractAddress}`
                );
              }}
            />
          )}

        <ShimmerButton
          className="mt-4 mx-auto flex items-center justify-center"
          btnText="View NFTs"
          onClick={() => {
            router.push(`/artists/${artist.artistWalletAddress}`);
          }}
        />
      </BackgroundGradient>
    </div>
  );
}
