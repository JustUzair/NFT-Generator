"use client";
import { supportedChains } from "@/constants/config";
import React from "react";
import { useAccount } from "wagmi";

type Props = {
  children: React.ReactNode;
};

const ArtistsLayout = ({ children }: Props) => {
  const { address, chainId, chain } = useAccount();

  if (!chain || !chainId) {
    return <div>No Network Connected </div>;
  }
  if (chainId && !supportedChains.includes(chainId as any))
    return <div>Please connect to the supported network</div>;
  return <div>{children}</div>;
};

export default ArtistsLayout;
