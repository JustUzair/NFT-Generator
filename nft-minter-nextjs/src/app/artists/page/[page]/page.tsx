"use client";
import GradientButton from "@/components/custom/buttons/gradient";
import GradientArtistCard from "@/components/custom/cards/gradient-artist-card";
import Loader from "@/components/loader";
import { Artist } from "@/lib/interfaces";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function ArtistsPage({ params }: { params: { page: string } }) {
  const router = useRouter();
  const currentPage = parseInt(params.page, 10);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    fetchArtists(currentPage);
  }, [currentPage]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const fetchArtists = async (page: number) => {
    try {
      const res = await fetch(`/api/artists?page=${page}&limit=12`);
      const data = await res.json();
      setArtists(data.artists);
      setTotalPages(data.totalPages);
      //   console.log("====================================");
      //   console.log(data.totalPages);
      //   console.log("====================================");
    } catch (error) {
      console.error("Error fetching artists:", error);
      toast.error("Error fetching artists");
    }
  };

  const getCardSize = (index: number) => {
    const sizes = [
      "lg:col-span-1 lg:row-span-[1.5]", // 1st card spans 1.5 rows (approx 2 rows in grid)
      "lg:col-span-2 lg:row-span-1", // 2nd card spans 1 row and 2 columns
      "lg:col-span-1 lg:row-span-2", // 3rd card spans 1.5 rows (approx 2 rows in grid)
      "lg:col-span-1 lg:row-span-1", // 4th card spans 1 row
      "lg:col-span-1 lg:row-span-1", // 5th card spans 1 row
      "lg:col-span-1 lg:row-span-1", // 6th card spans 1 row
      "lg:col-span-1 lg:row-span-2", // 7th card spans 1 row
      "lg:col-span-2 lg:row-span-1", // 8th card spans 1 row
      "lg:col-span-2 lg:row-span-1", // 9th card spans 1 row
      "lg:col-span-1 lg:row-span-1", // 10th card spans 1 row
      "lg:col-span-1 lg:row-span-1", // 11th card spans 1 row
      "lg:col-span-2 lg:row-span-1", // 12th card spans 1 row
    ];
    return sizes[index % sizes.length];
  };
  if (!isLoaded) return <Loader />;
  if (isLoaded)
    return (
      <div className="max-w-[85%] mx-auto">
        <div className="lg:grid lg:grid-cols-3 gap-4 pb-20 lg:auto-rows-[minmax(100px, auto)] flex flex-col justify-between items-center">
          {artists.map((artist, index) => (
            <div
              key={artist._id}
              className={`${getCardSize(index)} rounded-3xl w-[100%] h-[100%]`}
            >
              <GradientArtistCard
                artist={artist}
                className="!h-[100%] !w-[100%]"
              />
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-x-10 w-full max-w-6xl pb-10">
          {currentPage > 1 && (
            <GradientButton
              onClick={() => {
                router.push(`/artists/page/${currentPage - 1}`);
              }}
              btnText="Previous"
              className="w-40"
            />
          )}
          {currentPage < totalPages && (
            <GradientButton
              onClick={() => {
                router.push(`/artists/page/${currentPage + 1}`);
              }}
              btnText="Next"
              className="w-40"
            />
          )}
        </div>
      </div>
    );
}
