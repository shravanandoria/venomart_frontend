import React, { useEffect, useState } from "react";
import CollectionCard from "../../components/cards/CollectionCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { get_collections } from "../../utils/mongo_api/collection/collection";
import { BsChevronDown, BsUiChecksGrid } from "react-icons/bs";
import { search_collections } from "../../utils/mongo_api/search";

const Collections = ({ theme, venomProvider }) => {
  const [collections, set_collections] = useState([]);
  const [skip, setSkip] = useState(0);

  const [loading, setLoading] = useState(false);
  const [filterCategories, openFilterCategories] = useState(false);
  const [filterSort, openFilterSort] = useState(false);

  const [isTyping, set_isTyping] = useState(true);
  const [query_search, set_query_search] = useState("");
  const [def_query, set_def_query] = useState(undefined);
  const [searchLoading, setSearchLoading] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);

  const scrollFetchCollections = async () => {
    setMoreLoading(true);
    const collectionsJSON = await get_collections(skip);
    set_collections([...collections, ...collectionsJSON]);
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
      set_collections(res.collections);
      set_isTyping(false);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    scrollFetchCollections();
  }, [skip]);

  return (
    <>
      <Head>
        <title>Top Collections - Venomart Marketplace</title>
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

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className={`${theme} dark:bg-jacarta-700 bg-white`} >
          <section className="relative py-24 dark:bg-jacarta-800 scroll-list" onScroll={handleScroll}>
            <div>
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore Collections
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing collections on venomart
                marketplace
              </p>

              {/* fliter div  */}
              <div className="hideAllFilterPhone">
                <div className="mb-8 mx-12 flex flex-wrap items-center justify-between">
                  <div className="relative flex flex-wrap items-center">
                    {/* cats filter  */}
                    <div className="my-1 mr-2.5">
                      <button
                        className="dropdown-toggle group group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 font-display text-sm font-semibold text-jacarta-700 transition-colors hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:bg-accent"
                        onClick={() => openFilterCategories(!filterCategories)}
                      >
                        <span>All Categories</span>
                        <BsChevronDown className="h-[15px] w-[15px] ml-4" />
                      </button>

                      {filterCategories && (
                        <div className="absolute dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                          <ul className="flex flex-col flex-wrap">
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  All Categories
                                </span>
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
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  Art
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  Collectibles
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  Games
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  Memes
                                </span>
                              </a>
                            </li>
                            <li>
                              <a
                                href="#"
                                className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                              >
                                <span className="text-jacarta-700 dark:text-white">
                                  Utility
                                </span>
                              </a>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* searchbar  */}
                    <div className="my-1 mr-2.5">
                      <form
                        action="search"
                        className="relative ml-12 mr-8 basis-3/12 xl:ml-[8%]"
                        onSubmit={(e) => e.preventDefault()}
                      >
                        <input
                          type="search"
                          onChange={(e) => handle_search(e.target.value)}
                          className="w-[275px] h-[38px] rounded-xl border border-jacarta-100 py-[0.1875rem] px-2 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                          placeholder="search for collections..."
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

                  {/* top volume filter  */}
                  <div className="dropdown relative my-1 cursor-pointer">
                    <div
                      className="dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                      onClick={() => openFilterSort(!filterSort)}
                    >
                      <span className="font-display text-jacarta-700 dark:text-white">
                        Top Volume
                      </span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-500 dark:fill-white"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                      </svg>
                    </div>

                    {filterSort && (
                      <div className="absolute dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                        <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                          Sort By
                        </span>
                        <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          Top Volume
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
                        </button>
                        <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          Trending
                        </button>
                        <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          Recently Created
                        </button>
                        <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                          Options
                        </span>
                        <div className="dropdown-item block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                          <span className="flex items-center justify-between">
                            <span>Verified Only</span>
                            <input
                              type="checkbox"
                              value="checkbox"
                              name="check"
                              checked
                              className="relative h-4 w-7 cursor-pointer appearance-none rounded-lg border-none bg-jacarta-100 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-jacarta-400 after:transition-all checked:bg-accent checked:bg-none checked:after:left-3.5 checked:after:bg-white checked:hover:bg-accent focus:ring-transparent focus:ring-offset-0 checked:focus:bg-accent"
                            />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
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
                      venomProvider={venomProvider}
                    />
                  ))}

                  {moreLoading &&
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    </div>
                  }

                  {collections?.length <= 0 && (
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
