"use client";

import Image from "next/image";
import React, { useState } from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import Link from "next/link";
import { ArtistNFTData, NFTImagesLinks } from "@/lib/interfaces";
import { Chain, ContractFunctionExecutionError, parseEther } from "viem";
import GradientButton from "../buttons/gradient";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { getContractFactory } from "@/lib/web3-utils/constants";
import {
  ConnectorNotConnectedError,
  waitForTransactionReceipt,
  writeContract,
} from "@wagmi/core";
import { config, supportedChains } from "@/constants/config";

export default function ShinyNFTCard({
  artistName,
  collectionAddress,
  nftMetadata,
  isDeployed,
}: {
  nftMetadata: NFTImagesLinks;
  artistName: string;
  collectionAddress: string;
  isDeployed: boolean;
}) {
  const [tx, setTx] = useState<boolean>(false);
  const { chainId, chain, address } = useAccount();
  async function mintFromArtistCollection({
    tokenId,
    collectionAddress,
  }: {
    tokenId: number | string;
    collectionAddress: string;
  }) {
    try {
      if (chainId === undefined) {
        toast.error("Chain not found!");
        return;
      }
      //   @ts-ignore
      if (!supportedChains.includes(chainId)) {
        toast.error("Chain not supported!");
        return;
      }
      setTx(true);
      const contractFactory = getContractFactory(chainId);
      if (contractFactory && address) {
        const hash = await writeContract(config, {
          abi: contractFactory.erc1155Abi,
          address: collectionAddress as string as `0x${string}`,
          functionName: "mintToSender",
          account: address,
          args: [tokenId],
          value: parseEther(nftMetadata.basePrice.toString()),
        });

        // console.log("================HASH===============");
        // console.log(hash);
        const txReceipt = await waitForTransactionReceipt(config, {
          hash,
        });
        // console.log("===========TX Receipt=============");
        // console.log(txReceipt);
        // console.log("====================================");
        // console.log("collection address ", txReceipt.logs[0].address);

        if (txReceipt.status === "success") {
          toast.success(
            `NFT Minted Successfully! Import your NFT to the wallet with information from the tx (View Tx in your wallet for more info)`
          );
          window.open(chain?.blockExplorers?.default.url + "/tx/" + hash);

          setTimeout(() => {}, 6000);

          setTx(false);
        } else {
          toast.error("NFT collection creation failed!");
          setTx(false);
          return;
        }
      }
    } catch (err) {
      setTx(false);
      console.log("====================================");
      console.log(err);
      console.log("====================================");

      if (err instanceof ConnectorNotConnectedError) {
        console.log("------------------------");

        console.log(err.cause);
        console.log("------------------------");
        console.log(err.message);
        console.log("------------------------");
        console.log(err.details);
        console.log("------------------------");
        console.log(err.shortMessage);
        console.log("------------------------");
        console.log(err.metaMessages);
        console.log("------------------------");
      }
      if (err instanceof ContractFunctionExecutionError) {
        // console.log("revert error");
        // console.log("------------------------");

        // console.log(err.cause);
        // console.log("------------------------");
        // console.log(err.message);
        // console.log("------------------------");
        // console.log(err.details);
        // console.log("------------------------");
        console.log(err.shortMessage);
        // console.log("------------------------");
        // console.log(err.metaMessages);
        // console.log("------------------------");

        toast.error(err.shortMessage);
      }
    }
  }
  return (
    <CardContainer className="inter-var">
      <CardBody className="relative group/card  hover:shadow-2xl hover:shadow-emerald-500/[0.1] bg-black border-white/[0.2] h-auto rounded-xl p-6 border  ">
        <CardItem
          translateZ="50"
          className="text-xl font-bold  text-white w-[full] flex items-center justify-between"
        >
          {nftMetadata.name}
          <span>#{nftMetadata.tokenId}</span>
        </CardItem>
        <CardItem
          as="p"
          translateZ="60"
          className=" text-sm max-w-sm mt-2 text-neutral-300"
        >
          {nftMetadata.description}
        </CardItem>
        <CardItem translateZ="100" className="w-full my-8">
          <Image
            src={nftMetadata.centralizedURL}
            height="100"
            width="100"
            className="w-[80%] h-full object-contain rounded-xl group-hover/card:shadow-xl mx-auto"
            alt={`${nftMetadata.name} by ${artistName}`}
          />
          {/* {nftMetadata.centralizedURL} */}
        </CardItem>
        <div className="flex justify-between items-center">
          {chain && isDeployed && (
            <>
              <CardItem
                translateZ={20}
                as={Link}
                href={`${chain?.blockExplorers?.default.url}/address/${collectionAddress}`}
                target="__blank"
                className="px-4 py-2 rounded-xl text-xs font-normal text-white"
              >
                <GradientButton btnText="View on Explorer" onClick={() => {}} />
              </CardItem>
              <CardItem
                translateZ={20}
                as="button"
                className="px-4 py-2 rounded-xl  bg-white text-black text-xs font-bold"
                onClick={() => {
                  mintFromArtistCollection({
                    tokenId: nftMetadata.tokenId,
                    collectionAddress: collectionAddress,
                  });
                }}
              >
                {!tx
                  ? `Mint for ${nftMetadata.basePrice} ${chain?.nativeCurrency.symbol}`
                  : "Minting..."}
              </CardItem>
            </>
          )}
        </div>
      </CardBody>
    </CardContainer>
  );
}
