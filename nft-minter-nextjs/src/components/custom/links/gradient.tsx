import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const GradientLink = ({
  onClick,
  btnText,
  className,
  href,
}: {
  onClick?: any;
  btnText: string;
  href: string;
  className?: string;
}) => {
  return (
    <Link
      href={href}
      className={cn("p-[2px] relative", className)}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
      <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
        {btnText}
      </div>
    </Link>
  );
};

export default GradientLink;
