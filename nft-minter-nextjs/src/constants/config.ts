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
} from "@rainbow-me/rainbowkit/wallets";

const projectId = "cd5fb49ae0a10deaae3b571887513d7a";

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
        okxWallet,
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
