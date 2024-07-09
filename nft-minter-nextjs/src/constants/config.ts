const projectId = process.env.NEXT_PUBLIC_RAINBOWKIT_PROJECT_ID || "";
import {
  mainnet,
  optimismSepolia,
  optimism,
  base,
  baseSepolia,
  sepolia,
  polygonAmoy,
  polygon,
} from "wagmi/chains";
import { http } from "wagmi";
import { createConfig } from "@wagmi/core";
import {
  rainbowWallet,
  metaMaskWallet,
  safeWallet,
  injectedWallet,
  trustWallet,
  phantomWallet,
} from "@rainbow-me/rainbowkit/wallets";

import { connectorsForWallets } from "@rainbow-me/rainbowkit";

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
      ],
    },
  ],
  {
    projectId,
    appName: "Mintrrs",
    appDescription: "Mintrrs",
  }
);

export const config = createConfig({
  chains: [
    // mainnet,
    // optimism,
    // base,
    polygon,
    /*  sepolia,
    optimismSepolia,
    baseSepolia, */
    polygonAmoy,
  ],
  transports: {
    // [mainnet.id]: http(),
    // [optimism.id]: http(),
    // [base.id]: http(),
    [polygon.id]: http(),
    // [sepolia.id]: http(),
    // [optimismSepolia.id]: http(),
    // [baseSepolia.id]: http(),
    [polygonAmoy.id]: http(),
  },

  connectors,
});

export const supportedChains = [
  // mainnet.id,
  // optimism.id,
  // base.id,
  polygon.id,
  // sepolia.id,
  // optimismSepolia.id,
  // baseSepolia.id,
  polygonAmoy.id,
];
