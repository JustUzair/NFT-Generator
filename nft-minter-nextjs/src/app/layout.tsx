import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SubLayout from "./sub-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mintrrs",
  description: "Mintrrs | NFT Gen & Minting Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SubLayout>{children}</SubLayout>
      </body>
    </html>
  );
}
