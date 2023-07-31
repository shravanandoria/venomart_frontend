import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import darkPng from "../../public/darkpng.png";
import whitePng from "../../public/whitepng.png";
import venomLogo from "../../public/venom.svg";
import axios from "axios";


const Navbar = ({ signer_address, theme, setTheme, baseURL, connectWallet, onDisconnect }) => {
  const router = useRouter();

  const [profileDrop, setProfileDrop] = useState(false);
  const [mobieProfileDrop, setMobieProfileDrop] = useState(false);

  const [search_result, set_search_result] = useState([]);

  const [explorerLog, SetExplorerLog] = useState("");
  const [vnmBalance, setVnmBalance] = useState("");

  useEffect(() => {
    if (!signer_address) return;
    axios
      .post(baseURL, {
        id: signer_address,
      })
      .then((response) => {
        SetExplorerLog(response.data);
        const balance = parseFloat(response.data.balance / 1000000000).toFixed(
          2
        );
        setVnmBalance(balance);
      });
  }, [signer_address]);

  return (
    <div
      className={`${theme} overflow-x-hidden font-body text-jacarta-500 dark:bg-jacarta-900`}
    >
      <div className="js-page-header fixed top-0 z-20 w-full backdrop-blur transition-colors">
        <div className="flex items-center px-6 py-6 xl:px-24">
          {/* icon  */}
          {theme === "dark" ?
            <Link href="/" className="shrink-0 relative">
              <Image
                src={darkPng}
                height={160}
                width={150}
                alt="Venomart | NFT Marketplace"
              />
            </Link>
            :
            <Link href="/" className="shrink-0 relative">
              <Image
                src={whitePng}
                height={160}
                width={150}
                alt="Venomart | NFT Marketplace"
              />
            </Link>
          }

          {/* search form  */}
          <form
            action="search"
            className="relative ml-12 mr-8 basis-3/12 xl:ml-[8%]"
            id="searchInp"
          >
            <input
              type="search"
              // onFocus={() => set_search_result([])}
              // onChange={find_nft}
              className="w-full rounded-2xl border border-jacarta-100 py-[0.6875rem] px-4 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
              placeholder="Search"
            />
            <span className="absolute left-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-500 dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z" />
              </svg>
            </span>

            {/* SEARCH FUNCTIONALITY */}
            {/* <div
              className="w-full rounded-2xl bg-[#F6F1F8] absolute mt-2 border-r-4"
              onClick={() => set_search_result([])}
            >
              {search_result?.map((e, index) => (
                <Link
                  key={index}
                  href={`/nft/${e.ipfsData.collection}/${e.tokenId}`}
                  className="rounded-2xl"
                >
                  <div className="w-full rounded-2xl border-gray-200 border-b-2 p-4 hover:bg-[#f5f5f5]">
                    {e?.nft_name}
                  </div>
                </Link>
              ))}
            </div> */}
          </form>

          <div className="js-mobile-menu invisible lg:visible fixed inset-0 z-10 ml-auto items-center bg-white opacity-0 dark:bg-jacarta-800 lg:relative lg:inset-auto lg:flex lg:bg-transparent lg:opacity-100 dark:lg:bg-transparent">
            {/* menu links  */}
            <div className="navbar w-full">
              <ul className="flex flex-col lg:flex-row">
                <li className="js-nav-dropdown group relative">
                  <Link
                    href="#"
                    className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                    id="navDropdown-4"
                    aria-expanded="false"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Explore
                  </Link>
                  <ul
                    className="dropdown-menu group-hover:visible lg:invisible left-0 top-[85%] z-10 hidden min-w-[200px] gap-x-4 whitespace-nowrap rounded-xl bg-white transition-all will-change-transform group-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:translate-y-4 lg:py-4 lg:px-2 lg:opacity-0 lg:shadow-2xl lg:group-hover:translate-y-2"
                    aria-labelledby="navDropdown-4"
                  >
                    <li>
                      <Link
                        href="/explore/NFTs"
                        className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                      >
                        <span className="mr-3 rounded-xl bg-light-base p-[0.375rem]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M22 12.999V20a1 1 0 0 1-1 1h-8v-8.001h9zm-11 0V21H3a1 1 0 0 1-1-1v-7.001h9zM11 3v7.999H2V4a1 1 0 0 1 1-1h8zm10 0a1 1 0 0 1 1 1v6.999h-9V3h8z" />
                          </svg>
                        </span>
                        <span className="font-display text-sm text-jacarta-700 dark:text-white">
                          All NFTs
                        </span>
                      </Link>
                    </li>

                    <li>
                      <Link
                        href="/explore/Collections"
                        className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                      >
                        <span className="mr-3 rounded-xl bg-[#FDF7EE] p-[0.375rem]">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-[#FEB240]"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M17.5 2a4.5 4.5 0 0 1 2.951 7.897c.355.967.549 2.013.549 3.103A9 9 0 1 1 3.55 9.897a4.5 4.5 0 1 1 6.791-5.744 9.05 9.05 0 0 1 3.32 0A4.494 4.494 0 0 1 17.5 2zm0 2c-.823 0-1.575.4-2.038 1.052l-.095.144-.718 1.176-1.355-.253a7.05 7.05 0 0 0-2.267-.052l-.316.052-1.356.255-.72-1.176A2.5 2.5 0 1 0 4.73 8.265l.131.123 1.041.904-.475 1.295A7 7 0 1 0 19 13c0-.716-.107-1.416-.314-2.083l-.112-.33-.475-1.295 1.04-.904A2.5 2.5 0 0 0 17.5 4zM10 13a2 2 0 1 0 4 0h2a4 4 0 1 1-8 0h2z" />
                          </svg>
                        </span>
                        <span className="font-display text-sm text-jacarta-700 dark:text-white">
                          All Collections
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="js-nav-dropdown group relative">
                  <a
                    href="#"
                    className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                    id="navDropdown-4"
                    aria-expanded="false"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Create
                  </a>
                  <ul
                    className="dropdown-menu group-hover:visible lg:invisible left-0 top-[85%] z-10 hidden min-w-[200px] gap-x-4 whitespace-nowrap rounded-xl bg-white transition-all will-change-transform group-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:translate-y-4 lg:py-4 lg:px-2 lg:opacity-0 lg:shadow-2xl lg:group-hover:translate-y-2"
                    aria-labelledby="navDropdown-4"
                  >
                    <li>
                      <Link
                        href="/mint/CreateNFT"
                        className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                      >
                        <span className="font-display text-sm text-jacarta-700 dark:text-white">
                          Create NFT
                        </span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/mint/CreateNFTCollection"
                        className="flex items-center rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                      >
                        <span className="font-display text-sm text-jacarta-700 dark:text-white">
                          Create NFT Collection
                        </span>
                      </Link>
                    </li>
                  </ul>
                </li>

                <li className="js-nav-dropdown group relative">
                  <Link
                    href="/explore/Launchpad"
                    className="dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 hover:text-accent focus:text-accent dark:text-white dark:hover:text-accent dark:focus:text-accent lg:px-5"
                    id="navDropdown-1"
                    aria-expanded="false"
                    role="button"
                    data-bs-toggle="dropdown"
                  >
                    Launchpad
                  </Link>
                </li>
              </ul>
            </div>

            {/* pc connect wallet  */}
            <div className="ml-8 hidden lg:flex xl:ml-12">
              {/* dark theme and light theme */}
              <div
                onClick={() => (
                  localStorage.setItem("WebsiteTheme", "dark"), setTheme("dark")
                )}
                className="js-dark-mode-trigger cursor-pointer group ml-2 h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent block dark:hidden mr-2"
              >
                <div className="flex justify-center align-middle mt-[10px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="dark-mode-light h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white block dark:hidden"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M11.38 2.019a7.5 7.5 0 1 0 10.6 10.6C21.662 17.854 17.316 22 12.001 22 6.477 22 2 17.523 2 12c0-5.315 4.146-9.661 9.38-9.981z" />
                  </svg>
                </div>
              </div>
              <div
                onClick={() => (
                  localStorage.setItem("WebsiteTheme", "light"),
                  setTheme("light")
                )}
                className=" hidden dark:block js-dark-mode-trigger cursor-pointer group ml-2 h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent mr-2"
              >
                <div className="flex justify-center align-middle mt-[11px] mr-[1px]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="dark-mode-dark hidden h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:block dark:fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
                  </svg>
                </div>
              </div>
              {!signer_address ? (
                <button
                  onClick={() => connectWallet()}
                  className="js-wallet group flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
                  data-bs-toggle="modal"
                  data-bs-target="#walletModal"
                  aria-label="wallet"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
                  </svg>
                </button>
              ) : (
                <>
                  <div className="relative">
                    {/* profile icon */}
                    <button
                      className="group ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
                      onClick={() => setProfileDrop(!profileDrop)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z" />
                      </svg>
                    </button>

                    {/* profile dropdown  */}
                    {profileDrop && (
                      <div className="!-right-4 !top-[85%] !left-auto z-10 min-w-[14rem] whitespace-nowrap rounded-xl bg-white transition-all will-change-transform before:absolute before:-top-3 before:h-3 before:w-full group-dropdown-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:!translate-y-4 lg:py-4 lg:px-2 lg:shadow-2xl">
                        <button
                          className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white"
                          data-tippy-content="Copy"
                        >
                          <span className="max-w-[10rem] overflow-hidden text-ellipsis">
                            {signer_address}
                          </span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="ml-1 mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
                          </svg>
                        </button>

                        <div className="mx-5 mb-6 rounded-lg border border-jacarta-100 p-4 dark:border-jacarta-600">
                          <span className="text-sm font-medium tracking-tight dark:text-jacarta-200">
                            Balance
                          </span>
                          <div className="flex items-center">
                            <span className="flex  justify-center align-middletext-lg font-bold text-green">
                              {vnmBalance}
                              <Image
                                src={venomLogo}
                                height={100}
                                width={100}
                                style={{
                                  height: "14px",
                                  width: "14px",
                                  marginLeft: "7px",
                                  marginTop: "5px"
                                }}
                              />
                            </span>
                          </div>
                        </div>
                        <Link
                          href={`/profile/${signer_address}`}
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z"></path>
                            <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"></path>
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            My Profile
                          </span>
                        </Link>
                        <Link
                          href="/profile/EditProfile"
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Edit Profile
                          </span>
                        </Link>
                        <Link
                          href="/mint/CreateNFT"
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Create NFT
                          </span>
                        </Link>
                        <Link
                          href="/mint/CreateNFTCollection"
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Create Collection
                          </span>
                        </Link>
                        <Link
                          href="/mint/CreateNFTCollection"
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Create Collection
                          </span>
                        </Link>
                        <a
                          onClick={() => onDisconnect()}
                          className="cursor-pointer flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Sign out
                          </span>
                        </a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* mobile connect wallet */}
          <div className="ml-auto flex lg:hidden">
            {/* dark theme and light theme */}
            <div
              onClick={() => (
                localStorage.setItem("WebsiteTheme", "dark"), setTheme("dark")
              )}
              className="js-dark-mode-trigger cursor-pointer group ml-2 h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent block dark:hidden"
            >
              <div className="flex justify-center align-middle mt-[10px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="dark-mode-light h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white block dark:hidden"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M11.38 2.019a7.5 7.5 0 1 0 10.6 10.6C21.662 17.854 17.316 22 12.001 22 6.477 22 2 17.523 2 12c0-5.315 4.146-9.661 9.38-9.981z" />
                </svg>
              </div>
            </div>
            <div
              onClick={() => (
                localStorage.setItem("WebsiteTheme", "light"), setTheme("light")
              )}
              className=" hidden dark:block js-dark-mode-trigger cursor-pointer group ml-2 h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
            >
              <div className="flex justify-center align-middle mt-[11px] mr-[1px]">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="dark-mode-dark hidden h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:block dark:fill-white"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M12 18a6 6 0 1 1 0-12 6 6 0 0 1 0 12zM11 1h2v3h-2V1zm0 19h2v3h-2v-3zM3.515 4.929l1.414-1.414L7.05 5.636 5.636 7.05 3.515 4.93zM16.95 18.364l1.414-1.414 2.121 2.121-1.414 1.414-2.121-2.121zm2.121-14.85l1.414 1.415-2.121 2.121-1.414-1.414 2.121-2.121zM5.636 16.95l1.414 1.414-2.121 2.121-1.414-1.414 2.121-2.121zM23 11v2h-3v-2h3zM4 11v2H1v-2h3z" />
                </svg>
              </div>
            </div>
            {!signer_address ? (
              <button
                onClick={() => connectWallet()}
                className="ml-4 js-wallet group flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
                data-bs-toggle="modal"
                data-bs-target="#walletModal"
                aria-label="wallet"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M22 6h-7a6 6 0 1 0 0 12h7v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h18a1 1 0 0 1 1 1v2zm-7 2h8v8h-8a4 4 0 1 1 0-8zm0 3v2h3v-2h-3z" />
                </svg>
              </button>
            ) : (
              <>
                <div className="relative">
                  {/* profile icon */}
                  <button
                    className="group ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
                    onClick={() => setMobieProfileDrop(!mobieProfileDrop)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        {/* profile dropdown  */}
        {mobieProfileDrop && (
          <div className="!-right-4 !top-[85%] !left-auto z-10 min-w-[14rem] whitespace-nowrap rounded-xl bg-white transition-all will-change-transform before:absolute before:-top-3 before:h-3 before:w-full group-dropdown-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:!translate-y-4 lg:py-4 lg:px-2 lg:shadow-2xl py-6">
            <button
              className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white"
              data-tippy-content="Copy"
            >
              <span className="max-w-[10rem] overflow-hidden text-ellipsis">
                {signer_address}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="ml-1 mb-px h-4 w-4 fill-jacarta-500 dark:fill-jacarta-300"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
              </svg>
            </button>

            <div className="mx-5 mb-6 rounded-lg border border-jacarta-100 p-4 dark:border-jacarta-600">
              <span className="text-sm font-medium tracking-tight dark:text-jacarta-200">
                Balance
              </span>
              <div className="flex items-center">
                <span className="flex justify-center align-middle text-lg font-bold text-green">
                  {vnmBalance}
                  <Image
                    src={venomLogo}
                    height={100}
                    width={100}
                    style={{
                      height: "14px",
                      width: "14px",
                      marginLeft: "7px",
                      marginTop: "5px"
                    }}
                  />
                </span>
              </div>
            </div>
            <Link
              href={`/profile/${signer_address}`}
              className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z"></path>
                <path d="M11 14.062V20h2v-5.938c3.946.492 7 3.858 7 7.938H4a8.001 8.001 0 0 1 7-7.938zM12 13c-3.315 0-6-2.685-6-6s2.685-6 6-6 6 2.685 6 6-2.685 6-6 6z"></path>
              </svg>
              <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                My Profile
              </span>
            </Link>
            <Link
              href="/profile/EditProfile"
              className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M9.954 2.21a9.99 9.99 0 0 1 4.091-.002A3.993 3.993 0 0 0 16 5.07a3.993 3.993 0 0 0 3.457.261A9.99 9.99 0 0 1 21.5 8.876 3.993 3.993 0 0 0 20 12c0 1.264.586 2.391 1.502 3.124a10.043 10.043 0 0 1-2.046 3.543 3.993 3.993 0 0 0-3.456.261 3.993 3.993 0 0 0-1.954 2.86 9.99 9.99 0 0 1-4.091.004A3.993 3.993 0 0 0 8 18.927a3.993 3.993 0 0 0-3.457-.26A9.99 9.99 0 0 1 2.5 15.121 3.993 3.993 0 0 0 4 11.999a3.993 3.993 0 0 0-1.502-3.124 10.043 10.043 0 0 1 2.046-3.543A3.993 3.993 0 0 0 8 5.071a3.993 3.993 0 0 0 1.954-2.86zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
              </svg>
              <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                Edit Profile
              </span>
            </Link>
            <Link
              href="/mint/CreateNFT"
              className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
              </svg>
              <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                Create NFT
              </span>
            </Link>
            <Link
              href="/mint/CreateNFTCollection"
              className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white rotate-180"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
              </svg>
              <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                Create Collection
              </span>
            </Link>
            <a
              onClick={() => onDisconnect()}
              className="cursor-pointer flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="h-4 w-4 fill-jacarta-700 transition-colors dark:fill-white"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zM7 11V8l-5 4 5 4v-3h8v-2H7z" />
              </svg>
              <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                Sign out
              </span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
