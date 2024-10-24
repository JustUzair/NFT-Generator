"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative flex flex-col gap-4 items-center justify-center px-4 "
      >
        <div className="text-3xl md:text-7xl font-bold text-white text-center">
          Build your own NFT marketplace
        </div>
        <div className="font-extralight text-base md:text-4xl text-neutral-200 py-4">
          And this is the place for it!
        </div>
        <button className=" bg-white rounded-full w-fit text-black dark:text-black px-4 py-2">
          Explore now
        </button>
      </motion.div>
    </AuroraBackground>
  );
}
