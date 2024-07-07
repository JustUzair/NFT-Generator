import { toast } from "sonner";

async function getArtistByWalletAddress(walletAddress: string) {
  const response = await fetch(`/api/artists/${walletAddress}`);
  const data = await response.json();
  if (data.message === "error") {
    return toast.error(data.errorData);
  }
  console.log("====================================");
  console.log(data);
  console.log("====================================");
  return data.artist;
}

export { getArtistByWalletAddress };
