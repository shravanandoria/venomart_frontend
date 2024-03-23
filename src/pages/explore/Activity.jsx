import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import ActivityRecord from "../../components/cards/ActivityRecord";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import { BsChevronDown, BsFillExclamationCircleFill } from "react-icons/bs";
import { RxCrossCircled } from "react-icons/rx";
import { MdVerified } from "react-icons/md";
import Link from "next/link";
import { get_collections } from "../../utils/mongo_api/collection/collection";
import { search_collections } from "../../utils/mongo_api/search";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";

const Activity = ({ theme, blockURL, signer_address, OtherImagesBaseURI, NFTImagesBaseURI }) => {

    const [collectionLoading, setCollectionLoading] = useState(false);
    const [collectionSearchINP, setCollectionSearchINP] = useState("");

    const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);

    const [collections, set_collections] = useState([]);

    const [searchLoading, setSearchLoading] = useState(false);
    const [activity, set_activity] = useState([]);
    const [skipActivity, setSkipActivity] = useState(0);
    const [hasMore, setHasMore] = useState(true);


    const [mobileFilter, openMobileFilter] = useState(true);
    const [searchedCollectionBefore, setSearchedCollectionBefore] = useState(false);

    const [isTyping, set_isTyping] = useState(true);
    const [query_search, set_query_search] = useState("");
    const [def_query, set_def_query] = useState(undefined);

    const [collectionFilter, openCollectionFilter] = useState(false);
    const [filterSort, openFilterSort] = useState(false);

    const [filterCollection, setFilterCollection] = useState("");
    const [activityType, setActivityType] = useState("");

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

    // fetching collection activity
    const fetch_activity = async () => {
        if ((filterCollection == undefined) || (defaultFilterFetch == false)) return;
        setSearchLoading(true);
        const res = await getActivity("", "", filterCollection, "", activityType, skipActivity);
        if (res) {
            set_activity(res);
        }
        setSearchLoading(false);
    };

    const live_activity = async () => {
        if ((filterCollection == undefined) || (defaultFilterFetch == true)) return;
        setSearchLoading(true);
        const res = await getActivity("", "", filterCollection, "", activityType, skipActivity);
        if (res) {
            set_activity(res);
        }
        setSearchLoading(false);
    };

    // acitivty scroll function
    const scrollFetchActivity = async () => {
        if (filterCollection == undefined) return;
        setSearchLoading(true);
        const res = await getActivity("", "", filterCollection, "", activityType, skipActivity);
        if (res) {
            set_activity([...activity, ...res]);
            if (res == "" || res == undefined) {
                setHasMore(false);
            }
        }
        setSearchLoading(false);
    };

    const handleActivityScroll = () => {
        setSkipActivity(activity.length);
    };

    // fetching collection 
    const fetch_search_collections = async () => {
        if (searchedCollectionBefore == true) return;
        setCollectionLoading(true);
        const res = await get_collections("All", "topVolume", "verified", 0);
        if (res) {
            set_collections(res);
        }
        setCollectionLoading(false);
    };

    const handle_search = async (data) => {
        setCollectionLoading(true);
        set_query_search(data);
        set_isTyping(true);
        set_def_query("");
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
        scrollFetchActivity();
    }, [skipActivity]);

    useEffect(() => {
        if (defaultFilterFetch == false) {
            const intervalId = setInterval(live_activity, 30000);
            return () => clearInterval(intervalId);
        }
    }, [defaultFilterFetch]);

    useEffect(() => {
        fetch_activity();
    }, [activityType, filterCollection])

    useEffect(() => {
        if (collectionFilter || filterSort) {
            document.body.addEventListener('click', () => {
                openCollectionFilter(false)
                openFilterSort(false)
            })
        }
    }, [collectionFilter, filterSort])

    return (
        <section className={`${theme}`}>
            <Head>
                <title>Live Activity - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Explore all the recent activites on venomart marketplace | Powered by Venom Blockchain"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="robots" content="INDEX,FOLLOW" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            <div className={`relative py-24 dark:bg-jacarta-900`}>
                <div className="container">
                    <h1 className="flex justify-center align-middle pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                        {!defaultFilterFetch ?
                            <span className="relative flex justify-center align-middle h-4 w-4 mr-3 mt-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </span>
                            :
                            <span className="relative flex justify-center align-middle h-4 w-4 mr-3 mt-3">
                                <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500"></span>
                            </span>
                        }
                        Live Activity
                    </h1>
                    <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                        Explore all the recent activites on marketplace
                    </p>
                    {/* filter  */}
                    <div className="collectionFilterDiv bg-white dark:bg-jacarta-900 p-4">
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
                            <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-1 z-20">
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
                                            onClick={(e) => (e.stopPropagation(), fetch_search_collections(), setSearchedCollectionBefore(true), openFilterSort(false), openCollectionFilter(!collectionFilter))}
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
                                                                    setFilterCollection("")
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
                                                                <li key={index} onClick={() => (setSkipActivity(0), setHasMore(true), setDefaultFilterFetch(true), setFilterCollection(e?._id), setCollectionSearchINP(e?.name))}>
                                                                    <Link href="#" className="dropdown-item flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                                        <span className="relative text-jacarta-700 dark:text-white">
                                                                            <Image
                                                                                src={e?.logo.replace("ipfs://", OtherImagesBaseURI)}
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
                                </div>

                                {/* listed filter  */}
                                <div className="recentlyListedFilterExplore typeModelMainDiv relative my-1 mr-2.5">
                                    <button
                                        className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                                        onClick={(e) => (e.stopPropagation(), openCollectionFilter(false), openFilterSort(!filterSort))}
                                    >
                                        {activityType == "" &&
                                            <span className=" text-jacarta-700 dark:text-white">
                                                ⚡ All Activity
                                            </span>
                                        }
                                        {activityType == "sale" &&
                                            <span className="text-jacarta-700 dark:text-white">
                                                💰 Sale
                                            </span>
                                        }
                                        {activityType == "offer" &&
                                            <span className="text-jacarta-700 dark:text-white">
                                                💸 Offer
                                            </span>
                                        }
                                        {activityType == "list" &&
                                            <span className=" text-jacarta-700 dark:text-white">
                                                🏷️ Listing
                                            </span>
                                        }
                                        {activityType == "cancel" &&
                                            <span className=" text-jacarta-700 dark:text-white">
                                                🏷️ Remove Listing
                                            </span>
                                        }
                                        {activityType == "canceloffer" &&
                                            <span className="text-jacarta-700 dark:text-white">
                                                ❌ Cancel Offer
                                            </span>
                                        }
                                        <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                                    </button>

                                    {filterSort && (
                                        <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                                            <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                                Filter By
                                            </span>
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType(""))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                ⚡ All Activity
                                                {activityType == "" &&
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
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType("sale"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                💰 Sale
                                                {activityType == "sale" &&
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
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType("offer"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                💸 Offer
                                                {activityType == "offer" &&
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
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType("list"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                🏷️ Listing
                                                {activityType == "list" &&
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
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType("cancel"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                🏷️ Remove Listing
                                                {activityType == "cancel" &&
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
                                            <button onClick={() => (setSkipActivity(0), setHasMore(true), openFilterSort(false), setDefaultFilterFetch(true), setActivityType("canceloffer"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                ❌ Cancel Offer
                                                {activityType == "canceloffer" &&
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
                                        </div>
                                    )}
                                </div>
                            </div>
                        }
                    </div>

                    <div>
                        <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
                            {activity?.length >= 1 && (
                                <div className="flex justify-center align-middle flex-wrap">
                                    <InfiniteScroll
                                        dataLength={activity ? activity?.length : 0}
                                        next={handleActivityScroll}
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
                                        {activity?.map((e, index) => (
                                            <ActivityRecord
                                                key={index}
                                                NFTImage={e?.item?.nft_image}
                                                NFTName={e?.item?.name}
                                                NFTAddress={e?.item?.NFTAddress}
                                                Price={e?.price}
                                                ActivityTime={e?.createdAt}
                                                ActivityType={e?.type}
                                                blockURL={blockURL}
                                                ActivityHash={e?.hash}
                                                From={e?.from}
                                                To={e?.to}
                                                FromUser={e?.fromUser}
                                                ToUser={e?.toUser}
                                                signerAddress={signer_address}
                                                NFTImagesBaseURI={NFTImagesBaseURI}
                                            />
                                        ))}
                                    </InfiniteScroll>
                                </div>
                            )};
                            <div className="flex items-center justify-center space-x-2">
                                {(activity?.length <= 0) && (
                                    <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                                        No activity found!
                                    </h2>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Activity;
