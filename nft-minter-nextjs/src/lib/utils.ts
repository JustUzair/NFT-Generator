import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import pinataSDK from "@pinata/sdk";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Use the api keys by specifying your api key and api secret

async function testPinataAuth() {
  const pinata = new pinataSDK({
    pinataJWTKey: process.env.PINATA_JWT_SECRET,
  });
  const res = await pinata.testAuthentication();

  console.log(res);
}
async function getPinataClient() {
  const pinata = new pinataSDK({
    pinataJWTKey: process.env.PINATA_JWT_SECRET,
  });
  return pinata;
}
export { testPinataAuth, getPinataClient };
