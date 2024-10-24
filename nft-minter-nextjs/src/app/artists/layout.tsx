"use client";
import Error from "@/components/errors/error";
import Warning from "@/components/errors/warning";
import { supportedChains } from "@/constants/config";
import React from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

type Props = {
  children: React.ReactNode;
};

const ArtistsLayout = ({ children }: Props) => {
  const { address, chainId, chain } = useAccount();
  if (
    chainId &&
    !supportedChains.includes(chainId as 137 | 80002 | 1 | 11155111)
  )
    return <Error message="Please connect to the supported network" />;
  if (!chain || !chainId) {
    toast.warning(
      "No Network Connected, Please connect to a network and try again. "
    );
    return (
      <Warning message="No Network Connected, Please connect to a network and try again. " />
    );
  }

  if (chainId && chain && address) return <div>{children}</div>;
};

export default ArtistsLayout;
