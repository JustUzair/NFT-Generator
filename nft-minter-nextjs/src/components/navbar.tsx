"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAccount } from "wagmi";
import { getArtistByWalletAddress } from "@/lib/api-function-utils";

type Props = {};

const Navbar = (props: Props) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isArtist, setIsArtist] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const { address } = useAccount();

  useEffect(() => {
    (async () => {
      if (address) {
        setIsArtist((await getArtistByWalletAddress(address)) !== null);
      }
    })();
  }, [address]);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleProfileToggle = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  return (
    <nav className="bg-zinc-900 fixed w-full z-20 top-0 start-0 border-b border-zinc-700">
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <Link
          onClick={() => {
            setIsProfileOpen(false);
          }}
          href="/"
          className="flex items-center space-x-3 rtl:space-x-reverse"
        >
          <Image src="/mintrrs.png" width={50} alt="logo" height={50} />
          <span className="self-center text-2xl font-semibold whitespace-nowrap text-gray-300">
            Mintrrs
          </span>
        </Link>
        <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
          <button
            type="button"
            className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm rounded-lg md:hidden hover:bg-zinc-700 focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-400"
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
          <ul className="flex flex-col p-4 md:p-0 mt-4 font-medium lg:gap-0 gap-5 md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0">
            <li>
              <Link
                onClick={() => {
                  setIsProfileOpen(false);
                }}
                href="/"
                className="block py-2 px-3 rounded text-gray-300 hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
                aria-current="page"
              >
                Home
              </Link>
            </li>
            <hr className="text-white opacity-20 w-[70%] text-center visible md:hidden lg:hidden" />
            <li>
              <Link
                onClick={() => {
                  setIsProfileOpen(false);
                }}
                href="/artists/page/1"
                className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
              >
                Artists
              </Link>
            </li>
            {address && !isArtist && (
              <>
                <hr className="text-white opacity-20 w-[70%] text-center visible md:hidden lg:hidden" />
                <li>
                  <Link
                    onClick={() => {
                      setIsProfileOpen(false);
                    }}
                    href="/artist/register"
                    className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
                  >
                    Register
                  </Link>
                </li>
              </>
            )}
            {address && isArtist && (
              <>
                <hr className="text-white opacity-20 w-[70%] text-center visible md:hidden lg:hidden" />
                <li ref={dropdownRef} className="relative">
                  <div className="md:hidden">
                    <span className="block py-2 px-3 text-gray-300 font-semibold">
                      Profile
                    </span>
                    <ul className="pl-4 space-y-2">
                      <li>
                        <Link
                          onClick={() => {
                            setIsProfileOpen(false);
                          }}
                          href="/artist"
                          className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150"
                        >
                          My Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          onClick={() => {
                            setIsProfileOpen(false);
                          }}
                          href="/artist/upload-and-generate"
                          className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150"
                        >
                          Upload & Generate
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div className="hidden md:block">
                    <button
                      onClick={handleProfileToggle}
                      className="flex items-center py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150 md:hover:bg-transparent border-gray-700"
                    >
                      Profile
                      <svg
                        className={`w-4 h-4 ml-2 transform ${
                          isProfileOpen ? "rotate-180" : ""
                        } transition-transform duration-200`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        ></path>
                      </svg>
                    </button>
                    {isProfileOpen && (
                      <div className="absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-zinc-800 ring-1 ring-black ring-opacity-5 divide-y divide-gray-700">
                        <div className="py-1">
                          <Link
                            onClick={() => {
                              setIsProfileOpen(false);
                            }}
                            href="/artist"
                            className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150"
                          >
                            My Profile
                          </Link>

                          <Link
                            onClick={() => {
                              setIsProfileOpen(false);
                            }}
                            href="/artist/upload-and-generate"
                            className="block py-2 px-3 text-gray-300 rounded hover:bg-zinc-700 hover:text-violet-500 transition-all duration-150"
                          >
                            Upload & Generate
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              </>
            )}
            <hr className="text-white opacity-20 w-[70%] text-center visible md:hidden lg:hidden" />
            <li>
              <ConnectButton accountStatus={"address"} showBalance={true} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
