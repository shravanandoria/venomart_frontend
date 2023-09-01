import CollectionRankingCard from "../../components/cards/CollectionRankingCard";
import Head from "next/head";
import React, { useEffect } from "react";
import { get_collections } from "../../utils/mongo_api/collection/collection";

const Rankings = ({
  theme,
  topCollections,
  setTopCollections,
  venomProvider,
}) => {
  const fetchTopCollections = async () => {
    const topCollections = await get_collections(0);
    if (topCollections) {
      setTopCollections(topCollections);
    }
  };

  useEffect(() => {
    fetchTopCollections();
  }, []);

  return (
    <section className={`${theme}`}>
      <Head>
        <title>Rankings - Venomart Marketplace</title>
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

      <div className={`relative py-24 dark:bg-jacarta-800`}>
        <div className="container">
          <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
            Rankings
          </h1>
          <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
            Top Collections ranked by volume, floor price and more
          </p>
          {/* filter  */}
          <div className="hideAllFilterPhone">
            <div className="mb-8 flex flex-wrap items-center justify-between">
              {/* categories filter  */}
              <div className="flex flex-wrap items-center">
                <div className="my-1 mr-2.5">
                  <button
                    className="dropdown-toggle group group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 font-display text-sm font-semibold text-jacarta-700 transition-colors hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:bg-accent"
                    id="blockchainFilter"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="mr-1 h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M20 16h2v6h-6v-2H8v2H2v-6h2V8H2V2h6v2h8V2h6v6h-2v8zm-2 0V8h-2V6H8v2H6v8h2v2h8v-2h2zM4 4v2h2V4H4zm0 14v2h2v-2H4zM18 4v2h2V4h-2zm0 14v2h2v-2h-2z" />
                    </svg>
                    <span>All Categories</span>
                  </button>
                  <div
                    className="dropdown-menu z-10 hidden min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                    aria-labelledby="blockchainFilter"
                  >
                    <ul className="flex flex-col flex-wrap">
                      <li>
                        <a
                          href="#"
                          className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          <span className="text-jacarta-700 dark:text-white">
                            NFTs
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
                    </ul>
                  </div>
                </div>
              </div>

              {/* days filter  */}
              <div className="dropdown relative my-1 cursor-pointer">
                <div
                  className="dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700  text-jacarta-700 dark:text-jacarta-200"
                >
                  <span className="font-display">All Time</span>
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

                <div
                  className="dropdown-menu z-10 hidden w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                  aria-labelledby="sortOrdering"
                >
                  <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50  text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                    Last 7 Days
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
                  <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                    Last 14 Days
                  </button>
                  <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                    Last 30 Days
                  </button>
                  <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50  text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                    All Time
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="scrollbar-custom overflow-x-auto">
            <div className="w-full min-w-[736px] border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white lg:rounded-2lg">
              <div
                className="flex rounded-t-2lg bg-jacarta-50 dark:bg-jacarta-600"
                role="row"
              >
                <div className="w-[28%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Collection
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Volume
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    7D %
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Royalty %
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Floor Price
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Listings
                  </span>
                </div>
                <div className="w-[12%] py-3 px-4" role="columnheader">
                  <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                    Items
                  </span>
                </div>
              </div>

              {/* loop all the collections here  */}

              {topCollections?.map(
                (e, index) =>
                  e?.name != undefined && (
                    <CollectionRankingCard
                      key={index}
                      id={index + 1}
                      Logo={e?.logo}
                      Name={e?.name}
                      OwnerAddress={e?.creatorAddress}
                      contractAddress={e?.contractAddress}
                      theme={theme}
                      isVerified={e?.isVerified}
                      Royalty={e?.royalty}
                      Volume={e?.TotalVolume}
                      Floor={e?.FloorPrice}
                      Listings={e?.TotalListed}
                      totalSupply={e?.TotalSupply}
                    />
                  )
              )}
              {topCollections?.length <= 0 && (
                <h2 className="text-center p-4">Coming soon..</h2>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Rankings;
