"use client";
import GradientButton from "@/components/custom/buttons/gradient";
import MovingGradientButton from "@/components/custom/buttons/moving-gradient";
import Error from "@/components/errors/error";
import Warning from "@/components/errors/warning";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supportedChains } from "@/constants/config";
import { getArtistByWalletAddress } from "@/lib/api-function-utils";
import { Artist } from "@/lib/interfaces";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const ArtistsLayout = () => {
  const { address, chainId, chain } = useAccount();
  const [artistData, setArtistData] = useState<Artist | null>(null);
  const [pfpImage, setPfpImage] = useState<File | null>(null);
  const [updatedArtistName, setUpdatedArtistName] = useState<string>(
    artistData?.artistName || ""
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  async function populateArtistData(address: string) {
    setArtistData(await getArtistByWalletAddress(address));
    setUpdatedArtistName(
      ((await getArtistByWalletAddress(address)) as Artist).artistName
    );
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();

    if (pfpImage) {
      formData.append("pfp-image", pfpImage);
    }
    formData.append("artistName", updatedArtistName);
    console.log("====================================");
    console.log(formData);
    console.log("====================================");
    try {
      const response = await fetch(`/api/artists/${address}/profile`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (data.message === "success") {
        toast.success("Profile updated successfully");
        window.location.reload();
      } else {
        console.error("Failed to update profile");
        toast.error("Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPfpImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    if (address) {
      populateArtistData(address);
    }
  }, [address]);

  if (chainId && !supportedChains.includes(chainId as 137 | 80002))
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
        <h1 className="tracking-widest text-center font-semibold text-4xl text-purple-500">
          Artist Profile
        </h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mt-8 p-6 bg-black shadow-md rounded-lg border-2 border-zinc-400"
        >
          {/* <h2 className="text-2xl font-semibold mb-6 text-center text-gray-300">
              Update Artist Profile
            </h2> */}

          <div className="mb-4">
            <Label
              htmlFor="artistName"
              className="block mb-2 text-gray-300 font-medium"
            >
              Artist Name
            </Label>
            <Input
              type="text"
              id="artistName"
              name="artistName"
              value={updatedArtistName}
              onChange={(e) => {
                setUpdatedArtistName(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="mb-4">
            <Label
              htmlFor="artistWalletAddress"
              className="block mb-2 text-gray-300 font-medium"
            >
              Wallet Address
            </Label>
            <Input
              type="text"
              id="artistWalletAddress"
              name="artistWalletAddress"
              value={artistData.artistWalletAddress}
              className="w-full px-3 py-2 border rounded cursor-not-allowed"
              required
              disabled
            />
          </div>

          <div className="mb-4">
            <Label
              htmlFor="pfpImage"
              className="block mb-2 text-gray-300 font-medium"
            >
              Profile Picture
            </Label>
            {artistData.pfp.url && (
              <div className="mb-2 flex items-center justify-center">
                <Image
                  src={artistData.pfp.url}
                  alt="Profile picture"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
            <Input
              type="file"
              id="pfpImage"
              name="pfpImage"
              onChange={handleFileChange}
              accept="image/*"
              className="w-full px-3 py-2 border text-zinc-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {previewUrl && (
              <div className="mt-2">
                <Image
                  src={previewUrl}
                  alt="Profile preview"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
          </div>

          <div className="flex justify-center">
            {/* <Button
              type="submit"
              
              className="px-6 py-2 bg-violet-800 hover:bg-violet-600 text-white font-semibold rounded "
            >
              
            </Button> */}
            <GradientButton
              className="mb-5 mt-2"
              btnText="Update Profile"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </>
    );
};

export default ArtistsLayout;
