import React, { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import LaunchCollectionCard from "../../components/cards/LaunchCollectionCard";
import InfiniteScroll from "react-infinite-scroll-component";
import { get_launchpad_events } from "../../utils/mongo_api/launchpad/launchpad";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";

const Launchpad = ({ theme, OtherImagesBaseURI }) => {

  const [collections, set_collections] = useState([]);
  const [skip, setSkip] = useState(0);
  const [sortby, setSortBy] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);
  const [mobileFilter, openMobileFilter] = useState(true);

  // mediaQuery
  const useMediaQuery = width => {
    const [targetReached, setTargetReached] = useState(false);

    const updateTarget = useCallback(e => {
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

  const fetchChangedCollections = async () => {
    if (defaultFilterFetch == false) return;
    const collectionsJSON = await get_launchpad_events(sortby, skip);
    if (collectionsJSON) {
      set_collections(collectionsJSON);
      if (collectionsJSON == "" || collectionsJSON == undefined) {
        setHasMore(false);
      }
    }
  };

  const scrollFetchLaunches = async () => {
    const collectionsJSON = await get_launchpad_events(sortby, skip);
    if (collectionsJSON) {
      set_collections([...collections, ...collectionsJSON]);
      if (collectionsJSON == "" || collectionsJSON == undefined) {
        setHasMore(false);
      }
    }
  };

  const handleScroll = () => {
    setSkip(collections.length);
  };

  useEffect(() => {
    scrollFetchLaunches();
  }, [skip]);

  useEffect(() => {
    fetchChangedCollections();
  }, [sortby]);
  return (
    <>
      <Head>
        <title>Exclusive Launchpad - Venomart Marketplace</title>
        <meta
          name="description"
          content="Exclusive launchpad of venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
        />
        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>

      <div className={`${theme}`}>
        <section className="relative py-24 dark:bg-jacarta-900">
          <div className="container">
            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              Launchpad Collections🚀
            </h1>
            <p className=" pt-2 pb-8 text-center text-[18px] text-jacarta-700 dark:text-white">
              Explore all the exclusive collections on venomart launchpad
            </p>

            <div className="collectionFilterDiv bg-white dark:bg-jacarta-900 p-4">
              {!mobileFilter && isBreakpoint && (
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
              )}
              {mobileFilter && isBreakpoint && (
                <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-6 z-20">
                  <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                </button>
              )}
              {mobileFilter && (
                <div className="flex flex-wrap">
                  <button
                    onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setSortBy(""))}
                    className={`${sortby == ""
                      ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                      : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                      }`}
                  >
                    <span className={`text-2xs font-medium  ${sortby == "" && "text-white"}`}>All</span>
                  </button>

                  <button
                    onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setSortBy("upcoming"))}
                    className={`${sortby == "upcoming"
                      ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                      : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                      }`}
                  >
                    <span className={`text-2xs font-medium  ${sortby == "upcoming" && "text-white"}`}>
                      upcoming
                    </span>
                  </button>
                  <button
                    onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setSortBy("live"))}
                    className={`${sortby == "live"
                      ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                      : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                      }`}
                  >
                    <span className={`text-2xs font-medium  ${sortby == "live" && "text-white"}`}>
                      live
                    </span>
                  </button>
                  <button
                    onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setSortBy("ended"))}
                    className={`${sortby == "ended"
                      ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                      : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                      }`}
                  >
                    <span className={`text-2xs font-medium  ${sortby == "ended" && "text-white"}`}>
                      ended
                    </span>
                  </button>
                  <button
                    onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setSortBy("sold out"))}
                    className={`${sortby == "sold out"
                      ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                      : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                      }`}
                  >
                    <span className={`text-2xs font-medium  ${sortby == "sold out" && "text-white"}`}>
                      sold out
                    </span>
                  </button>
                </div>
              )}
            </div>


            <div className="flex justify-center align-middle flex-wrap">
              <InfiniteScroll
                dataLength={collections ? collections?.length : 0}
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
                {collections?.map((e, index) => {
                  const endLength = e?.phases?.length - 1;
                  return (
                    <LaunchCollectionCard
                      key={index}
                      Cover={e.coverImage}
                      Logo={e.logo}
                      Name={e.name}
                      pageName={e.pageName}
                      Description={e.description}
                      mintPrice={e?.phases[endLength]?.mintPrice}
                      supply={e.maxSupply}
                      status={e.status}
                      verified={true}
                      CollectionAddress={e.contractAddress}
                      startDate={e?.phases[0]?.startDate}
                      endDate={e?.phases[endLength]?.EndDate}
                      OtherImagesBaseURI={OtherImagesBaseURI}
                    />
                  );
                })}
              </InfiniteScroll>
            </div>
            <div className="flex items-center justify-center space-x-2">
              {(collections?.length <= 0) && (
                <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                  No launches found!
                </h2>
              )}
            </div>
          </div>
        </section >
      </div >
    </>
  );
};

export default Launchpad;