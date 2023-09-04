import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import NftCard from "../../components/cards/NftCard";
import { MdVerified } from "react-icons/md";
import {
  BsArrowUpRight,
  BsBrowserChrome,
  BsDiscord,
  BsFillExclamationCircleFill,
  BsTelegram,
  BsTwitter,
} from "react-icons/bs";
import { RxActivityLog } from "react-icons/rx"
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai"
import Head from "next/head";
import Loader from "../../components/Loader";
import { MARKETPLACE_ADDRESS, loadNFTs_collection } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import defBack from "../../../public/defback.png";
import { get_collection_by_contract, update_collection_supply } from "../../utils/mongo_api/collection/collection";
import collectionAbi from "../../../abi/CollectionDrop.abi.json";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetch_collection_nfts } from "../../utils/mongo_api/nfts/nfts";
import { search_nfts } from "../../utils/mongo_api/search";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import { MyEver } from "../../utils/user_nft";

const Collection = ({
  blockURL,
  theme,
  standalone,
  webURL,
  copyURL,
  currency
}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(false);
  const [isHovering, SetIsHovering] = useState(false);

  const [itemsTab, showItemsTab] = useState(true);
  const [analyticsTab, showAnalyticsTab] = useState(false);
  const [activityTab, showActivityTab] = useState(false);

  const [priceRangeFilter, showPriceRangeFilter] = useState(false);
  const [saleTypeFilter, showSaleTypeFilter] = useState(false);
  const [listedFilter, showListedFilter] = useState(false);
  const [mobileFilter, openMobileFilter] = useState(true);

  const [share, setShare] = useState(false);
  const [collection, set_collection] = useState({});
  const [nfts, set_nfts] = useState([]);
  const [activity, set_activity] = useState([]);
  const [analytics, set_analytics] = useState([]);
  const [lastNFT, setLastNFT] = useState(true);
  const [onChainData, setOnChainData] = useState(false);
  const [skip, setSkip] = useState(0);
  const [skipActivity, setSkipActivity] = useState(0);
  const [fetchedCollectionActivity, setFetchedCollectionActivity] = useState(false);
  const [activityType, setActivityType] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [query_search, set_query_search] = useState("");
  const [isTyping, set_isTyping] = useState(true);
  const [def_query, set_def_query] = useState(undefined);
  const [actionDrop, setActionDrop] = useState(false);
  const [metaDataUpdated, setMetaDataUpdated] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [currentFilter, setCurrentFilter] = useState("recentlyListed");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  // refresh nft metadata 
  const refreshMetadata = async () => {
    if (metaDataUpdated == true) return;
    setMetadataLoading(true);

    let myEver = new MyEver();
    const providerRpcClient = myEver.ever();
    const contract = new providerRpcClient.Contract(collectionAbi, slug);
    const totalSupply = await contract.methods
      .totalSupply({ answerId: 0 })
      .call();

    if (collection?.TotalSupply < totalSupply.count) {
      const updateNFTData = await update_collection_supply(slug, totalSupply.count);
      setMetadataLoading(false);
      alert("Metadata has been updated to latest");
      router.reload();
      setMetaDataUpdated(true);
      return;
    }
    setMetaDataUpdated(true);
    setMetadataLoading(false);
    alert("Metadata is already up to date!");
  }

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

  // getting def collection info 
  const gettingCollectionInfo = async () => {
    if (!standalone && !slug) return;
    setLoading(true);

    const nfts_offchain = await fetch_collection_nfts(slug, currentFilter, minPrice, maxPrice, skip);
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
    }

    if (nfts_offchain == undefined || nfts_offchain.length <= 0) {
      const nfts_onchain = await loadNFTs_collection(
        standalone,
        slug,
        undefined
      );
      setOnChainData(true);
      setLastNFT(nfts_onchain?.continuation);
      set_nfts(nfts_onchain?.nfts);
    }

    // getting contract info
    const res = await get_collection_by_contract(slug, 0);
    if (res) {
      set_collection(res?.data);
    }
    setLoading(false);
  };

  // getting nfts according to filter 
  const fetch_filter_nfts = async () => {
    const nfts_offchain = await fetch_collection_nfts(slug, currentFilter, minPrice, maxPrice, skip);
    console.log({ nfts_offchain })
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
    }
  }


  // filter btn for fetch onchain data 
  const filterFetchOnchainData = async () => {
    setSearchLoading(true);
    const nfts_onchain = await loadNFTs_collection(
      standalone,
      slug,
      undefined
    );
    setOnChainData(true);
    setLastNFT(nfts_onchain?.continuation);
    set_nfts(nfts_onchain?.nfts);
    setSearchLoading(false);
  }

  // fetching collection activity
  const fetch_collection_activity = async () => {
    if (collection?._id == undefined) return;
    setSearchLoading(true);
    const res = await getActivity("", collection._id, "", activityType, skipActivity);
    if (res) {
      set_activity(res);
    }
    setFetchedCollectionActivity(true);
    setSearchLoading(false);
  };

  // fetching on onchain scroll
  const fetch_more_nftsOnChain = async () => {
    if (onChainData == false) return;
    let res = await loadNFTs_collection(standalone, slug, lastNFT);
    setLastNFT(res?.continuation);

    if (res?.nfts?.length && res?.continuation) {
      let all_nfts = [...nfts, ...res.nfts];
      set_nfts(all_nfts);
      return all_nfts;
    }
  };

  // fetching on offchain scroll
  const fetch_more_nftsOffChain = async () => {
    if (onChainData == true || skip == 0) return;
    const nfts_offchain = await fetch_collection_nfts(slug, currentFilter, minPrice, maxPrice, skip);
    if (nfts_offchain) {
      set_nfts([...nfts, ...nfts_offchain]);
    }
  };

  const handleScroll = (e) => {
    if (onChainData == true) return;
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(nfts.length);
    }
  };

  // acitivty scroll function
  const scrollFetchActivity = async () => {
    if (collection._id == undefined) return;
    setSearchLoading(true);
    const res = await getActivity("", collection._id, "", activityType, skipActivity);
    if (res) {
      set_activity([...activity, ...res]);
    }
    setSearchLoading(false);
  };

  const handleActivityScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkipActivity(activity.length);
    }
  };

  // handling search
  const handle_search = async (data) => {
    setSearchLoading(true);
    set_query_search(data);
    set_isTyping(true);
    set_def_query("");
  };

  // use effects
  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || def_query == undefined) return;
      setSearchLoading(true);
      const res = await search_nfts(query_search, collection._id);
      if (res) {
        set_nfts(res.nfts);
      }
      set_isTyping(false);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!slug) return
    gettingCollectionInfo();
  }, [standalone, slug]);

  useEffect(() => {
    if (!slug) return;
    fetch_more_nftsOffChain();
  }, [skip]);

  useEffect(() => {
    scrollFetchActivity();
  }, [skipActivity]);

  useEffect(() => {
    fetch_collection_activity();
  }, [activityType])

  useEffect(() => {
    fetch_filter_nfts();
  }, [currentFilter])

  return (
    <div className={`${theme}`}>
      <Head>
        <title>{`${collection?.name ? collection?.name : "Collection"} - Venomart Marketplace`}</title>
        <meta
          name="description"
          content={`${collection?.description ? collection?.description : "Explore, Create and Experience exculsive NFTs on Venomart"} | Powered by Venom Blockchain`}
        />
        <meta
          name="keywords"
          content={`venomart, nft collections on venom, top nft collection on venom, best NFTs on venom testnet`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className="dark:bg-jacarta-900 ">
          {/* <!-- Banner IMG--> */}
          <div className="relative pt-24">
            {collection?.coverImage ? (
              <Image
                src={collection?.coverImage?.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                )}
                width={100}
                height={100}
                alt="banner"
                className="h-[18.75rem] w-[100%] object-cover"
              />
            ) : (
              <Image
                src={defBack}
                width={100}
                height={100}
                alt="banner"
                className="h-[18.75rem] w-[100%] object-cover"
              />
            )}
          </div>

          {/* <!-- Collection Section --> */}
          <section className="relative pb-6 pt-20 dark:bg-jacarta-900">
            <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="relative">
                {collection?.logo ? (
                  <Image
                    src={collection?.logo?.replace(
                      "ipfs://",
                      "https://ipfs.io/ipfs/"
                    )}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
                  />
                ) : (
                  <Image
                    src={defLogo}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
                  />
                )}
                <div className="absolute -right-3 bottom-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-white dark:border-jacarta-600">
                  {collection?.isVerified ? (
                    <MdVerified
                      style={{ color: "#4f87ff", cursor: "pointer" }}
                      size={30}
                      onMouseOver={() => SetIsHovering(true)}
                      onMouseOut={() => SetIsHovering(false)}
                    />
                  ) : (
                    <BsFillExclamationCircleFill
                      style={{ color: "#c3c944", cursor: "pointer" }}
                      size={30}
                      onMouseOver={() => SetIsHovering(true)}
                      onMouseOut={() => SetIsHovering(false)}
                    />
                  )}
                </div>
                <div className="absolute mb-6 ml-[24px] mt-[-12px] inline-flex items-center justify-center">
                  {collection?.isVerified && isHovering && (
                    <p
                      className="bg-blue px-[20px] py-[3px] text-white text-[12px]"
                      style={{ borderRadius: "10px" }}
                    >
                      Verified
                    </p>
                  )}
                  {!collection?.isVerified && isHovering && (
                    <p
                      className="bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]"
                      style={{ borderRadius: "10px" }}
                    >
                      Not Verified
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="container">
              <div className="text-center">
                <div className="flex justify-center align-middle mb-6 mt-2">
                  {collection?.socials && (
                    <>
                      {collection?.socials[0] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[0]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsBrowserChrome className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[1] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[1]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[2] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[2]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[3] != "" && (
                        <a
                          href={
                            collection?.socials?.length
                              ? collection?.socials[3]
                              : "#"
                          }
                          target="_blank"
                          className="group ml-4"
                        >
                          <BsTelegram className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-6 inline-flex items-center justify-center rounded-full border border-jacarta-100 bg-white py-1.5 px-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                  <a
                    href={`${blockURL}accounts/${slug}`}
                    target="_blank"
                    className="js-copy-clipboard max-w-[10rem] select-none overflow-hidden text-ellipsis whitespace-nowrap dark:text-jacarta-200"
                  >
                    <span>{slug}</span>
                  </a>
                  <BsArrowUpRight
                    className="text-jacarta-700 dark:text-jacarta-200 cursor-pointer"
                    onClick={() =>
                      window.open(
                        `${blockURL}` + `accounts/` + `${slug}`,
                        "_blank"
                      )
                    }
                  />
                </div>
                <h2 className="mb-2 mt-2 font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                  {collection?.name
                    ? collection?.name
                    : "Unverified Collection"}
                </h2>
                <div className="mb-4"></div>

                {/* desc  */}
                <div className="mx-auto mb-14 max-w-xl text-lg dark:text-jacarta-300">
                  {collection?.description ? (
                    collection?.description
                  ) : (
                    <div>
                      This collection is tracked but not verified on Venomart.
                      If you are the owner, you can{" "}
                      <a
                        href="https://forms.gle/UtYWWkhsBYG9ZUjD8"
                        target="_blank"
                        className="text-blue-500"
                      >
                        submit
                      </a>{" "}
                      it now for approval now!
                    </div>
                  )}
                </div>

                {/* stats  */}
                <div className="mb-8 inline-flex flex-wrap items-center justify-center rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800">
                  <a
                    href="#"
                    className="w-1/2 rounded-l-xl border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32"
                  >
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white">
                      {collection?.TotalSupply ? collection?.TotalSupply : "0"}
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Items
                    </div>
                  </a>
                  {/* <a
                    href="#"
                    className="w-1/2 border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32 sm:border-r"
                  >
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white">
                      {nfts ? nfts?.length : "0"}+
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Owners
                    </div>
                  </a> */}
                  <a
                    href="#"
                    className="w-1/2 border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32 sm:border-r"
                  >
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white">
                      {collection?.TotalListed ? collection?.TotalListed : "0"}
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      For Sale
                    </div>
                  </a>
                  <a
                    href="#"
                    className="w-1/2 border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32"
                  >
                    <div className="mb-1 flex items-center justify-center text-base font-medium text-jacarta-700 dark:text-white">
                      <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                          height: "15px",
                          width: "15px",
                          marginTop: "2px",
                        }}
                        alt="Venomart"
                      />
                      <span className="font-bold ml-1">
                        {" "}
                        {collection?.FloorPrice ? collection?.FloorPrice : "0"}
                      </span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Floor Price
                    </div>
                  </a>
                  <a
                    href="#"
                    className="w-1/2 rounded-r-xl border-jacarta-100 py-4 hover:shadow-md sm:w-32"
                  >
                    <div className="mb-1 flex items-center justify-center text-base font-medium text-jacarta-700 dark:text-white">
                      <Image
                        src={venomLogo}
                        height={100}
                        width={100}
                        style={{
                          height: "15px",
                          width: "15px",
                          marginTop: "2px",
                        }}
                        alt="Venomart"
                      />
                      <span className="font-bold ml-1">
                        {collection?.TotalVolume
                          ? (collection?.TotalVolume).toFixed(2)
                          : "0"}
                      </span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">
                      Volume Traded
                    </div>
                  </a>
                </div>

                <div className="mt-6 flex items-center justify-center space-x-2.5">
                  {/* Share  */}
                  <div className="relative dropdown rounded-xl border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600">
                    <button onClick={() => (setActionDrop(false), setShare(!share))} className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-4 w-4 fill-jacarta-500 dark:fill-jacarta-200"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M13.576 17.271l-5.11-2.787a3.5 3.5 0 1 1 0-4.968l5.11-2.787a3.5 3.5 0 1 1 .958 1.755l-5.11 2.787a3.514 3.514 0 0 1 0 1.458l5.11 2.787a3.5 3.5 0 1 1-.958 1.755z" />
                      </svg>
                    </button>

                    {share && (
                      <div className="absolute left-[-140px] top-[50px] dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                        <a
                          href={`https://twitter.com/intent/tweet?text=I%20found%20this%20awesome%20collection%20on%20venomart.io%0A${collection?.name ? collection?.name : "It"}%20is%20an%20NFT%20collection%20on%20venom%20blockchain%20%F0%9F%94%A5%0ACheck%20it%20out%20here%20-%20${webURL}collection/${slug}%0A%23Venom%20%23VenomBlockchain%20%23venomart%20%23NFTCollection%20%23VenomNFTs`}
                          target="_blank"
                          className="flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          <svg
                            aria-hidden="true"
                            focusable="false"
                            data-prefix="fab"
                            data-icon="twitter"
                            className="mr-2 h-4 w-4 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                            role="img"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 512 512"
                          >
                            <path d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.213 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"></path>
                          </svg>
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">
                            Twitter
                          </span>
                        </a>
                        <a
                          href="#"
                          onClick={copyURL}
                          className="flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="24"
                            height="24"
                            className="mr-2 h-4 w-4 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white"
                          >
                            <path fill="none" d="M0 0h24v24H0z" />
                            <path d="M18.364 15.536L16.95 14.12l1.414-1.414a5 5 0 1 0-7.071-7.071L9.879 7.05 8.464 5.636 9.88 4.222a7 7 0 0 1 9.9 9.9l-1.415 1.414zm-2.828 2.828l-1.415 1.414a7 7 0 0 1-9.9-9.9l1.415-1.414L7.05 9.88l-1.414 1.414a5 5 0 1 0 7.071 7.071l1.414-1.414 1.415 1.414zm-.708-10.607l1.415 1.415-7.071 7.07-1.415-1.414 7.071-7.07z" />
                          </svg>
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">
                            Copy
                          </span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="relative dropdown rounded-xl border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600">
                    <button onClick={() => (setShare(false), setActionDrop(!actionDrop))} className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm" id="collectionActions">
                      <svg width="16" height="4" viewBox="0 0 16 4" fill="none" xmlns="http://www.w3.org/2000/svg"
                        className="fill-jacarta-500 dark:fill-jacarta-200">
                        <circle cx="2" cy="2" r="2"></circle>
                        <circle cx="8" cy="2" r="2"></circle>
                        <circle cx="14" cy="2" r="2"></circle>
                      </svg>
                    </button>

                    {actionDrop &&
                      <div className="absolute left-[-140px] top-[50px] dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">

                        {metadataLoading ?
                          <button
                            className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </button>
                          :
                          <button
                            onClick={() => refreshMetadata()}
                            className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                            Refresh Metadata
                          </button>}
                        <button
                          className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                          Report
                        </button>
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* main section  */}
          <section className="relative pb-24 pt-12">
            {/* select tabs  */}
            <ul className="nav nav-tabs mb-12 flex items-center justify-center border-b border-jacarta-100 dark:border-jacarta-600" style={{ overflow: "hidden" }}>
              <li className="nav-item" role="presentation">
                <button
                  onClick={() => (showActivityTab(false), showAnalyticsTab(false), showItemsTab(true))}
                  className={`nav-link ${itemsTab && "active relative"
                    } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="mr-1 h-5 w-5 fill-current"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M13 21V11h8v10h-8zM3 13V3h8v10H3zm6-2V5H5v6h4zM3 21v-6h8v6H3zm2-2h4v-2H5v2zm10 0h4v-6h-4v6zM13 3h8v6h-8V3zm2 2v2h4V5h-4z" />
                  </svg>
                  <span className="font-display text-base font-medium">
                    Items
                  </span>
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  onClick={() => (
                    showItemsTab(false),
                    showActivityTab(false),
                    showAnalyticsTab(true)
                  )}
                  className={`nav-link ${analyticsTab && "active relative"
                    } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="mr-1 h-5 w-5 fill-current"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M4 5v14h16V5H4zM3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm11.793 6.793L13 8h5v5l-1.793-1.793-3.864 3.864-2.121-2.121-2.829 2.828-1.414-1.414 4.243-4.243 2.121 2.122 2.45-2.45z" />
                  </svg>
                  <span className="font-display text-base font-medium">
                    Analytics
                  </span>
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  onClick={() => (
                    (!fetchedCollectionActivity && fetch_collection_activity()),
                    showItemsTab(false),
                    showAnalyticsTab(false),
                    showActivityTab(true)
                  )}
                  className={`nav-link ${activityTab && "active relative"
                    } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
                >
                  <RxActivityLog className="mr-1 h-4 w-4 fill-current" />
                  <span className="font-display text-base font-medium">
                    Activity
                  </span>
                </button>
              </li>
            </ul>

            {/* items  */}
            {itemsTab && (
              <div className={`tab-content`}>
                <div className="tab-pane fade show active">
                  {/* filters  */}
                  {!onChainData && (
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
                        <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-6 z-20">
                          <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                        </button>
                      }
                      {mobileFilter &&
                        <div
                          className="collectionFilterDiv p-4">
                          <div className="collectionFilters mx-6">
                            {/* sale type  */}
                            <div className="typeModelMainDiv relative my-1 mr-2.5">
                              <button
                                onClick={() => (
                                  showListedFilter(false),
                                  showPriceRangeFilter(false),
                                  showSaleTypeFilter(!saleTypeFilter)
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
                                    <path d="M3.783 2.826L12 1l8.217 1.826a1 1 0 0 1 .783.976v9.987a6 6 0 0 1-2.672 4.992L12 23l-6.328-4.219A6 6 0 0 1 3 13.79V3.802a1 1 0 0 1 .783-.976zM13 10V5l-5 7h3v5l5-7h-3z" />
                                  </svg>
                                  <span className="text-jacarta-700 dark:text-white">Sale type</span>
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

                              {saleTypeFilter && (
                                <div className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                                  <ul className="flex flex-col flex-wrap">
                                    <li>
                                      <button
                                        className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                      >
                                        <span className="text-jacarta-700 dark:text-white">
                                          Fixed price
                                        </span>
                                        {!onChainData &&
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="mb-[3px] h-4 w-4 fill-accent"
                                          >
                                            <path
                                              fill="none"
                                              d="M0 0h24v24H0z"
                                            ></path>
                                            <path d="M10 15.172l9.192-9.193 1.415 1.414L10 18l-6.364-6.364 1.414-1.414z"></path>
                                          </svg>
                                        }
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => filterFetchOnchainData()}
                                        className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                      >
                                        <span className="text-jacarta-700 dark:text-white">
                                          Not for sale
                                        </span>
                                        {onChainData &&
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            width="24"
                                            height="24"
                                            className="mb-[3px] h-4 w-4 fill-accent"
                                          >
                                            <path
                                              fill="none"
                                              d="M0 0h24v24H0z"
                                            ></path>
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
                                onClick={() => (
                                  showListedFilter(false),
                                  showSaleTypeFilter(false),
                                  showPriceRangeFilter(!priceRangeFilter)
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
                                  <span className="text-jacarta-700 dark:text-white">Price Range</span>
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
                                <div className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                                  <div className="flex items-center space-x-3 px-5 pb-2">
                                    <input
                                      type="number"
                                      placeholder="From"
                                      min="0"
                                      onInput={(e) => e.target.value = Math.abs(e.target.value)}
                                      // value={minPrice}
                                      onChange={(e) => (setSkip(0), setMinPrice(parseFloat(e.target.value)))}
                                      className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                    />
                                    <input
                                      type="number"
                                      placeholder="To"
                                      min="0"
                                      onInput={(e) => e.target.value = Math.abs(e.target.value)}
                                      // value={maxPrice}
                                      onChange={(e) => (setSkip(0), setMaxPrice(parseFloat(e.target.value)))}
                                      className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                    />
                                  </div>

                                  <div className="-ml-2 -mr-2 mt-4 flex items-center justify-center space-x-3 border-t border-jacarta-100 px-7 pt-4 dark:border-jacarta-600">
                                    <button
                                      type="button"
                                      onClick={() => (setMaxPrice(0), setMinPrice(0), showPriceRangeFilter(false))}
                                      className="flex-1 rounded-full bg-white py-2 px-6 text-center text-sm font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                    >
                                      Clear
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => (fetch_filter_nfts(), showPriceRangeFilter(false))}
                                      className="flex-1 rounded-full bg-accent py-2 px-6 text-center text-sm font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                    >
                                      Apply
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* all nft and listed filter  */}
                            <div className="typeModelMainDiv relative my-1 mr-2.5 cursor-pointer">
                              <div
                                onClick={() => (
                                  showPriceRangeFilter(false),
                                  showSaleTypeFilter(false),
                                  showListedFilter(!listedFilter)
                                )}
                                className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                              >
                                {currentFilter == "recentlyListed" &&
                                  <span className="text-jacarta-700 dark:text-white">
                                    Recently Listed
                                  </span>
                                }
                                {currentFilter == "lowToHigh" &&
                                  <span className="text-jacarta-700 dark:text-white">
                                    Low To High
                                  </span>
                                }
                                {currentFilter == "highToLow" &&
                                  <span className="text-jacarta-700 dark:text-white">
                                    High To Low
                                  </span>
                                }
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
                              {listedFilter && (
                                <div className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                                  <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                    Sort By
                                  </span>
                                  <button onClick={() => (setSkip(0), setMinPrice(0), setMaxPrice(0), setCurrentFilter("recentlyListed"), showListedFilter(false))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                    Recently Listed
                                    {currentFilter == "recentlyListed" &&
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
                                  <button onClick={() => (setSkip(0), setMinPrice(0), setMaxPrice(0), setCurrentFilter("lowToHigh"), showListedFilter(false))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700">
                                    Price: Low to High
                                    {currentFilter == "lowToHigh" &&
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

                                  <button onClick={() => (setSkip(0), setMinPrice(0), setMaxPrice(0), setCurrentFilter("highToLow"), showListedFilter(false))} className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700">
                                    Price: High to Low
                                    {currentFilter == "highToLow" &&
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

                          {/* search  */}
                          <div className="collectionSearch">
                            <form action="search" className="relative w-[60%]" onSubmit={(e) => e.preventDefault()}>
                              <input
                                type="search"
                                onChange={(e) => handle_search(e.target.value)}
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

                            {/* add card size filter here later */}
                          </div>
                        </div>
                      }
                    </div>
                  )}

                  <div className={`${!onChainData && "scroll-list"}`} onScroll={handleScroll}>
                    <div
                      className={`flex justify-center align-middle flex-wrap`}
                    >
                      {onChainData ? (
                        <InfiniteScroll
                          dataLength={nfts ? nfts?.length : 0}
                          next={fetch_more_nftsOnChain}
                          hasMore={lastNFT}
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
                                ImageSrc={(onChainData
                                  ? e?.preview?.source
                                  : e?.nft_image
                                )?.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )}
                                Name={e?.name}
                                Description={e?.description}
                                Address={
                                  onChainData
                                    ? e?.nftAddress?._address
                                    : e?.NFTAddress
                                }
                                listedBool={e?.isListed}
                                listingPrice={e?.listingPrice}
                                NFTCollectionAddress={
                                  e?.NFTCollection?.contractAddress
                                }
                                NFTCollectionName={e?.NFTCollection?.name}
                                NFTCollectionStatus={
                                  e?.NFTCollection?.isVerified
                                }
                                currency={currency}
                              />
                            );
                          })}
                        </InfiniteScroll>
                      ) : (
                        <>
                          {searchLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          ) : (
                            <>
                              {nfts?.map((e, index) => {
                                return (
                                  <NftCard
                                    key={index}
                                    ImageSrc={(onChainData
                                      ? e?.preview?.source
                                      : e?.nft_image
                                    )?.replace(
                                      "ipfs://",
                                      "https://ipfs.io/ipfs/"
                                    )}
                                    Name={e?.name}
                                    Description={e?.description}
                                    Address={
                                      onChainData
                                        ? e?.nftAddress?._address
                                        : e?.NFTAddress
                                    }
                                    listedBool={e?.isListed}
                                    listingPrice={e?.listingPrice}
                                    NFTCollectionAddress={
                                      e?.NFTCollection?.contractAddress
                                    }
                                    NFTCollectionName={e?.NFTCollection?.name}
                                    NFTCollectionStatus={
                                      e?.NFTCollection?.isVerified
                                    }
                                    currency={currency}
                                  />
                                );
                              })}
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {nfts?.length <= 0 && def_query == undefined && (
                        <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                          No NFTs Found!!
                        </h2>
                      )}
                      {nfts?.length <= 0 &&
                        def_query == "" &&
                        !searchLoading && (
                          <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                            No search results found!!
                          </h2>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* analytics  */}
            {analyticsTab && (
              <div className={`tab-content`}>
                <div className="tab-pane fade show active">
                  <div>
                    <div className={`flex justify-center align-middle flex-wrap`}>
                      {analytics?.length <= 0 &&
                        <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                          Coming soon..
                        </h2>
                      }
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* activity  */}
            {activityTab && (
              <div className="container">
                <div className="flexActivitySection">
                  <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10 scroll-list" onScroll={handleActivityScroll}>
                    {activity?.length >= 1 && (
                      <div className="flex justify-center align-middle flex-wrap">
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
                            MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                          />
                        ))}
                        {searchLoading && (
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          </div>
                        )}
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
                  {/* activity filters  */}
                  <div className="basis-4/12 lg:pl-5 bg-white dark:bg-jacarta-900 py-8" style={{ position: "sticky", top: "60px" }}>
                    <h3 className="mb-4 font-display font-semibold text-jacarta-500 dark:text-white">
                      Filters
                    </h3>
                    <div className="flex flex-wrap">
                      <button onClick={() => (setSkipActivity(0), setActivityType("list"))} className={`${activityType == "list" ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark" : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "list" ? "fill-white" : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"}`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span className={`text-2xs font-medium  ${activityType == "list" && "text-white"}`}>
                          Listing
                        </span>
                      </button>

                      <button onClick={() => (setSkipActivity(0), setActivityType("cancel"))} className={`${activityType == "cancel" ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark" : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "cancel" ? "fill-white" : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"}`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span className={`text-2xs font-medium ${activityType == "cancel" && "text-white"}`}>
                          Remove Listing
                        </span>
                      </button>

                      <button onClick={() => (setSkipActivity(0), setActivityType("sale"))} className={`${activityType == "sale" ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark" : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"}`}>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "sale" ? "fill-white" : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"}`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                        </svg>
                        <span className={`text-2xs font-medium ${activityType == "sale" && "text-white"}`}>
                          Sale
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  {(activity === undefined) && (
                    <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                      No activities yet!
                    </h2>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default Collection;
