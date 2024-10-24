"use client";
import { useState, ChangeEvent, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAccount } from "wagmi";
import { toast } from "sonner";
import { getArtistByWalletAddress } from "@/lib/api-function-utils";
import { Artist } from "@/lib/interfaces";
import { supportedChains } from "@/constants/config";
import Error from "@/components/errors/error";
import Warning from "@/components/errors/warning";
type ImageGroup = {
  type: string;
  files: File[];
  previews: string[];
};

const IMAGE_GROUPS = ["nose", "head", "mouth", "bg", "beard", "eyes", "hair"];

export default function UploadForm() {
  const { address, chainId, chain } = useAccount();

  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<ImageGroup[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [artistData, setArtistData] = useState<Artist | null>(null);
  const [updatedArtistName, setUpdatedArtistName] = useState<string>(
    artistData?.artistName || ""
  );

  useEffect(() => {
    if (address) {
      populateArtistData(address);
    }
  }, [address]);

  async function populateArtistData(address: string) {
    setArtistData(await getArtistByWalletAddress(address));
    setUpdatedArtistName(
      ((await getArtistByWalletAddress(address)) as Artist).artistName
    );
  }
  useEffect(() => {
    // Cleanup function to revoke the object URLs
    return () => {
      previews.forEach((group) =>
        group.previews.forEach((preview) => URL.revokeObjectURL(preview))
      );
    };
  }, [previews]);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(filesArray);

      // Group files and generate previews
      const groupedImages: ImageGroup[] = IMAGE_GROUPS.map((type) => ({
        type,
        files: [],
        previews: [],
      }));

      filesArray.forEach((file) => {
        const type = IMAGE_GROUPS.find((group) => file.name.startsWith(group));
        if (type) {
          const group = groupedImages.find((g) => g.type === type);
          if (group) {
            group.files.push(file);
            group.previews.push(URL.createObjectURL(file));
          }
        }
      });

      setPreviews(groupedImages);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!chain || !chainId) return;
    const formData = new FormData();
    images.forEach((image) => {
      formData.append("images", image);
    });
    formData.append("artistWalletAddress", address as string);
    formData.append("chainId", chain.id.toString());

    try {
      const response = await fetch("/api/upload-images", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("====================================");
      console.log(data);
      console.log("====================================");
      if (data.status === "success") {
        toast.success(data.message);
        // Optionally redirect or clear form
        // router.push('/success');
      } else {
        toast.error(data.errorData);
      }
    } catch (error) {
      toast.error("An error occurred while uploading");
    } finally {
      setIsLoading(false);
    }
  };
  if (
    chainId &&
    !supportedChains.includes(chainId as 137 | 80002 | 1 | 11155111)
  )
    return <Error message="Please connect to the supported network" />;
  if (!chain || !chainId) {
    toast.warning(
      "No Network Connected, Please connect to a network and try again. "
    );
    return (
      <div className="mt-30">
        <Warning message="No Network Connected, Please connect to a network and try again. " />
      </div>
    );
  }
  if (
    !artistData ||
    (artistData && !(artistData.artistWalletAddress == address))
  ) {
    // console.log("====================================");
    // console.log("here");
    // console.log("====================================");
    return (
      <div className="mt-30">
        <Error message="You are probably not registered as an artist!" />
      </div>
    );
  }
  if (
    chainId &&
    chain &&
    address &&
    artistData &&
    artistData.artistWalletAddress == address
  )
    return (
      <>
        <div className="max-w-md mx-auto mt-8 p-6 bg-black shadow-md rounded-lg border-2 border-zinc-400">
          <div className="divide-y divide-gray-200">
            <div className="py-8 text-base leading-6 space-y-4 text-white sm:text-lg sm:leading-7">
              <h2 className="text-3xl font-extrabold text-white ">
                Upload NFT Layers
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label
                    htmlFor="images"
                    className="block text-sm font-medium text-white"
                  >
                    Upload SVG Images
                  </Label>
                  <Input
                    type="file"
                    id="images"
                    name="images"
                    accept=".svg"
                    multiple
                    onChange={handleImageChange}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <Label
                    htmlFor="walletAddress"
                    className="block text-sm font-medium text-white"
                  >
                    Wallet Address
                  </Label>
                  <Input
                    type="text"
                    id="walletAddress"
                    name="walletAddress"
                    value={address}
                    disabled
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isLoading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="lg:max-w-[80%] mx-auto ">
          {previews.some((group) => group.previews.length > 0) && (
            <div className="mt-4">
              <h3 className="text-4xl font-medium text-white">
                Layers Preview:
              </h3>
              {previews.map(
                (group) =>
                  group.previews.length > 0 && (
                    <div
                      key={group.type}
                      className="flex flex-col items-center justify-center flex-wrap"
                    >
                      <h4 className="text-2xl font-semibold text-gray-200 uppercase tracking-widest my-10">
                        {group.type}
                      </h4>
                      <div className="mt-2 lg:grid grid-cols-5 gap-4 flex items-center justify-center flex-wrap">
                        {group.previews.map((preview, index) => (
                          <div
                            key={`${group.type}-${index}`}
                            className="relative h-[200px] w-[200px] bg-white rounded-xl flex items-center justify-center"
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${group.type}-${index + 1}`}
                              // fill
                              width={100}
                              height={100}
                              className="rounded-md object-cover h-[200px] w-[200px] "
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      </>
    );
}
