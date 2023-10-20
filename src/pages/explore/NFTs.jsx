import React, { useCallback, useEffect, useState } from "react";
import NftCard from "../../components/cards/NftCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { fetch_nfts } from "../../utils/mongo_api/nfts/nfts";
import { BsChevronDown, BsFillExclamationCircleFill } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import Link from "next/link";
import Image from "next/image";
import { get_collections } from "../../utils/mongo_api/collection/collection";
import { MdVerified } from "react-icons/md";
import { search_collections } from "../../utils/mongo_api/search";
import { buy_nft, cancel_listing } from "../../utils/user_nft";
import BuyModal from "../../components/modals/BuyModal";
import CancelModal from "../../components/modals/CancelModal";
import InfiniteScroll from "react-infinite-scroll-component";
import SuccessModal from "../../components/modals/SuccessModal";

const NFTs = ({ theme, venomProvider, standalone, signer_address, setAnyModalOpen, cartNFTs, setCartNFTs, vnmBalance, connectWallet }) => {
  const [loading, setLoading] = useState(false);
  const [actionLoad, setActionLoad] = useState(false);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);


  const [collectionFilter, openCollectionFilter] = useState(false);
  const [filterCategories, openFilterCategories] = useState(false);
  const [priceRangeFilter, openPriceRangeFilter] = useState(false);

  const [filterSort, openFilterSort] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(false);
  const [mobileFilter, openMobileFilter] = useState(true);
  const [searchedCollectionBefore, setSearchedCollectionBefore] = useState(false);

  const [selectedNFT, setSelectedNFT] = useState("");
  const [buyModal, setBuyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);

  const [collectionSearchINP, setCollectionSearchINP] = useState("");

  const [filterCollection, setFilterCollection] = useState("All");
  const [collectionCategory, setCollectionCategory] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);
  const [sortby, setSortBy] = useState("recentlyListed");
  // for verified fetch 
  const [option, setOption] = useState("verified");
  const [verifiedCheck, setVerifiedCheck] = useState(true);
  // for nsfw fetch 
  const [NSFW, setNSFW] = useState(false);
  const [NSFWCheck, setNSFWCheck] = useState(false);

  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);

  const [nfts, set_nfts] = useState([]);
  const [collections, set_collections] = useState([]);

  const [isTyping, set_isTyping] = useState(true);
  const [query_search, set_query_search] = useState("");
  const [def_query, set_def_query] = useState(undefined);
  const [transactionType, setTransactionType] = useState("");

  // mediaQuery 
  const useMediaQuery = (width) => {
    const [targetReached, setTargetReached] = useState(false);

    const updateTarget = useCallback((e) => {
      if (e.matches) {
        setTargetReached(true);
        openMobileFilter(false);
      } else {
        setTargetReached(false);
        openMobileFilter(true);
      }
    }, []);

    useEffect(() => {
      const media = window.matchMedia(`(max-width: ${width}px)`);
      media.addListener(updateTarget);

      // Check on mount (callback is not called until a change occurs)
      if (media.matches) {
        setTargetReached(true);
        openMobileFilter(false);
      }

      return () => media.removeListener(updateTarget);
    }, []);

    return targetReached;
  };

  const isBreakpoint = useMediaQuery(800);

  const scroll_get_all_nfts = async () => {
    setMoreLoading(true);
    const res = await fetch_nfts(filterCollection, signer_address, collectionCategory, minPrice, maxPrice, sortby, option, NSFW, skip);
    if (res) {
      set_nfts([...nfts, ...res]);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setMoreLoading(false);
  };

  const fetch_nfts_success = async () => {
    setMoreLoading(true);
    const res = await fetch_nfts(filterCollection, signer_address, collectionCategory, minPrice, maxPrice, sortby, option, NSFW, skip);
    if (res) {
      set_nfts(res);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setMoreLoading(false);
  };

  const fetch_filter_nfts = async () => {
    if (defaultFilterFetch == false) return;
    setMoreLoading(true);
    const res = await fetch_nfts(filterCollection, signer_address, collectionCategory, minPrice, maxPrice, sortby, option, NSFW, skip);
    if (res) {
      set_nfts(res);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setMoreLoading(false);
  };

  const clear_filter_nfts = async () => {
    if (defaultFilterFetch == false) return;
    setMoreLoading(true);
    const res = await fetch_nfts(filterCollection, signer_address, collectionCategory, 0, 0, sortby, option, NSFW, skip);
    if (res) {
      set_nfts(res);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setMoreLoading(false);
  };

  const fetch_search_collections = async () => {
    if (searchedCollectionBefore == true) return;
    setCollectionLoading(true);
    const res = await get_collections("All", "topVolume", "verified", 0);
    if (res) {
      set_collections(res);
    }
    setCollectionLoading(false);
  };

  // connecting wallet 
  const connect_wallet = async () => {
    const connect = await connectWallet();
  };

  // buy nft
  const buy_NFT_ = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connect_wallet();
      return;
    }
    if (parseFloat(vnmBalance) <= selectedNFT.listingPrice) {
      alert("You do not have sufficient venom tokens to buy this NFT!!")
      return;
    }
    setActionLoad(true);
    let royaltyFinalAmount =
      ((parseFloat(selectedNFT?.demandPrice) *
        parseFloat(
          selectedNFT?.NFTCollection?.royalty ? selectedNFT?.NFTCollection?.royalty : 0
        )) /
        100) *
      1000000000;
    try {
      const buying = await buy_nft(
        venomProvider,
        standalone,
        selectedNFT?.ownerAddress,
        selectedNFT?.managerAddress,
        selectedNFT?.NFTAddress,
        selectedNFT?.NFTCollection?.contractAddress,
        selectedNFT.listingPrice,
        (selectedNFT.listingPrice * 1000000000).toString(),
        signer_address,
        royaltyFinalAmount,
        selectedNFT?.NFTCollection?.royaltyAddress
          ? selectedNFT?.NFTCollection?.royaltyAddress
          : "0:0000000000000000000000000000000000000000000000000000000000000000",
        selectedNFT?.FloorPrice
      );

      if (buying == true) {
        setActionLoad(false);
        setBuyModal(false);
        setTransactionType("Sale");
        setSuccessModal(true);
      }
      if (buying == false) {
        setActionLoad(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // cancel nft sale
  const cancelNFT = async (e) => {
    e.preventDefault();
    setActionLoad(true);
    try {
      const cancelling = await cancel_listing(
        standalone,
        selectedNFT?.ownerAddress,
        selectedNFT?.managerAddress,
        selectedNFT?.NFTAddress,
        selectedNFT?.NFTCollection?.contractAddress,
        venomProvider,
        signer_address,
        selectedNFT?.FloorPrice
      );
      if (cancelling == true) {
        setActionLoad(false);
        setCancelModal(false);
        setTransactionType("Cancel");
        setSuccessModal(true);
      }
      if (cancelling == false) {
        setActionLoad(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handle_search = async (data) => {
    setCollectionLoading(true);
    set_query_search(data);
    set_isTyping(true);
    set_def_query("");
  };

  const handleScroll = () => {
    setSkip(nfts.length);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || def_query == undefined) return;
      setCollectionLoading(true);
      const res = await search_collections(query_search);
      if (res) {
        set_collections(res.collections);
      }
      set_isTyping(false);
      setCollectionLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    scroll_get_all_nfts();
  }, [skip]);

  useEffect(() => {
    fetch_filter_nfts();
  }, [sortby, option, collectionCategory, filterCollection, NSFW]);

  useEffect(() => {
    if (collectionFilter || filterCategories || priceRangeFilter || filterSort) {
      document.body.addEventListener('click', () => {
        openCollectionFilter(false)
        openFilterCategories(false)
        openPriceRangeFilter(false)
        openFilterSort(false)
      })
    }
  }, [collectionFilter, filterCategories, priceRangeFilter, filterSort])

  return (
    <>
      <Head>
        <title>Explore NFTs - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {buyModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {cancelModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {successModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className={`${theme}`}>
          <section className="relative py-24 dark:bg-jacarta-900">
            <div>
              <h1 className="pt-16 px-2 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore NFTs🎨
              </h1>
              <p className=" pt-2 px-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing NFTs on venomart marketplace
              </p>

              {/* fliter div  */}
              <div className="stickyFilterDivExplore bg-white dark:bg-jacarta-900">
                <div className="collectionFilterDivExplore bg-white dark:bg-jacarta-900 p-4">
                  {!mobileFilter && isBreakpoint &&
                    <div className="typeModelMainDiv flex justify-center align-middle relative my-1 mr-2.5 mb-4">
                      <button
                        onClick={() => openMobileFilter(true)}
                        className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                      >
                        <div className="flex justify-center align-middle">
                          <AiFillFilter className="mr-1 mt-[2px] h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                          <span className="text-jacarta-700 dark:text-white">Edit Filters</span>
                        </div>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className=" h-4 w-4 fill-jacarta-500 dark:fill-white"
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                        </svg>
                      </button>
                    </div>
                  }
                  {mobileFilter && isBreakpoint &&
                    <button onClick={() => openMobileFilter(false)} className="absolute top-3 right-2 z-20">
                      <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                    </button>
                  }
                  {mobileFilter &&
                    <div className="collectionFilterDivExplore">
                      <div className="collectionFiltersExplore">
                        {/* collections filter  */}
                        <div className="typeModelMainDiv relative my-1 mr-2.5">
                          <button
                            className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            onClick={(e) => (e.stopPropagation(), fetch_search_collections(), setSearchedCollectionBefore(true), openFilterSort(false), openFilterCategories(false), openPriceRangeFilter(false), openCollectionFilter(!collectionFilter))}
                          >
                            <span className=" text-jacarta-700 dark:text-white">All Collections</span>
                            <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                          </button>

                          {collectionFilter && (
                            <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                              <form
                                action="search"
                                className="flex justify-center align-middle relative w-[100%]"
                                onSubmit={(e) => e.preventDefault()}
                              >
                                <input
                                  type="search"
                                  value={collectionSearchINP}
                                  onChange={(e) => handle_search(e.target.value)}
                                  className="w-[90%] h-[38px] rounded-xl border border-jacarta-100 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                  style={{ paddingLeft: "27px", paddingRight: "30px" }}
                                  placeholder="search"
                                />
                                <span className="searchCollectionSvg absolute left-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
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
                                {collectionSearchINP != "" && (
                                  <span className="absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
                                    <RxCrossCircled
                                      onClick={() => (
                                        handle_search(""),
                                        setCollectionSearchINP(""),
                                        setFilterCollection("All")
                                      )}
                                      className="h-5 w-5 text-jacarta-500 dark:text-white cursor-pointer"
                                    />
                                  </span>
                                )}
                              </form>

                              <ul className="collectionFilterDivWebkit flex flex-col h-[300px] overflow-y-scroll mt-2">
                                {/* loop here  */}
                                {!collectionLoading &&
                                  (collections?.map((e, index) => {
                                    return (
                                      <li key={index} onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setFilterCollection(e?._id), setCollectionSearchINP(e?.name))}>
                                        <Link href="#" className="dropdown-item flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                          <span className="relative text-jacarta-700 dark:text-white">
                                            <Image
                                              src={e?.logo.replace("ipfs://", "https://ipfs.io/ipfs/")}
                                              height={100}
                                              width={100}
                                              alt={e?.name}
                                              className="h-[30px] w-[30px] rounded-[50%]"
                                            />
                                            {e?.isVerified ?
                                              <MdVerified style={{ color: "#4f87ff", position: "absolute", bottom: "-3px", right: "-4px" }}
                                                size={14} />
                                              :
                                              <BsFillExclamationCircleFill style={{ color: "#c3c944", position: "absolute", bottom: "-3px", right: "-4px" }}
                                                size={13} />
                                            }
                                          </span>
                                          <span className="text-[13px] ml-[6px] font-normal text-jacarta-700 dark:text-white" style={{
                                            width: "150px",
                                            whiteSpace: "nowrap",
                                            textOverflow: "ellipsis",
                                            overflow: "hidden",
                                          }}>
                                            {e?.name}
                                          </span>
                                        </Link>
                                      </li>
                                    )
                                  }))}

                                {collectionLoading &&
                                  <div className="flex items-center justify-center space-x-2 mt-4">
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                  </div>
                                }
                                {collections.length <= 0 && !collectionLoading &&
                                  <div className="flex items-center justify-center space-x-2 mt-4">
                                    <p className=" text-jacarta-700 dark:text-white">No collections found!</p>
                                  </div>
                                }
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* cats filter  */}
                        <div className="typeModelMainDiv relative my-1 mr-2.5">
                          <button
                            className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            onClick={(e) => (e.stopPropagation(), openCollectionFilter(false), openPriceRangeFilter(false), openFilterSort(false), openFilterCategories(!filterCategories))}
                          >
                            {collectionCategory == "All" &&
                              <span className="text-jacarta-700 dark:text-white">All Categories</span>
                            }
                            {collectionCategory == "Art" &&
                              <span className="text-jacarta-700 dark:text-white">Art</span>
                            }
                            {collectionCategory == "Collectibles" &&
                              <span className="text-jacarta-700 dark:text-white">Collectibles</span>
                            }
                            {collectionCategory == "Games" &&
                              <span className="text-jacarta-700 dark:text-white">Games</span>
                            }
                            {collectionCategory == "Memes" &&
                              <span className="text-jacarta-700 dark:text-white">Memes</span>
                            }
                            {collectionCategory == "Utility" &&
                              <span className="text-jacarta-700 dark:text-white">Utility</span>
                            }
                            <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                          </button>

                          {filterCategories && (
                            <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                              <ul className="flex flex-col flex-wrap">
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("All"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      All Categories
                                    </span>
                                    {collectionCategory == "All" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("Art"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Art
                                    </span>
                                    {collectionCategory == "Art" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("Collectibles"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Collectibles
                                    </span>
                                    {collectionCategory == "Collectibles" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("Games"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Games
                                    </span>
                                    {collectionCategory == "Games" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("Memes"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Memes
                                    </span>
                                    {collectionCategory == "Memes" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), setHasMore(true), openFilterCategories(false), setDefaultFilterFetch(true), setCollectionCategory("Utility"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Utility
                                    </span>
                                    {collectionCategory == "Utility" &&
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        viewBox="0 0 24 24"
                                        width="24"
                                        height="24"
                                        className="mb-[3px] h-4 w-4 fill-accent"
                                      >
                                        <path fill="none" d="M0 0h24v24H0z"></path>
                                        <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                      </svg>
                                    }
                                  </button>
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* price range  */}
                        <div className="typeModelMainDiv relative my-1 mr-2.5">
                          <button
                            onClick={(e) => (
                              e.stopPropagation(),
                              openCollectionFilter(false),
                              openFilterCategories(false),
                              openFilterSort(false),
                              openPriceRangeFilter(!priceRangeFilter)
                            )}
                            className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                          >
                            <div className="flex justify-center align-middle">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="mr-1 mt-[2px] h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100"
                              >
                                <path fill="none" d="M0 0h24v24H0z" />
                                <path d="M17 16h2V4H9v2h8v10zm0 2v3c0 .552-.45 1-1.007 1H4.007A1.001 1.001 0 0 1 3 21l.003-14c0-.552.45-1 1.007-1H7V3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-3zM5.003 8L5 20h10V8H5.003zM7 16h4.5a.5.5 0 1 0 0-1h-3a2.5 2.5 0 1 1 0-5H9V9h2v1h2v2H8.5a.5.5 0 1 0 0 1h3a2.5 2.5 0 1 1 0 5H11v1H9v-1H7v-2z" />
                              </svg>
                              <span className="text-jacarta-700 dark:text-white">All Price Range</span>
                            </div>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className=" h-4 w-4 fill-jacarta-500 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                            </svg>
                          </button>

                          {priceRangeFilter && (
                            <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                              <div className="flex items-center space-x-3 px-5 pb-2">
                                <input
                                  type="number"
                                  placeholder="From"
                                  min="0"
                                  onInput={(e) => e.target.value = Math.abs(e.target.value)}
                                  // value={minPrice}
                                  onChange={(e) => (setDefaultFilterFetch(true), setSkip(0), setHasMore(true), setMinPrice(parseFloat(e.target.value)))}
                                  className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                />
                                <input
                                  type="number"
                                  placeholder="To"
                                  min="0"
                                  onInput={(e) => e.target.value = Math.abs(e.target.value)}
                                  // value={maxPrice}
                                  onChange={(e) => (setDefaultFilterFetch(true), setSkip(0), setHasMore(true), setMaxPrice(parseFloat(e.target.value)))}
                                  className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                />
                              </div>

                              <div className="-ml-2 -mr-2 mt-4 flex items-center justify-center space-x-3 border-t border-jacarta-100 px-7 pt-4 dark:border-jacarta-600">
                                <button
                                  type="button"
                                  onClick={() => (setMaxPrice(0), setMinPrice(0), clear_filter_nfts(), openPriceRangeFilter(false))}
                                  className="flex-1 rounded-full bg-white py-2 px-6 text-center text-sm font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                >
                                  Clear
                                </button>
                                <button
                                  type="button"
                                  onClick={() => (fetch_filter_nfts(), openPriceRangeFilter(false))}
                                  className="flex-1 rounded-full bg-accent py-2 px-6 text-center text-sm font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                >
                                  Apply
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* listed filter  */}
                      <div className="recentlyListedFilterExplore typeModelMainDiv relative my-1 mr-2.5">
                        <button
                          className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                          onClick={(e) => (e.stopPropagation(), openCollectionFilter(false), openPriceRangeFilter(false), openFilterCategories(false), openFilterSort(!filterSort))}
                        >
                          {sortby == "recentlyListed" &&
                            <span className=" text-jacarta-700 dark:text-white">
                              Recently Listed
                            </span>
                          }
                          {sortby == "recentlySold" &&
                            <span className=" text-jacarta-700 dark:text-white">
                              Recently Sold
                            </span>
                          }
                          {sortby == "ownedBy" &&
                            <span className="text-jacarta-700 dark:text-white">
                              Owned By You
                            </span>
                          }
                          {sortby == "lowToHigh" &&
                            <span className="text-jacarta-700 dark:text-white">
                              Price: Low To High
                            </span>
                          }
                          {sortby == "highToLow" &&
                            <span className="text-jacarta-700 dark:text-white">
                              Price: High To Low
                            </span>
                          }
                          <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                        </button>

                        {filterSort && (
                          <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                            <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                              Sort By
                            </span>
                            <button onClick={() => (setSkip(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("recentlyListed"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Recently Listed
                              {sortby == "recentlyListed" &&
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mb-[3px] h-4 w-4 fill-accent"
                                >
                                  <path fill="none" d="M0 0h24v24H0z" />
                                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                                </svg>
                              }
                            </button>
                            <button onClick={() => (setSkip(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("recentlySold"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Recently Sold
                              {sortby == "recentlySold" &&
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mb-[3px] h-4 w-4 fill-accent"
                                >
                                  <path fill="none" d="M0 0h24v24H0z" />
                                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                                </svg>
                              }
                            </button>
                            <button onClick={() => (setSkip(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("ownedBy"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Owned By You
                              {sortby == "ownedBy" &&
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mb-[3px] h-4 w-4 fill-accent"
                                >
                                  <path fill="none" d="M0 0h24v24H0z" />
                                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                                </svg>
                              }
                            </button>
                            <button onClick={() => (setSkip(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("lowToHigh"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Price: Low to High
                              {sortby == "lowToHigh" &&
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mb-[3px] h-4 w-4 fill-accent"
                                >
                                  <path fill="none" d="M0 0h24v24H0z" />
                                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                                </svg>
                              }
                            </button>
                            <button onClick={() => (setSkip(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("highToLow"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              Price: High to Low
                              {sortby == "highToLow" &&
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  width="24"
                                  height="24"
                                  className="mb-[3px] h-4 w-4 fill-accent"
                                >
                                  <path fill="none" d="M0 0h24v24H0z" />
                                  <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z" />
                                </svg>
                              }
                            </button>
                            <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                              Options
                            </span>
                            <div className="dropdown-item block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              <span className="flex items-center justify-between">
                                <span className="text-jacarta-700 dark:text-white">Verified Only</span>
                                <input
                                  type="checkbox"
                                  defaultChecked={verifiedCheck ? true : false}
                                  onChange={() => (verifiedCheck ? (setSkip(0), setHasMore(true), setVerifiedCheck(false), setDefaultFilterFetch(true), setOption("unverified")) : (setSkip(0), setHasMore(true), setVerifiedCheck(true), setOption("verified")))}
                                  className="relative h-4 w-7 cursor-pointer appearance-none rounded-lg border-none bg-jacarta-100 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-jacarta-400 after:transition-all checked:bg-accent checked:bg-none checked:after:left-3.5 checked:after:bg-white checked:hover:bg-accent focus:ring-transparent focus:ring-offset-0 checked:focus:bg-accent"
                                />
                              </span>
                            </div>
                            <div className="dropdown-item block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                              <span className="flex items-center justify-between">
                                <span className="text-jacarta-700 dark:text-white">Show NSFW</span>
                                <input
                                  type="checkbox"
                                  defaultChecked={NSFWCheck ? true : false}
                                  onChange={() => (NSFWCheck ? (setSkip(0), setHasMore(true), setNSFWCheck(false), setDefaultFilterFetch(true), setNSFW(false)) : (setSkip(0), setHasMore(true), setNSFWCheck(true), setNSFW(true)))}
                                  className="relative h-4 w-7 cursor-pointer appearance-none rounded-lg border-none bg-jacarta-100 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-jacarta-400 after:transition-all checked:bg-accent checked:bg-none checked:after:left-3.5 checked:after:bg-white checked:hover:bg-accent focus:ring-transparent focus:ring-offset-0 checked:focus:bg-accent"
                                />
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  }
                </div>
              </div>

              <div>
                <div>
                  <div className="flex justify-center align-middle flex-wrap">
                    <InfiniteScroll
                      dataLength={nfts ? nfts?.length : 0}
                      next={handleScroll}
                      hasMore={hasMore}
                      className="flex flex-wrap justify-center align-middle"
                      loader={
                        <div className="flex items-center justify-center space-x-2">
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        </div>
                      }
                    >
                      {nfts?.map((e, index) => {
                        return (
                          <NftCard
                            key={index}
                            ImageSrc={e?.nft_image?.replace(
                              "ipfs://",
                              "https://ipfs.io/ipfs/"
                            )}
                            Name={e?.name}
                            Address={e.NFTAddress}
                            Owner={e?.ownerAddress}
                            signerAddress={signer_address}
                            tokenId={e?._id}
                            listedBool={e?.isListed}
                            listingPrice={e?.listingPrice}
                            NFTCollectionAddress={
                              e?.NFTCollection?.contractAddress
                            }
                            NFTCollectionName={e?.NFTCollection?.name}
                            NFTCollectionStatus={e?.NFTCollection?.isVerified}
                            setAnyModalOpen={setAnyModalOpen}
                            setBuyModal={setBuyModal}
                            setCancelModal={setCancelModal}
                            NFTData={e}
                            setSelectedNFT={setSelectedNFT}
                            cartNFTs={cartNFTs}
                            setCartNFTs={setCartNFTs}
                          />
                        );
                      })}
                    </InfiniteScroll>

                    {nfts?.length <= 0 && !moreLoading && (
                      <h2 className="text-jacarta-700 dark:text-jacarta-200 py-12">
                        No NFTs Found
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            </div>

          </section>
          {/* buy modal  */}
          {buyModal && (
            <BuyModal
              formSubmit={buy_NFT_}
              setBuyModal={setBuyModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={selectedNFT?.nft_image}
              NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
              NFTCollectionName={selectedNFT?.NFTCollection?.name}
              CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
              NFTName={selectedNFT?.name}
              NFTListingPrice={selectedNFT?.listingPrice}
              actionLoad={actionLoad}
            />
          )}

          {/* cancel modal  */}
          {cancelModal && (
            <CancelModal
              formSubmit={cancelNFT}
              setCancelModal={setCancelModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={selectedNFT?.nft_image}
              NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
              NFTCollectionName={selectedNFT?.NFTCollection?.name}
              CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
              NFTName={selectedNFT?.name}
              actionLoad={actionLoad}
            />
          )}

          {/* success modal  */}
          {successModal && (
            <SuccessModal
              setSuccessModal={setSuccessModal}
              setAnyModalOpen={setAnyModalOpen}
              onCloseFunctionCall={fetch_nfts_success}
              TransactionType={transactionType}
              NFTImage={selectedNFT?.nft_image}
              NFTAddress={selectedNFT?.NFTAddress}
              NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
              NFTCollectionName={selectedNFT?.NFTCollection?.name}
              CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
              NFTListingPrice={selectedNFT?.listingPrice}
              NFTName={selectedNFT?.name}
              actionLoad={actionLoad}
            />
          )}
        </div>
      )}
    </>
  );
};

export default NFTs;

