import CollectionRankingCard from "../../../components/cards/CollectionRankingCard";
import Head from "next/head";
import React, { useCallback, useEffect, useState } from "react";
import { get_collections } from "../../../utils/mongo_api/collection/collection";
import { BsChevronDown } from "react-icons/bs";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";

const Collections = ({
    theme,
    topCollections,
    setTopCollections,
}) => {
    const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);
    const [filterCategories, openFilterCategories] = useState(false);
    const [filterSort, openFilterSort] = useState(false);
    const [mobileFilter, openMobileFilter] = useState(true);

    const [verifiedCheck, setVerifiedCheck] = useState(false);
    const [collection_status, set_collection_status] = useState("unverified");
    const [category, setCategory] = useState("All");
    const [sortby, setSortBy] = useState("topVolume");
    const [duration, setDuration] = useState("Alltime");

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

    const fetchTopCollections = async () => {
        const topCollections = await get_collections(category, sortby, collection_status, 0);
        if (topCollections) {
            setTopCollections(topCollections);
        }
    };

    useEffect(() => {
        if (topCollections != "") return;
        fetchTopCollections();
    }, []);

    useEffect(() => {
        if (defaultFilterFetch != true) return;
        fetchTopCollections();
    }, [sortby, category, collection_status]);

    useEffect(() => {
        if (filterCategories || filterSort) {
            document.body.addEventListener('click', () => {
                openFilterCategories(false)
                openFilterSort(false)
            })
        }
    }, [filterCategories, filterSort])

    return (
        <section className={`${theme}`}>
            <Head>
                <title>Collection Rankings - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Explore top collections by various filters on venomart | Powered by Venom Blockchain"
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
                        Collection Rankings
                    </h1>
                    <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                        Top collections ranked by volume, floor price and more
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
                                    {/* categories filter  */}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("All"))}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Art"))}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Collectibles"))}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Games"))}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Memes"))}
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
                                                            onClick={() => (openFilterCategories(false), setDefaultFilterFetch(true), setCategory("Utility"))}
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

                                    <div className="collectionSearchExplore">
                                        {/* other filter  */}
                                        <div className="typeModelMainDiv relative my-1 mx-2 cursor-pointer">
                                            <button
                                                className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                                                onClick={(e) => (e.stopPropagation(), openFilterSort(!filterSort))}
                                            >
                                                {duration == "Alltime" &&
                                                    <span className="text-jacarta-700 dark:text-white">
                                                        All Time
                                                    </span>
                                                }
                                                <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                                            </button>

                                            {filterSort && (
                                                <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 w-full whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                                                    <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                                        Sorty By
                                                    </span>
                                                    <button onClick={() => (setDefaultFilterFetch(true), setDuration("Alltime"))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                                        All Time
                                                        {duration == "Alltime" &&
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
                                                                onChange={() => (verifiedCheck ? (setVerifiedCheck(false), setDefaultFilterFetch(true), set_collection_status("unverified")) : (setVerifiedCheck(true), set_collection_status("verified")))}
                                                                className="relative h-4 w-7 cursor-pointer appearance-none rounded-lg border-none bg-jacarta-100 after:absolute after:top-0.5 after:left-0.5 after:h-3 after:w-3 after:rounded-full after:bg-jacarta-400 after:transition-all checked:bg-accent checked:bg-none checked:after:left-3.5 checked:after:bg-white checked:hover:bg-accent focus:ring-transparent focus:ring-offset-0 checked:focus:bg-accent"
                                                            />
                                                        </span>
                                                    </div>
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
                                        Sales
                                    </span>
                                </div>
                                <div className="w-[12%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Items
                                    </span>
                                </div>
                                <div className="w-[12%] py-3 px-4" role="columnheader">
                                    <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                        Royalty %
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
                                            Sales={e?.TotalSales}
                                            Volume={e?.TotalVolume}
                                            Floor={e?.FloorPrice}
                                            Listings={e?.TotalListed}
                                            totalSupply={e?.TotalSupply}
                                        />
                                    )
                            )}
                            {topCollections?.length <= 0 && (
                                <h2 className="text-center p-4">No collections found!</h2>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Collections;
