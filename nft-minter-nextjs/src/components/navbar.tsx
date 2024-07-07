import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";

type Props = {};

const Navbar = (props: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const { address } = useAccount();

  return (
    <nav className="bg-zinc-900 fixed w-full z-20 top-0 start-0 border-b border-zinc-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <a
          href="https://flowbite.com/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src="/mintrrs.png" width={50} alt="logo" height={50} />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-300">
            Mintrrs
          </span>
        </a>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <ConnectButton accountStatus={"address"} showBalance={true} />
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm  rounded-lg md:hidden hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400 "
            aria-controls="navbar-sticky"
            aria-expanded={isMenuOpen}
            onClick={handleMenuToggle}
          >
            <span className="sr-only">Open main menu</span>
            <svg
              className="w-5 h-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 17 14"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 1h15M1 7h15M1 13h15"
              />
            </svg>
          </button>
        </div>
        <div
          className={`${
            isMenuOpen ? "block" : "hidden"
          } items-center justify-between w-full md:flex md:w-auto md:order-1`}
          id="navbar-sticky"
        >
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium  md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 ">
            <li>
              <Link
                href="/"
                className="block py-2 px-3 rounded text-gray-300 hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <hr className="text-white opacity-20 w-[70%] text-center" />
            {/* Uncomment the following links if needed */}
            <li>
              <Link
                href="/artists"
                className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
              >
                Artists
              </Link>
            </li>
            <hr className="text-white opacity-20 w-[70%] text-center" />

            {/* <li>
              <Link
                href="#"
                className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
              >
                Services
              </Link>
            </li> */}
            {address && (
              <li>
                <Link
                  href="/artist"
                  className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
                >
                  Profile
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
