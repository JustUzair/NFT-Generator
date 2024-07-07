import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SubLayout from "./sub-layout";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mintrrs",
  description: "Mintrrs | NFT Gen & Minting Platform",
  icons: ["/mintrrs.png"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster richColors position="bottom-center" />
        <SubLayout>{children}</SubLayout>
      </body>
    </html>
  );
}
