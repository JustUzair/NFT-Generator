"use client";

// TODO : create a paginated api url for fetching artist nft collections
import { supportedChains } from "@/constants/config";
import { getArtistByWalletAddress } from "@/lib/api-function-utils";
import { useRouter } from "next/navigation";
import React, { use, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import Error from "@/components/errors/error";
import Warning from "@/components/errors/warning";
import { Artist, ArtistNFTData } from "@/lib/interfaces";

const ArtistNFTPage = ({
  params,
}: {
  params: { "artist-wallet-address": string; page: string };
}) => {
  // console.log("====================================");
  // console.log("Artist wallet address \n", params);
  // console.log("====================================");
  const artistAddress = params["artist-wallet-address"].toString() as string;
  const { address, chainId, chain } = useAccount();
  const currentPage = parseInt(params.page, 10);
  const [totalPages, setTotalPages] = useState(0);
  const [artistData, setArtistData] = useState<Artist>({
    _id: "",
    artistName: "",
    artistWalletAddress: "",
    nftCollection: {
      chainId: 0,
      contractAddress: "",
    },
    pfp: {
      decentralizedURL: "",
      url: "",
    },
  });
  const [artistNFTData, setArtistNFTData] = useState<ArtistNFTData | null>(
    null
  );
  async function getData() {
    const artistData = await getArtistByWalletAddress(artistAddress);
    // console.log("====================================");
    // console.log(artistData);
    // console.log("====================================");
    setArtistData(artistData);
  }
  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    if (address) fetchArtistsWithNFT(currentPage);
  }, [currentPage, address]);

  const fetchArtistsWithNFT = async (page: number) => {
    try {
      const res = await fetch(`/api/nfts/${address}?page=${page}&limit=12`);
      const data = await res.json();
      setArtistNFTData(data.artistNFTData);
      setTotalPages(data.pagination.totalPages);
      console.log("====================================");
      console.log(data);
      console.log("====================================");
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast.error("Error fetching artists");
    }
  };

  if (
    artistAddress == null ||
    artistAddress == "" ||
    artistAddress.length != 42
  ) {
    return <Error message="Invalid Artist Address" />;
  }

  //   @ts-ignore
  if (chainId && !supportedChains.includes(chainId)) {
    return <Error message="Please connect to the supported network" />;
  }
  if (!chain || !chainId) {
    toast.warning(
      "No Network Connected, Please connect to a network and try again. "
    );
    return (
      <div className="mt-30">
        <Warning message="No Network Connected, Please connect to a network and try again. " />
      </div>
    );
  }
  if (
    !artistData ||
    (artistData && !(artistData.artistWalletAddress == address))
  ) {
    // console.log("====================================");
    // console.log("here");
    // console.log("====================================");
    return (
      <div className="mt-30">
        <Error message="You are probably not registered as an artist!" />
      </div>
    );
  }

  if (
    !artistData.nftCollection ||
    (artistData.nftCollection &&
      artistData.nftCollection.contractAddress == null) ||
    artistData.nftCollection.contractAddress == "" ||
    artistData.nftCollection.contractAddress.length != 42
  ) {
    return <Error message="No Collection has been deployed by th artist" />;
  } else return <div className="mt-32">Aritst</div>;
};
export default ArtistNFTPage;
