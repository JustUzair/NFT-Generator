"use client";
import React from "react";
import { BackgroundGradient } from "@/components/ui/background-gradient";
import { IconAppWindow } from "@tabler/icons-react";
import Image from "next/image";
import Link from "next/link";
import ShimmerButton from "@/components/custom/buttons/shimmer-button";
import { useRouter } from "next/navigation";
import GradientButton from "../buttons/gradient";
import { useAccount } from "wagmi";
import { cn } from "@/lib/utils";
import { Artist } from "@/lib/interfaces";

export default function ArtistGradientCard({
  artist,
  className,
}: {
  artist: Artist;
  className: string;
}) {
  const router = useRouter();
  const { chain } = useAccount();

  return (
    <div className={`h-full w-full flex`}>
      <BackgroundGradient
        className={cn(
          "rounded-[22px] p-4 sm:p-10 bg-neutral-950 h-full w-full flex flex-col justify-between items-center"
        )}
        containerClassName={className}
      >
        <div className="flex-grow flex items-center flex-col justify-center">
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
                router.push(
                  `/artists/${artist.artistWalletAddress}/nft-collections/page/1`
                );
              }}
            >
              {artist.artistName}
            </span>
          </p>
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
            onClickHandler={() => {
              router.push(
                `/artists/${artist.artistWalletAddress}/nft-collections/page/1`
              );
            }}
          />
        </div>
      </BackgroundGradient>
    </div>
  );
}
