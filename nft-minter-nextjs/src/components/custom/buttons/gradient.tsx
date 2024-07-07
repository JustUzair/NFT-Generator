import { cn } from "@/lib/utils";
import React from "react";

const GradientButton = ({
  onClick,
  btnText,
  className,
}: {
  onClick: any;
  btnText: string;
  className?: string;
}) => {
  return (
    <button className={cn("p-[3px] relative", className)} onClick={onClick}>
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg" />
      <div className="px-8 py-2 bg-black rounded-[6px]  relative group transition duration-200 text-white hover:bg-transparent">
        {btnText}
      </div>
    </button>
  );
};

export default GradientButton;
