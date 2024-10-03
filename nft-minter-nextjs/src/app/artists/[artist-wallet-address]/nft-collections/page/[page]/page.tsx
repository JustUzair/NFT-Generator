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
import ShinyNFTCard from "@/components/custom/cards/shiny-nft-card";
import GradientButton from "@/components/custom/buttons/gradient";
import NFTCollectionForm from "./_components/nft-collection-form";
import Loader from "@/components/loader";

const ArtistNFTPage = ({
  params,
}: {
  params: { "artist-wallet-address": string; page: string };
}) => {
  const router = useRouter();
  const artistAddress = params["artist-wallet-address"].toString() as string;
  const { address, chainId, chain } = useAccount();
  const currentPage = parseInt(params.page, 10);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
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
    console.log("====================================");
    console.log(artistData);
    console.log("====================================");
    setArtistData(artistData);
  }
  useEffect(() => {
    getData();
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (address) fetchArtistsWithNFT(currentPage);
  }, [currentPage, address]);

  useEffect(() => {
    console.log("====================================");
    console.log(`artistNFTData\n`, artistNFTData);
    console.log("====================================");
  }, [artistNFTData, address]);
  const fetchArtistsWithNFT = async (page: number) => {
    try {
      const res = await fetch(
        `/api/nfts/${artistAddress}?page=${page}&limit=12`
      );
      const data = await res.json();
      if (data.message === "success") {
        setArtistNFTData(data.artistNFTData);
        setTotalPages(data.pagination.totalPages);
        // console.log("====================================");
        // console.log(data);
        // console.log("====================================");
      } else {
        // console.log("============ERROR================");
        // console.log(data);
        // console.log("====================================");
        toast.error(data.errorData);
      }
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast.error("Error fetching artists");
    }
  };
  if (!isLoaded) return <Loader />;

  if (isLoaded) {
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
    if (!artistData) {
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
      isLoaded &&
      artistAddress == address &&
      (!artistNFTData || artistNFTData?.nftImagesLinks.length == 0)
    ) {
      // console.log("====================================");
      // console.log("here");
      // console.log("====================================");
      return (
        <div className="mt-30">
          <Warning message="You haven't generated the arts yet, generate to take them on-chain" />
        </div>
      );
    }

    if (artistNFTData && artistData.nftCollection.chainId == chainId)
      return (
        <div className="mt-20 max-w-[85%] mx-auto">
          <h1 className="tracking-widest text-center font-semibold text-4xl text-purple-500">
            {/* {artistAddress == address && artistNFTData == null && (
            <div className="z-[9999999] border-2 border-white bg-purple-700 rounded-xl lg:px-10 lg:py-4 p-2 text-white tracking-widest text-xl flex items-center justify-around lg:w-[60%] flex-wrap w-[100%] mx-auto">
              <h1>{""}</h1>
            </div>
          )} */}
            {((artistData && !artistData.nftCollection.contractAddress) ||
              artistData.nftCollection.contractAddress.length != 42) &&
              artistData.artistWalletAddress === address &&
              artistNFTData &&
              artistNFTData?.nftImagesLinks?.length > 0 &&
              isLoaded && (
                <div className="z-[9999999] border-2 border-white bg-purple-700 rounded-xl lg:px-10 lg:py-4 p-2 text-white tracking-widest text-xl flex items-center justify-around lg:w-[60%] flex-wrap w-[100%] mx-auto">
                  <h1>Your collection is not on chain yet.</h1>
                  <NFTCollectionForm
                    basePrice={"0.005"}
                    collectionIpfsLink={artistNFTData?.collectionIPFSLink || ""}
                  />
                </div>
              )}

            {((artistData && !artistData.nftCollection.contractAddress) ||
              artistData.nftCollection.contractAddress.length != 42) &&
              artistData.artistWalletAddress !== address &&
              isLoaded && (
                <div className="z-[9999999] border-2 border-white bg-purple-700 rounded-xl lg:px-10 lg:py-4 p-2 text-white tracking-widest text-xl flex items-center justify-around lg:w-[60%] flex-wrap w-[100%] mx-auto">
                  <h1>No collection has yet been deployed by the artist</h1>
                </div>
              )}
          </h1>
          <div className="mt-20 lg:grid lg:grid-cols-3 flex flex-col items-center justify-between gap-x-4 gap-y-10">
            {artistNFTData?.nftImagesLinks.map((imageItem) => {
              return (
                <ShinyNFTCard
                  nftMetadata={imageItem}
                  artistName={artistData.artistName}
                  collectionAddress={artistData.nftCollection.contractAddress}
                  isDeployed={
                    !(
                      (artistData &&
                        !artistData.nftCollection.contractAddress) ||
                      artistData.nftCollection.contractAddress.length != 42
                    )
                  }
                  key={imageItem.tokenId}
                />
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-x-10 w-full max-w-6xl pb-10 mt-20 mx-auto">
            {currentPage > 1 && (
              <GradientButton
                onClick={() => {
                  router.push(
                    `/artists/${artistAddress}/nft-collections/page/${
                      currentPage - 1
                    }`
                  );
                }}
                btnText="Previous"
                className="w-40"
                key={`/artists/${artistAddress}/nft-collections/page/${
                  currentPage - 1
                }`}
              />
            )}
            {currentPage < totalPages && (
              <GradientButton
                onClick={() => {
                  router.push(
                    `/artists/${artistAddress}/nft-collections/page/${
                      currentPage + 1
                    }`
                  );
                }}
                btnText="Next"
                className="w-40"
                key={`/artists/${artistAddress}/nft-collections/page/${
                  currentPage + 1
                }`}
              />
            )}
          </div>
        </div>
      );
  }
};
export default ArtistNFTPage;
