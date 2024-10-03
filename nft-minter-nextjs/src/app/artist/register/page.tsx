"use client";
import GradientButton from "@/components/custom/buttons/gradient";
import Error from "@/components/errors/error";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount } from "wagmi";

const RegisterArtist = () => {
  const { address } = useAccount();
  const [artistName, setArtistName] = useState<string>("");
  const [pfpImage, setPfpImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("artistName", artistName);
    if (pfpImage) {
      formData.append("pfp-image", pfpImage);
    }
    formData.append("artistWalletAddress", address as string);

    try {
      const response = await fetch(`/api/artists/register`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      console.log(data);

      if (data.message === "success") {
        toast.success("Artist registered successfully");
        router.push("/artist");
      } else {
        console.error("Failed to register artist");
        toast.error("Failed to register artist");
      }
    } catch (error) {
      console.error("Error registering artist:", error);
      toast.error("Failed to register artist");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPfpImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  if (!address) {
    toast.warning("Please connect your wallet to register as an artist.");
    return (
      <Error message="Please connect your wallet to register as an artist." />
    );
  }

  return (
    <div className="flex lg:flex-row flex-col items-baseline justify-around flex-wrap lg:gap-0 gap-10">
      <div>
        <h1 className="tracking-widest text-center font-semibold text-4xl text-purple-500">
          Register as an Artist
        </h1>
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto mt-8 p-6 bg-black shadow-md rounded-lg border-2 border-zinc-400"
        >
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
              value={artistName}
              onChange={(e) => {
                setArtistName(e.target.value);
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
              value={address}
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
            <GradientButton
              className="mb-5 mt-2"
              btnText="Register Artist"
              onClick={handleSubmit}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterArtist;
