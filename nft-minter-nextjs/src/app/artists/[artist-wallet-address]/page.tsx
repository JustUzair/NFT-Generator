"use client";
import { supportedChains } from "@/constants/config";
import { getArtistByWalletAddress } from "@/lib/api-function-utils";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";
import Error from "@/components/errors/error";
import Warning from "@/components/errors/warning";

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

const ArtistNFTPage = ({ params }: any) => {
  const artistAddress = params["artist-wallet-address"].toString() as string;
  const { address, chainId, chain } = useAccount();
  const [artistData, setArtistData] = React.useState<Artist>({
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
    return <Error message="No Colletion has been deployed by th artist" />;
  }
  return <div className="mt-32">Aritst</div>;
};
export default ArtistNFTPage;
