import React, { useEffect, useState } from "react";
import NftCard from "../../components/cards/NftCard";
import Head from "next/head";
import Loader from "../../components/Loader";
import { fetch_nfts } from "../../utils/mongo_api/nfts/nfts";
import { BsChevronDown } from "react-icons/bs";
import { search_nfts } from "../../utils/mongo_api/search";

const NFTs = ({ theme }) => {
  const [loading, setLoading] = useState(false);
  const [skip, setSkip] = useState(0);

  const [collectionFilter, openCollectionFilter] = useState(false);
  const [filterCategories, openFilterCategories] = useState(false);
  const [filterSort, openFilterSort] = useState(false);
  const [query_search, set_query_search] = useState("");
  const [isTyping, set_isTyping] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [search_result, set_search_result] = useState([]);

  const [nfts, set_nfts] = useState([]);

  const scroll_get_all_nfts = async () => {
    const res = await fetch_nfts(skip);
    set_nfts([...nfts, ...res]);
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(nfts.length);
    }
  };

  const handle_search = async (data) => {
    // console.log(data);
    set_query_search(data);
    set_isTyping(true);
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || !query_search) return;
      setSearchLoading(true);
      const res = await search_nfts(query_search);
      console.log(res);
      setSearchLoading(false);
      set_search_result(res);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    scroll_get_all_nfts();
  }, [skip]);

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

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className={`${theme} scroll-list`} onScroll={handleScroll}>
          <section className="relative py-24 dark:bg-jacarta-800">
            <div>
              <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                Explore NFTs
              </h1>
              <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                Explore and trade the amazing NFTs on venomart marketplace
              </p>

              {/* fliter div  */}
              <div className="mb-8 mx-12 flex flex-wrap items-center justify-between">
                <div className="relative flex flex-wrap items-center">
                  {/* collections filter  */}
                  <div className="my-1 mr-2.5">
                    <button
                      className="dropdown-toggle group group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 font-display text-sm font-semibold text-jacarta-700 transition-colors hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:bg-accent"
                      onClick={() => openCollectionFilter(!collectionFilter)}
                    >
                      <span>All Collections</span>
                      <BsChevronDown className="h-[15px] w-[15px] ml-4" />
                    </button>

                    {collectionFilter && (
                      <div className="absolute dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                        <ul className="flex flex-col flex-wrap">
                          <li>
                            <a
                              href="#"
                              className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                            >
                              <span className="text-jacarta-700 dark:text-white">
                                All Collections
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
                                Rave
                              </span>
                            </a>
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>

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
                    >
                      <input
                        type="search"
                        // onFocus={() => set_search_result([])}
                        onChange={(e) => handle_search(e.target.value)}
                        className="w-[275px] h-[38px] rounded-xl border border-jacarta-100 py-[0.1875rem] px-2 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                        placeholder="search for nfts..."
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
                  </div>
                </div>

                {/* listed filter  */}
                <div className="dropdown relative my-1 cursor-pointer">
                  <div
                    className="dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                    onClick={() => openFilterSort(!filterSort)}
                  >
                    <span className="font-display text-jacarta-700 dark:text-white">
                      Recently Listed
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
                      <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                        Recently Listed
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
                        Price: Low to High
                      </button>
                      <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                        Price: High to Low
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div>
                  <div className="flex justify-center align-middle flex-wrap">
                    {nfts?.map((e, index) => {
                      return (
                        <NftCard
                          key={index}
                          ImageSrc={e?.nft_image?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          Name={e?.name}
                          Description={e?.description}
                          Address={e.NFTAddress}
                          tokenId={e?._id}
                          // listedBool={e?.isListed}
                        />
                      );
                    })}
                    {nfts?.length <= 0 && (
                      <h2 className="text-jacarta-700 dark:text-jacarta-200">
                        No NFTs Found
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
};

export default NFTs;
