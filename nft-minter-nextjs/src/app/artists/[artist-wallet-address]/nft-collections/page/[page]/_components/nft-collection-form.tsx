import * as React from "react";
import { config, supportedChains } from "@/constants/config";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useState } from "react";
import ShimmerButton from "@/components/custom/buttons/shimmer-button";
import MovingGradient from "@/components/custom/buttons/moving-gradient";
import {
  writeContract,
  waitForTransactionReceipt,
  ConnectorNotConnectedError,
} from "@wagmi/core";
import { ContractFunctionExecutionError } from "viem";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

import { getContractFactory } from "@/lib/web3-utils/constants";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { parseEther } from "viem";

export default function NFTCollectionForm({
  basePrice,
  collectionIpfsLink,
}: {
  basePrice: number | string;
  collectionIpfsLink: string;
}) {
  const { chainId, address } = useAccount();
  const [tx, setTx] = useState<boolean>(false);
  const [collectionName, setCollectionName] = useState<string>("");
  const [collectionSymbol, setCollectionSymbol] = useState<string>("");

  async function deployArtistCollection({
    collectionIpfsLink,
    collectionName,
    collectionSymbol,
    basePrice,
  }: {
    collectionIpfsLink: string;
    collectionName: string;
    collectionSymbol: string;
    basePrice: string | number;
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
          abi: contractFactory.factoryAbi,
          address: contractFactory.factoryAddress as string as `0x${string}`,
          functionName: "createCollection",
          account: address,
          args: [
            `${collectionIpfsLink}/`,
            collectionName,
            collectionSymbol,
            parseEther(basePrice.toString()),
          ],
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
            `NFT Collection Created Successfully! (View Tx in your wallet for more info)`
          );
          const formData = new FormData();
          formData.append("artistWalletAddress", address);
          formData.append("contractAddress", txReceipt.logs[0].address);
          const res = await fetch(`/api/artists/update-collection-address`, {
            method: "PATCH",
            body: formData,
          });
          const data = await res.json();
          if (data.status === "success") {
            toast.success("NFT collection saved to DB successfully!");
            setTx(false);
            window.location.reload();
            return;
          }
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

  //   function onClick() {}

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <ShimmerButton
          btnText="Deploy Your Collection"
          className="lg:text-base text-sm break-words"
          onClick={() => {
            // @TODO : Deploy Collection on Chain
          }}
        />
      </DrawerTrigger>
      <DrawerContent className="bg-black/80 border-none text-white">
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle className="capitalize">
              Deploy your generated arts on chain
            </DrawerTitle>
            <DrawerDescription>
              You are one step away from going on-chain
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="my-3 h-[120px]">
              <Label className="text-white">Collection Name</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setCollectionName(e.target.value);
                }}
              />
              <Label className="text-white">Collection Symbol</Label>
              <Input
                type="text"
                onChange={(e) => {
                  setCollectionSymbol(e.target.value);
                }}
              />
            </div>
          </div>
          <DrawerFooter>
            <MovingGradient
              btnText={!tx ? "Submit" : "Deploying..."}
              disabled={tx}
              onClick={() => {
                if (
                  collectionName.length <= 0 ||
                  collectionSymbol.length <= 0
                ) {
                  toast.error("Collection Name and Symbol are required");
                  return;
                }

                deployArtistCollection({
                  basePrice,
                  collectionName,
                  collectionSymbol,
                  collectionIpfsLink,
                });
              }}
            />
            <DrawerClose asChild>
              <Button
                variant="default"
                className="bg-red-300 text-red-900 hover:bg-red-500 hover:text-white rounded-full"
              >
                Cancel
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
