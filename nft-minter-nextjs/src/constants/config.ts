import { http, createConfig } from "wagmi";
import { polygonAmoy, polygon } from "wagmi/chains";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  injectedWallet,
  rainbowWallet,
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  safeWallet,
  phantomWallet,
  trustWallet,
  argentWallet,
  okxWallet,
  bifrostWallet,
} from "@rainbow-me/rainbowkit/wallets";

const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "";

const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        rainbowWallet,
        metaMaskWallet,
        safeWallet,
        injectedWallet,
        trustWallet,
        phantomWallet,
        argentWallet,
      ],
    },
  ],
  {
    appName: "Mintrrs",
    projectId,
    appDescription: "NFT Gen & Minting Platform",
  }
);

export const config = createConfig({
  chains: [polygonAmoy, polygon],
  transports: {
    [polygonAmoy.id]: http(),

    [polygon.id]: http(),
  },

  connectors,
});

export const supportedChains = [polygonAmoy.id, polygon.id];
