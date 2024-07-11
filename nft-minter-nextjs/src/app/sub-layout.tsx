"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { WagmiProvider } from "wagmi";
import Navbar from "@/components/navbar";
type Props = {
  children: React.ReactNode;
};
import { config } from "@/constants/config";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

const SubLayout = ({ children }: Props) => {
  const queryClient = new QueryClient();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  if (isLoaded)
    return (
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <div className="h-full min-h-[100vh] w-full bg-black  bg-grid-white/[0.1] relative">
              {/* Radial gradient for the container to give a faded look */}
              <div className="absolute pointer-events-none inset-0 flex items-center justify-center bg-black [mask-image:radial-gradient(ellipse_at_center,transparent_50%,black)]"></div>

              <Navbar />
              <div className="pt-32 px-10 !mx-auto w-[80vw] !z-[9999999999]">
                {children}
              </div>
            </div>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    );
};

export default SubLayout;
