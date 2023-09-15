import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { top_users } from "../../../utils/mongo_api/user/user";
import UserRankingCard from "../../../components/cards/UserRankingCard";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import { BsChevronDown } from "react-icons/bs";
import Loader from "../../../components/Loader";

const Users = ({ theme, topUsers, setTopUsers }) => {
    const [duration, set_duration] = useState("alltime");
    const [wallet_id, set_wallet_id] = useState("none");

    const [mobileFilter, openMobileFilter] = useState(true);
    const [filterSort, openFilterSort] = useState(false);

    const [isTyping, set_isTyping] = useState(true);
    const [def_query, set_def_query] = useState(undefined);
    const [searchLoading, setSearchLoading] = useState(false);
    const [defaultFetch, setDefaultFetch] = useState(false);

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

    const fetchTopUsers = async () => {
        setSearchLoading(true);
        const result = await top_users(duration, wallet_id);
        if (result) {
            setTopUsers(result);
        }
        setSearchLoading(false);
    };

    const handle_search = async (data) => {
        setTopUsers([]);
        setSearchLoading(true);
        set_wallet_id(data);
        set_isTyping(true);
        set_def_query("");
    };

    useEffect(() => {
        const timer = setTimeout(async () => {
            set_isTyping(false);
            if (isTyping || def_query == undefined) return;
            setSearchLoading(true);
            const res = await top_users(duration, wallet_id);
            if (res) {
                setTopUsers(res);
            }
            set_isTyping(false);
            setSearchLoading(false);
        }, 1000);

        return () => clearTimeout(timer);
    }, [isTyping]);

    useEffect(() => {
        if (topUsers != "") return;
        fetchTopUsers();
    }, []);

    useEffect(() => {
        if (defaultFetch != true) return;
        fetchTopUsers();
    }, [duration]);

    useEffect(() => {
        if (filterSort) {
            document.body.addEventListener('click', () => {
                openFilterSort(false)
            })
        }
    }, [filterSort])

    return (
        <section className={`${theme}`}>
            <Head>
                <title>User Rankings - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Explore top users by various filters on venomart | Powered by Venom Blockchain"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>
            <div className={`relative py-24 dark:bg-jacarta-900`}>
                <div className="container">
                    <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                        User Rankings
                    </h1>
                    <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                        Top users ranked by there purchases, sales and more
                    </p>
                    {/* filter  */}
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
                                    {/* searchbar  */}
                                    <div className="collectionFiltersExplore">
                                        <form
                                            action="search"
                                            className="relative w-[60%]"
                                            onSubmit={(e) => e.preventDefault()}
                                        >
                                            <input
                                                type="search"
                                                onChange={(e) => handle_search((e.target.value))}
                                                className="w-[90%] h-[38px] rounded-xl border border-jacarta-100 py-[0.1875rem] px-2 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                                placeholder="search by wallet"
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

                                    <div className="collectionSearchExplore">
                                        {/* top volume filter  */}
                                        <div className="typeModelMainDiv relative my-1 mx-2 cursor-pointer">
                                            <button
                                                className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                                                onClick={(e) => (e.stopPropagation(), openFilterSort(!filterSort))}
                                            >
                                                {duration == "7days" &&
                                                    <span className="text-jacarta-700 dark:text-white">
                                                        7 Days
                                                    </span>
                                                }
                                                {duration == "30days" &&
                                                    <span className="text-jacarta-700 dark:text-white">
                                                        30 Days
                                                    </span>
                                                }
                                                {duration == "1year" &&
                                                    <span className="text-jacarta-700 dark:text-white">
                                                        1 Year
                                                    </span>
                                                }
                                                {duration == "alltime" &&
                                                    <span className="text-jacarta-700 dark:text-white">
                                                        All time
                                                    </span>
                                                }
                                                <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                                            </button>

                                            {filterSort && (
                                                <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                                                    <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                                        Sort By
                                                    </span>
                                                    <button onClick={() => (openFilterSort(false), setDefaultFetch(true), set_duration("7days"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                        7 Days
                                                        {duration == "7days" &&
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
                                                    <button onClick={() => (openFilterSort(false), setDefaultFetch(true), set_duration("30days"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                        30 Days
                                                        {duration == "30days" &&
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
                                                    <button onClick={() => (openFilterSort(false), setDefaultFetch(true), set_duration("1year"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                        1 Year
                                                        {duration == "1year" &&
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
                                                    <button onClick={() => (openFilterSort(false), setDefaultFetch(true), set_duration("alltime"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                        All Time
                                                        {duration == "alltime" &&
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
                                </div>
                            }
                        </div>
                    </div>

                    <div className="scrollbar-custom overflow-x-auto">
                        <div className="w-full min-w-[736px] border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white lg:rounded-2lg">
                            <div
                                className="flex rounded-t-2lg bg-jacarta-50 dark:bg-jacarta-600"
                                role="row"
                            >
                                <div className="w-[26%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Users
                                    </span>
                                </div>
                                <div className="w-[16%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Sales Volume
                                    </span>
                                </div>
                                <div className="w-[16%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Purchase Volume
                                    </span>
                                </div>
                                <div className="w-[14%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Total Sales
                                    </span>
                                </div>
                                <div className="w-[14%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Active Listing
                                    </span>
                                </div>
                                <div className="w-[14%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Status
                                    </span>
                                </div>
                            </div>

                            {/* loop all the collections here  */}

                            {topUsers?.map(
                                (e, index) =>
                                    <UserRankingCard
                                        key={index}
                                        id={index + 1}
                                        Logo={e?.profileImage}
                                        Name={e?.user_info}
                                        walletAddress={e?._id}
                                        totalPurchaseVolume={e?.totalPurchaseVolume}
                                        totalSalesVolume={e?.totalSaleVolume}
                                        totalSales={e?.totalSales}
                                        activeListings={e?.activeListings}
                                    />
                            )}
                            {topUsers?.length <= 0 && !searchLoading && (
                                <h2 className="text-center p-4">No users found!</h2>
                            )}
                            {searchLoading && (
                                <div className="flex items-center justify-center space-x-2 mt-12 mb-12">
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Users;
