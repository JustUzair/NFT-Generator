import { toast } from "sonner";

async function getArtistByWalletAddress(walletAddress: string) {
  const response = await fetch(`/api/artists/${walletAddress}`);
  const data = await response.json();
  if (data.message === "error") {
    // toast.error(data.errorData);
    return null;
  }
  console.log("====================================");
  console.log(data);
  console.log("====================================");
  return data.artist;
}

export { getArtistByWalletAddress };
