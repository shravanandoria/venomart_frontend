import React, { useCallback, useEffect, useState } from "react";
import CollectionCard from "../../components/cards/CollectionCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { get_collections } from "../../utils/mongo_api/collection/collection";
import { BsChevronDown } from "react-icons/bs";
import { search_collections } from "../../utils/mongo_api/search";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";

const Collections = ({ theme }) => {
  const [collections, set_collections] = useState([]);
  const [skip, setSkip] = useState(0);

  const [category, setCategory] = useState("All");
  const [sortby, setSortBy] = useState("topVolume");
  // for verified fetch 
  const [option, setOption] = useState("unverified");
  const [verifiedCheck, setVerifiedCheck] = useState(false);

  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);

  const [loading, setLoading] = useState(false);

  const [filterCategories, openFilterCategories] = useState(false);
  const [filterSort, openFilterSort] = useState(false);

  const [isTyping, set_isTyping] = useState(true);
  const [query_search, set_query_search] = useState("");
  const [def_query, set_def_query] = useState(undefined);
  const [searchLoading, setSearchLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [mobileFilter, openMobileFilter] = useState(true);

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

  const scrollFetchCollections = async () => {
    setMoreLoading(true);
    const collectionsJSON = await get_collections(category, sortby, option, skip);
    if (collectionsJSON) {
      set_collections([...collections, ...collectionsJSON]);
    }
    setMoreLoading(false);
  };

  const filterFetchCollections = async () => {
    if (defaultFilterFetch == false) return;
    setMoreLoading(true);
    const collectionsJSON = await get_collections(category, sortby, option, skip);
    if (collectionsJSON) {
      set_collections(collectionsJSON);
    }
    setMoreLoading(false);
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(collections.length);
    }
  };

  const handle_search = async (data) => {
    setSearchLoading(true);
    set_query_search(data);
    set_isTyping(true);
    set_def_query("");
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || def_query == undefined) return;
      setSearchLoading(true);
      const res = await search_collections(query_search);
      if (res) {
        set_collections(res.collections);
      }
      set_isTyping(false);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    scrollFetchCollections();
  }, [skip]);

  useEffect(() => {
    filterFetchCollections();
  }, [sortby, option, category]);

  useEffect(() => {
    if (filterCategories || filterSort) {
      document.body.addEventListener('click', () => {
        openFilterCategories(false)
        openFilterSort(false)
      })
    }
  }, [filterCategories, filterSort])

  return (
    <>
      <Head>
        <title>Top Collections - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore Exclusive NFT Collections on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className={`${theme} dark:bg-jacarta-900 bg-white`} >
          <section className="relative py-24 dark:bg-jacarta-900 scroll-list" onScroll={handleScroll}>
            <div>
              <h1 className="pt-16 px-2 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore Collections
              </h1>
              <p className=" pt-2 px-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing collections on venomart
                marketplace
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
                    <button onClick={() => openMobileFilter(false)} className="absolute top-[-10px] right-4 z-20">
                      <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                    </button>
                  }
                  {mobileFilter &&
                    <div className="collectionFilterDivExplore">
                      <div className="collectionFiltersExplore">
                        {/* cats filter  */}
                        <div className="typeModelMainDiv relative my-1 mx-2">
                          <button
                            className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            onClick={(e) => (e.stopPropagation(), openFilterSort(false), openFilterCategories(!filterCategories))}
                          >
                            {category == "All" &&
                              <span className="text-jacarta-700 dark:text-white">All Categories</span>
                            }
                            {category == "Art" &&
                              <span className="text-jacarta-700 dark:text-white">Art</span>
                            }
                            {category == "Collectibles" &&
                              <span className="text-jacarta-700 dark:text-white">Collectibles</span>
                            }
                            {category == "Games" &&
                              <span className="text-jacarta-700 dark:text-white">Games</span>
                            }
                            {category == "Memes" &&
                              <span className="text-jacarta-700 dark:text-white">Memes</span>
                            }
                            {category == "Utility" &&
                              <span className="text-jacarta-700 dark:text-white">Utility</span>
                            }
                            <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                          </button>

                          {filterCategories && (
                            <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                              <ul className="flex flex-col flex-wrap">
                                <li>
                                  <button
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("All"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      All Categories
                                    </span>
                                    {category == "All" &&
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
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Art"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Art
                                    </span>
                                    {category == "Art" &&
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
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Collectibles"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Collectibles
                                    </span>
                                    {category == "Collectibles" &&
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
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Games"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Games
                                    </span>
                                    {category == "Games" &&
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
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Memes"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Memes
                                    </span>
                                    {category == "Memes" &&
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
                                    onClick={() => (setSkip(0), openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Utility"))}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    <span className="text-jacarta-700 dark:text-white">
                                      Utility
                                    </span>
                                    {category == "Utility" &&
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

                        {/* top volume filter  */}
                        <div className="typeModelMainDiv relative my-1 mx-2 cursor-pointer">
                          <button
                            className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            onClick={(e) => (e.stopPropagation(), openFilterCategories(false), openFilterSort(!filterSort))}
                          >
                            {sortby == "topVolume" &&
                              <span className="text-jacarta-700 dark:text-white">
                                Top Volume
                              </span>
                            }
                            {sortby == "trending" &&
                              <span className="text-jacarta-700 dark:text-white">
                                Trending
                              </span>
                            }
                            {sortby == "recentlyCreated" &&
                              <span className="text-jacarta-700 dark:text-white">
                                Recently Created
                              </span>
                            }
                            <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                          </button>

                          {filterSort && (
                            <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                              <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                Sort By
                              </span>
                              <button onClick={() => (setSkip(0), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("topVolume"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                Top Volume
                                {sortby == "topVolume" &&
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
                              <button onClick={() => (setSkip(0), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("trending"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                Trending
                                {sortby == "trending" &&
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
                              <button onClick={() => (setSkip(0), openFilterSort(false), setDefaultFilterFetch(true), setSortBy("recentlyCreated"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                Recently Created
                                {sortby == "recentlyCreated" &&
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
                                    value="checkbox"
                                    defaultChecked={verifiedCheck}
                                    onChange={() => (verifiedCheck ? (setSkip(0), setVerifiedCheck(false), setDefaultFilterFetch(true), setOption("unverified")) : (setSkip(0), setVerifiedCheck(true), setOption("verified")))}
                                    className="relative h-4 w-7 cursor-pointer appearance-none rounded-lg border-none bg-jacarta-100 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-jacarta-400 after:transition-all checked:bg-accent checked:bg-none checked:after:left-3.5 checked:after:bg-white checked:hover:bg-accent focus:ring-transparent focus:ring-offset-0 checked:focus:bg-accent"
                                  />
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* searchbar  */}
                      <div className="collectionSearchExplore">
                        <form
                          action="search"
                          className="relative w-[60%]"
                          onSubmit={(e) => e.preventDefault()}
                        >
                          <input
                            type="search"
                            onChange={(e) => handle_search((e.target.value).replace(/[^\w\s]/gi, ""))}
                            className="w-[90%] h-[38px] rounded-xl border border-jacarta-100 py-[0.1875rem] px-2 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                            placeholder="search"
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
                        </form>
                      </div>
                    </div>
                  }
                </div>
              </div>

              {/* loop collections here  */}
              {searchLoading ?
                <div className="flex items-center justify-center space-x-2 mt-[200px]">
                  <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                  <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                  <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                </div>
                :
                <div className="flex justify-center align-middle flex-wrap">
                  {collections?.map((e, index) => (
                    <CollectionCard
                      key={index}
                      Cover={e?.coverImage}
                      Logo={e?.logo}
                      Name={e?.name}
                      Description={e?.description}
                      OwnerAddress={e?.OwnerAddress}
                      CollectionAddress={e?.contractAddress}
                      verified={e?.isVerified}
                      Listing={e?.TotalListed}
                      Volume={e?.TotalVolume}
                      FloorPrice={e?.FloorPrice}
                      TotalSupply={e?.TotalSupply}
                    />
                  ))}

                  {moreLoading &&
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    </div>
                  }

                  {((collections?.length <= 0) && !moreLoading) && (
                    <h2 className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                      No Collections Found
                    </h2>
                  )}
                </div>
              }
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default Collections;
