import { React, useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Image from "next/image";
import darkPng from "../../public/darkpng.png";
import whitePng from "../../public/whitepng.png";
import venomLogo from "../../public/venomBG.webp";
import axios from "axios";
import MobileNavbar from "./navcomps/MobileNavbar";
import MobileProfileDrop from "./navcomps/MobileProfileDrop";
import DesktopNavbar from "./navcomps/DesktopNavbar";
import { GrClose } from "react-icons/gr";
import { search } from "../utils/mongo_api/search";
import { MdVerified } from "react-icons/md";
import { RxCrossCircled } from "react-icons/rx";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { BiLoaderAlt } from "react-icons/bi";
import numeral from "numeral";

const Navbar = ({
  signer_address,
  theme,
  setTheme,
  apiFetchURL,
  connectWallet,
  onDisconnect,
  MintNFTStatus,
  MintCollectionStatus,
  blockURL,
  vnmBalance,
  setVnmBalance
}) => {
  const router = useRouter();

  const [profileDrop, setProfileDrop] = useState(false);
  const [mobieProfileDrop, setMobieProfileDrop] = useState(false);
  const [mobileNavDrop, setMobileNavDrop] = useState(false);

  const [searchLoading, setSearchLoading] = useState(false);

  const [searchCollections, showSearchCollections] = useState(true);
  const [searchNFTs, showSearchNFTs] = useState(false);

  //{cols: [], nfts: []}
  const [search_result, set_search_result] = useState({});
  const [query_search, set_query_search] = useState("");
  const [isTyping, set_isTyping] = useState(true);

  const [explorerLog, SetExplorerLog] = useState("");

  const [searchValueState, setSearchValueState] = useState("");

  const onInput = (e) => setSearchValueState(e.target.value);

  const handle_search = async (data) => {
    set_query_search(data);
    set_isTyping(true);
  };

  function formatNumberShort(number) {
    if (number >= 1e6) {
      const formatted = numeral(number / 1e6).format('0.00a');
      if (formatted.endsWith('k')) {
        return (formatted.slice(0, -1) + "M");
      }
      else {
        return (formatted + "M");
      }
    } else if (number >= 1e3) {
      return numeral(number / 1e3).format('0.00a') + 'K';
    } else if (number % 1 !== 0) {
      return numeral(number).format('0.00');
    } else {
      return numeral(number).format('0');
    }
  }

  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || !query_search) return;
      setSearchLoading(true);
      const res = await search(query_search);
      if (res) {
        set_search_result(res);
      }
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!signer_address) return;
    axios
      .post(apiFetchURL, {
        id: signer_address,
      })
      .then((response) => {
        SetExplorerLog(response?.data);
        const balance = parseFloat(
          response?.data?.balance / 1000000000
        ).toFixed(2);
        if (response.data) {
          setVnmBalance(balance);
        } else {
          setVnmBalance("0.00");
        }
      });
  }, [signer_address]);

  useEffect(() => {
    setProfileDrop(false);
    setMobieProfileDrop(false);
    setMobileNavDrop(false);
    set_search_result(false);
    setSearchValueState("");
  }, [router.pathname]);

  return (
    <div className={`${theme} overflow-x-hidden font-body text-jacarta-500`}>
      <div className="js-page-header fixed top-0 z-30 w-full backdrop-blur bg-white dark:bg-jacarta-900 transition-colors">
        {/* <div className="js-page-header fixed top-0 z-30 w-full backdrop-blur transition-colors"> */}
        <div
          className={`flex items-center justify-around px-8 py-4 ${mobileNavDrop && "bg-white dark:bg-jacarta-800"
            } ${mobieProfileDrop && "bg-white dark:bg-jacarta-800"}`}
        >
          {/* icon  */}
          {theme === "dark" ? (
            <Link href="/" className="shrink-0 relative">
              <Image
                src={darkPng}
                height={160}
                width={150}
                alt="Venomart | NFT Marketplace"
              />
            </Link>
          ) : (
            <Link href="/" className="shrink-0 relative">
              <Image
                src={whitePng}
                height={160}
                width={150}
                alt="Venomart | NFT Marketplace"
              />
            </Link>
          )}

          {/* search form  */}
          <form
            onSubmit={(e) => e.preventDefault()}
            className="relative ml-12 mr-8 basis-3/12"
            id="searchInpForm"
          >
            <input
              type="search"
              onChange={(e) => {
                handle_search((e.target.value).replace(/[^\w\s]/gi, ""));
              }}
              className="w-full h-[40px] rounded-2xl border border-jacarta-100 py-[0.6875rem] px-4 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
              placeholder="Search"
              id="searchInp"
              value={searchValueState}
              onInput={onInput}
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
            {search_result.collections && (
              <span className="absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
                <RxCrossCircled
                  onClick={() => (
                    setSearchValueState(""), set_search_result([])
                  )}
                  className="h-6 w-6 text-jacarta-500 dark:text-white cursor-pointer"
                />
              </span>
            )}

            {/* SEARCH FUNCTIONALITY */}
            {search_result.collections && (
              <div className="w-full rounded-2xl bg-[#F6F1F8] absolute mt-2 border-r-4">
                <div className="flex justify-start align-middle h-[40px] pt-2">
                  <span
                    onClick={() => (
                      showSearchNFTs(false), showSearchCollections(true)
                    )}
                    className={`p-2 ml-4 ${searchCollections &&
                      "border-b border-jacarta-100 dark:border-jacarta-600"
                      } cursor-pointer`}
                  >
                    Collections
                  </span>
                  <span
                    onClick={() => (
                      showSearchCollections(false), showSearchNFTs(true)
                    )}
                    className={`p-2 ml-4 ${searchNFTs &&
                      "border-b border-jacarta-100 dark:border-jacarta-600"
                      } cursor-pointer`}
                  >
                    NFTs
                  </span>
                </div>
                {isTyping || searchLoading ? (
                  <div className="w-full rounded-2xl bg-[#F6F1F8] absolute border-r-4">
                    <div className="flex justify-center align-middle h-[50px] p-4">
                      <BiLoaderAlt className="animate-spin" />
                    </div>
                  </div>
                ) : (
                  <div>
                    {searchCollections &&
                      search_result.collections?.map((e, index) => (
                        <Link
                          key={index}
                          href={`/collection/${e.contractAddress}`}
                          className="rounded-2xl"
                        >
                          <div className="flex w-full rounded-2xl border-gray-200 border-b-2 p-4 hover:bg-[#f5f5f5]">
                            <Image
                              src={e?.logo.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )}
                              height={100}
                              width={100}
                              className="h-[46px] w-[46px] rounded-[50%] mr-2"
                            />
                            <div className="flex flex-col align-middle">
                              <div className="flex align-middle justify-center">
                                {e?.name}
                                {e?.isVerified ? (
                                  <MdVerified
                                    style={{
                                      color: "#4f87ff",
                                      cursor: "pointer",
                                      marginLeft: "3px",
                                      marginTop: "4px",
                                    }}
                                    size={17}
                                  />
                                ) : (
                                  <BsFillExclamationCircleFill
                                    style={{
                                      color: "#c3c944",
                                      cursor: "pointer",
                                      marginLeft: "3px",
                                      marginTop: "4px",
                                    }}
                                    size={17}
                                  />
                                )}
                              </div>
                              <div className="flex align-middle">
                                {e?.contractAddress.slice(0, 4) +
                                  "..." +
                                  e?.contractAddress.slice(63)}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    {searchCollections &&
                      search_result.collections?.length <= 0 && (
                        <div className="rounded-2xl">
                          <div className="flex w-full rounded-2xl border-gray-200 border-b-2 p-4 hover:bg-[#f5f5f5]">
                            No Collections Found
                          </div>
                        </div>
                      )}

                    {searchNFTs &&
                      search_result.nfts?.map((e, index) => (
                        <Link
                          key={index}
                          href={`/nft/${e.NFTAddress}`}
                          className="rounded-2xl"
                        >
                          <div className="flex w-full rounded-2xl border-gray-200 border-b-2 p-4 hover:bg-[#f5f5f5]">
                            <Image
                              src={e?.nft_image.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )}
                              height={100}
                              width={100}
                              className="h-[46px] w-[46px] rounded-[10%] mr-2"
                            />
                            <div className="flex flex-col align-middle">
                              <div className="flex align-middle justify-center">
                                {e?.name}
                              </div>
                              <div className="flex align-middle">
                                {e?.NFTCollection?.contractAddress.slice(0, 4) +
                                  "..." +
                                  e?.NFTCollection?.contractAddress.slice(63)}
                                {e?.NFTCollection?.isVerified ? (
                                  <MdVerified
                                    style={{
                                      color: "#4f87ff",
                                      cursor: "pointer",
                                      marginLeft: "3px",
                                      marginTop: "4px",
                                    }}
                                    size={17}
                                  />
                                ) : (
                                  <BsFillExclamationCircleFill
                                    style={{
                                      color: "#c3c944",
                                      cursor: "pointer",
                                      marginLeft: "3px",
                                      marginTop: "4px",
                                    }}
                                    size={17}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    {searchNFTs && search_result?.nfts?.length <= 0 && (
                      <div className="rounded-2xl">
                        <div className="flex w-full rounded-2xl border-gray-200 border-b-2 p-4 hover:bg-[#f5f5f5]">
                          No NFTs Found
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {isTyping ||
              (searchLoading && (
                <div className="w-full rounded-2xl bg-[#F6F1F8] absolute mt-2 border-r-4">
                  <div className="flex justify-start align-middle h-[40px] pt-2">
                    <BiLoaderAlt className="animate-spin" />
                  </div>
                </div>
              ))}
          </form>

          <div className="js-mobile-menu invisible lg:visible fixed inset-0 z-25 ml-auto items-center bg-white opacity-0 dark:bg-jacarta-800 lg:relative lg:inset-auto lg:flex lg:bg-transparent lg:opacity-100 dark:lg:bg-transparent">
            {/* pc navbar  */}
            <DesktopNavbar />

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
                      <div className="!-right-4 !top-[85%] !left-auto z-30 min-w-[14rem] whitespace-nowrap rounded-xl bg-white transition-all will-change-transform before:absolute before:-top-3 before:h-3 before:w-full group-dropdown-hover:opacity-100 dark:bg-jacarta-800 lg:absolute lg:grid lg:!translate-y-4 lg:py-4 lg:px-2 lg:shadow-2xl">
                        <button
                          className="js-copy-clipboard my-4 flex select-none items-center whitespace-nowrap px-5 font-display leading-none text-jacarta-700 dark:text-white"
                          data-tippy-content="Copy"
                        >
                          <a
                            href={`${blockURL}accounts/${signer_address}`}
                            target="_blank"
                            className="max-w-[10rem] overflow-hidden text-ellipsis hover:text-accent"
                          >
                            {signer_address}
                          </a>
                          <svg
                            onClick={() => (
                              navigator.clipboard.writeText(
                                `${signer_address}`
                              ),
                              alert("copied wallet address to clipboard")
                            )}
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
                              <Image
                                src={venomLogo}
                                height={100}
                                width={100}
                                style={{
                                  height: "14px",
                                  width: "14px",
                                  marginRight: "7px",
                                  marginTop: "5px",
                                }}
                                alt="VenomLogo"
                              />
                              {formatNumberShort(vnmBalance)}
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
                          href="/profile/Notifications"
                          className="flex items-center space-x-2 rounded-xl px-5 py-2 transition-colors hover:bg-jacarta-50 hover:text-accent focus:text-accent dark:hover:bg-jacarta-600"
                        >
                          <svg
                            className="h-5 w-5 fill-jacarta-700 transition-colors dark:fill-white"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M15 17H20L18.5951 15.5951C18.2141 15.2141 18 14.6973 18 14.1585V11C18 8.38757 16.3304 6.16509 14 5.34142V5C14 3.89543 13.1046 3 12 3C10.8954 3 10 3.89543 10 5V5.34142C7.66962 6.16509 6 8.38757 6 11V14.1585C6 14.6973 5.78595 15.2141 5.40493 15.5951L4 17H9M15 17V18C15 19.6569 13.6569 21 12 21C10.3431 21 9 19.6569 9 18V17M15 17H9" />
                          </svg>
                          <span className="mt-1 font-display text-sm text-jacarta-700 dark:text-white">
                            Notifications
                          </span>
                        </Link>
                        {MintNFTStatus && (
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
                        )}
                        {MintCollectionStatus && (
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
                        )}
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
              className="hidden dark:block js-dark-mode-trigger cursor-pointer group ml-2 h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
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
                    onClick={() => (
                      setMobileNavDrop(false),
                      setMobieProfileDrop(!mobieProfileDrop)
                    )}
                  >
                    {mobieProfileDrop ? (
                      <GrClose className="h-4 w-4 fill-black dark:fill-white" />
                    ) : (
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
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* mobile navbar switch button  */}
          <div className="lg:hidden">
            <button
              className="group ml-2 flex h-10 w-10 items-center justify-center rounded-full border border-jacarta-100 bg-white transition-colors hover:border-transparent hover:bg-accent focus:border-transparent focus:bg-accent dark:border-transparent dark:bg-white/[.15] dark:hover:bg-accent"
              onClick={() => (
                setMobieProfileDrop(false), setMobileNavDrop(!mobileNavDrop)
              )}
            >
              {mobileNavDrop ? (
                <GrClose onClick={() => (setSearchValueState(""), set_search_result([]))} className="h-4 w-4 fill-black dark:fill-white" />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white group-focus:fill-white dark:fill-white"
                >
                  <path fill="none" d="M0 0h24v24H0z" />
                  <path d="M18 18v2H6v-2h12zm3-7v2H3v-2h18zm-3-7v2H6V4h12z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* profile dropdown  */}
        {mobieProfileDrop && (
          <MobileProfileDrop
            signer_address={signer_address}
            vnmBalance={vnmBalance}
            venomLogo={venomLogo}
            MintNFTStatus={MintNFTStatus}
            MintCollectionStatus={MintCollectionStatus}
            onDisconnect={onDisconnect}
            setMobieProfileDrop={setMobieProfileDrop}
          />
        )}

        {/* mobile nav dropdown  */}
        {mobileNavDrop && (
          <MobileNavbar
            searchValueState={searchValueState}
            search_result={search_result}
            set_search_result={set_search_result}
            handle_search={handle_search}
            onInput={onInput}
            setSearchValueState={setSearchValueState}
            showSearchNFTs={showSearchNFTs}
            searchNFTs={searchNFTs}
            searchCollections={searchCollections}
            showSearchCollections={showSearchCollections}
            isTyping={isTyping}
            searchLoading={searchLoading}
          />
        )}
      </div>
    </div>
  );
};

export default Navbar;
