"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { WagmiProvider } from "wagmi";
import Navbar from "@/components/navbar";
type Props = {
  children: React.ReactNode;
};
import { config } from "@/constants/config";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const SubLayout = ({ children }: Props) => {
  const queryClient = new QueryClient();

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div>
            <Navbar />
            {children}
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default SubLayout;
