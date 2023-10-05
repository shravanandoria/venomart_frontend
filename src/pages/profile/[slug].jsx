import React, { useCallback, useEffect, useState, useContext } from "react";
import { useRouter } from "next/router";
import defBack from "../../../public/gradient_dark.jpg";
import defLogo from "../../../public/deflogo.png";
import Image from "next/image";
import NftCard from "../../components/cards/NftCard";
import CollectionCard from "../../components/cards/CollectionCard";
import Loader from "../../components/Loader";
import Head from "next/head";
import Link from "next/link";
import {
  MARKETPLACE_ADDRESS,
  buy_nft,
  cancel_listing,
  loadNFTs_user,
} from "../../utils/user_nft";
import { BsArrowUpRight, BsDiscord, BsTwitter } from "react-icons/bs";
import { TfiWorld } from "react-icons/tfi";
import { check_user } from "../../utils/mongo_api/user/user";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import { fetch_user_listed_nfts } from "../../utils/mongo_api/nfts/nfts";
import CancelModal from "../../components/modals/CancelModal";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import moment from "moment";
import SuccessModal from "../../components/modals/SuccessModal";
import BuyModal from "../../components/modals/BuyModal";

import { TonClientContext } from "../../context/tonclient";

const Profile = ({
  theme,
  signer_address,
  blockURL,
  standalone,
  webURL,
  copyURL,
  setAnyModalOpen,
  venomProvider,
  cartNFTs,
  setCartNFTs,
}) => {
  const [user_data, set_user_data] = useState({});

  const userJoinedDate = moment(user_data?.createdAt);
  const formattedDate = userJoinedDate.format("D MMMM YYYY");

  const router = useRouter();
  const { slug } = router.query;

  const [share, setShare] = useState(false);
  const [loading, set_loading] = useState(false);
  const [onSale, setOnSale] = useState(true);
  const [owned, setOwned] = useState(false);
  const [collections, setCollections] = useState(false);
  const [activity, setActivity] = useState(false);
  const [fetchedProfileActivity, setFetchedProfileActivity] = useState(false);
  const [fetchedOnSaleNFTs, setFetchedOnSaleNFTs] = useState(false);
  const [fetchedOwnedNFTs, setFetchedOwnedNFTs] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [userPurchases, setUserPurchases] = useState(true);
  const [mobileFilter, openMobileFilter] = useState(true);

  const [priceRangeFilter, showPriceRangeFilter] = useState(false);
  const [saleTypeFilter, showSaleTypeFilter] = useState(false);
  const [listedFilter, showListedFilter] = useState(false);
  const [currentFilter, setCurrentFilter] = useState("recentlyListed");
  const [saleType, setSaleType] = useState("listed");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [lastNFT, setLastNFT] = useState(undefined);

  const [activitySkip, setActivitySkip] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [activityType, setActivityType] = useState("");
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  const [nfts, set_nfts] = useState([]);
  const [NFTCollections, setNFTCollections] = useState([]);
  const [activityRecords, setActivityRecords] = useState([]);

  const [actionLoad, setActionLoad] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [buyModal, setBuyModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
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

  // fetching user data
  const getProfileData = async () => {
    set_loading(true);
    if (!slug) return;
    const data = await check_user(slug);
    const nftFetch = await getting_user_listed_nfts();
    if (data) {
      set_user_data(data?.data);
      setNFTCollections(data?.data?.nftCollections);
    }
    set_loading(false);
  };

  // fetching user activity
  const fetch_user_activity = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const res = await getActivity(
      user_data._id,
      user_data.wallet_id,
      "",
      "",
      activityType,
      activitySkip
    );
    if (res) {
      setActivityRecords(res);
      if (res == "") {
        setHasMoreActivity(false);
      }
    }
    setFetchedProfileActivity(true);
    setMoreLoading(false);
  };

  // getting on sale nfts
  const getting_user_listed_nfts = async () => {
    if (!slug) return;
    setMoreLoading(true);
    const res = await fetch_user_listed_nfts(
      slug,
      saleType,
      currentFilter,
      minPrice,
      maxPrice,
      skip
    );
    if (res) {
      setOnSaleNFTs(res);
      if (res == "") {
        setHasMore(false);
      }
    }
    setFetchedOnSaleNFTs(true);
    setMoreLoading(false);
  };

  const { client } = useContext(TonClientContext);

  // getting owned nfts
  const fetch_user_nfts = async () => {
    setMoreLoading(true);
    const res = await loadNFTs_user(standalone, slug, lastNFT, client);
    let new_nfts = [...nfts];
    res?.nfts
      ?.sort((a, b) => b.last_paid - a.last_paid)
      .map((e, index) => {
        try {
          new_nfts.push({ ...JSON.parse(e.json), ...e });
        } catch (error) {
          new_nfts.push({ ...e });
        }
      });
    setLastNFT(res?.continuation);
    set_nfts(new_nfts);
    setFetchedOwnedNFTs(true);
    setMoreLoading(false);
  };

  // handling for sale nfts more fetch
  const scroll_get_all_nfts = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const res = await fetch_user_listed_nfts(
      slug,
      saleType,
      currentFilter,
      minPrice,
      maxPrice,
      skip
    );
    if (res) {
      setOnSaleNFTs([...onSaleNFTs, ...res]);
      if (res == "") {
        setHasMore(false);
      }
    }
    setMoreLoading(false);
  };

  const handleScroll = () => {
    setSkip(onSaleNFTs.length);
  };

  // handling activity scroll fetch more
  const scrollActivityFetch = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const newArray = await getActivity(
      user_data._id,
      user_data.wallet_id,
      "",
      "",
      activityType,
      activitySkip
    );
    if (newArray) {
      setActivityRecords([...activityRecords, ...newArray]);
      if (newArray == "") {
        setHasMoreActivity(false);
      }
    }
    setMoreLoading(false);
  };

  const handleActivityScroll = () => {
    setActivitySkip(activityRecords.length);
  };

  // buy nft
  const buy_NFT_ = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connect_wallet();
      return;
    }
    setActionLoad(true);
    let royaltyFinalAmount =
      ((parseFloat(selectedNFT?.demandPrice) *
        parseFloat(
          selectedNFT?.NFTCollection?.royalty
            ? selectedNFT?.NFTCollection?.royalty
            : 0
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
        selectedNFT?.NFTCollection?.FloorPrice
      );

      if (buying == true) {
        setActionLoad(false);
        setBuyModal(false);
        setTransactionType("Sale");
        setSkip(0);
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
        selectedNFT?.NFTCollection?.FloorPrice
      );
      if (cancelling == true) {
        setActionLoad(false);
        setCancelModal(false);
        setTransactionType("Cancel");
        setSkip(0);
        setSuccessModal(true);
      }
      if (cancelling == false) {
        setActionLoad(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const switchToOnSale = async () => {
    setOwned(false);
    setCollections(false);
    setActivity(false);
    setOnSale(true);
  };
  const switchToOwned = async () => {
    setCollections(false);
    setActivity(false);
    setOnSale(false);
    setOwned(true);
  };
  const switchToCollections = async () => {
    setActivity(false);
    setOnSale(false);
    setOwned(false);
    setCollections(true);
  };
  const switchToActivity = async () => {
    setOnSale(false);
    setOwned(false);
    setCollections(false);
    setActivity(true);
  };

  useEffect(() => {
    if (!slug) return;
    getProfileData();
  }, [slug]);

  useEffect(() => {
    scrollActivityFetch();
  }, [activitySkip]);

  useEffect(() => {
    scroll_get_all_nfts();
  }, [skip]);

  useEffect(() => {
    getting_user_listed_nfts();
  }, [saleType, currentFilter]);

  useEffect(() => {
    fetch_user_activity();
  }, [activityType]);

  useEffect(() => {
    if (listedFilter || saleTypeFilter || priceRangeFilter) {
      document.body.addEventListener("click", () => {
        showListedFilter(false);
        showSaleTypeFilter(false);
        showPriceRangeFilter(false);
      });
    }
  }, [listedFilter, saleTypeFilter, priceRangeFilter]);

  return loading ? (
    <Loader theme={theme} />
  ) : (
    <div className={`${theme} w-[100%] dark:bg-jacarta-900`}>
      {cancelModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {buyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {successModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      <Head>
        <title>
          {`${user_data?.user_name ? user_data?.user_name : "User Profile"}`} -
          Venomart Marketplace
        </title>
        <meta
          name="description"
          content="Explore users profile, their NFTs, collections and listings | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content={`venomart, ${user_data?.user_name} profile on venomart, ${user_data?.user_name} venomart, ${user_data?.wallet} `}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>
      {/* <!-- Banner IMG--> */}
      <div className="relative pt-24 dark:bg-jacarta-900">
        <Image
          src={
            user_data?.coverImage?.replace(
              "ipfs://",
              "https://ipfs.io/ipfs/"
            ) || defBack
          }
          alt="banner"
          height={100}
          width={100}
          className="h-[18.75rem] w-[100%] object-cover"
        />
      </div>

      {/* <!-- Profile Section --> */}
      <section className="relative pb-6 pt-28 dark:bg-jacarta-900">
        <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
          <div className="relative">
            <Image
              src={
                user_data?.profileImage?.replace(
                  "ipfs://",
                  "https://ipfs.io/ipfs/"
                ) || defLogo
              }
              alt="collection avatar"
              height={100}
              width={100}
              className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[130px] object-cover"
            />
          </div>
        </div>

        <div className="container">
          <div className="text-center">
            {/* username  */}
            <h2 className="mb-6 mt-[-15px] font-display text-4xl font-medium text-jacarta-700 dark:text-white">
              {user_data?.user_name}
            </h2>

            {/* block URL  */}
            <div className="mt-[-30px] mb-8 inline-flex items-center justify-center rounded-full border border-jacarta-100 bg-white py-1.5 px-4 dark:border-jacarta-600 dark:bg-jacarta-700">
              <a
                href={`${blockURL}` + `accounts/` + `${slug}`}
                target="_blank"
                className="js-copy-clipboard max-w-[10rem] select-none overflow-hidden text-ellipsis whitespace-nowrap dark:text-jacarta-200"
              >
                <span>{slug}</span>
              </a>
              <BsArrowUpRight
                className="text-jacarta-700 dark:text-jacarta-200 cursor-pointer"
                onClick={() =>
                  window.open(`${blockURL}` + `accounts/` + `${slug}`, "_blank")
                }
              />
            </div>

            {/* bio  */}
            <p className="mx-auto max-w-xl text-lg dark:text-jacarta-300 mb-6">
              {user_data?.bio}
            </p>

            {/* join date */}
            {user_data?.createdAt && (
              <p className="mx-auto max-w-xl text-[16px] dark:text-jacarta-400 mb-6">
                Joined on {formattedDate}
              </p>
            )}

            {/* social accounts  */}
            <div className="flex justify-center align-middle mb-10 mt-4">
              {user_data?.socials && (
                <>
                  {user_data?.socials[0] && (
                    <a
                      href={
                        user_data?.socials[0].startsWith("https://")
                          ? user_data?.socials[0]
                          : `https://twitter.com/${user_data?.socials[0]}`
                      }
                      target="_blank"
                      className="group mr-4"
                    >
                      <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                    </a>
                  )}
                  {user_data?.socials[1] && (
                    <a
                      href={user_data?.socials[1]}
                      target="_blank"
                      className="group mr-4"
                    >
                      <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                    </a>
                  )}
                  {user_data?.socials[2] && (
                    <a
                      href={user_data?.socials[2]}
                      target="_blank"
                      className="group"
                    >
                      <TfiWorld className="mr-4 h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                    </a>
                  )}
                </>
              )}
              <div
                onClick={() => setShare(!share)}
                className="mt-[-10px] dropdown rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-900"
              >
                <a
                  className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm"
                  role="button"
                  id="collectionShare"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  data-tippy-content="Share"
                >
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
                </a>

                {share && (
                  <div className="dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-900">
                    <a
                      href={`https://twitter.com/intent/tweet?text=Check%20out%20my%20profile%20on%20venomart.io%0AVenomart%20is%20the%20first%20fully-fledged%20NFT%20marketplace%20on%20Venom%20blockchain%20%F0%9F%94%A5%0AHere%20you%20go%20-%20${webURL}profile/${slug}%0A%23Venom%20%23venomart%20%23VenomBlockchain%20%23VenomFoundation%20%23NFT`}
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
            </div>

            {/* edi tprofile btn  */}
            {slug == signer_address && (
              <div className="flex justify-center align-middle mb-10">
                <Link
                  href="EditProfile"
                  className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                >
                  Edit Profile
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* switch buttons  */}
      <section className="pt-6 dark:bg-jacarta-900 pb-12">
        <ul className="customProfileHoriScroll nav nav-tabs scrollbar-custom flex items-center justify-start overflow-x-auto overflow-y-hidden border-b border-jacarta-100 dark:border-jacarta-600 md:justify-center">
          <li
            className="nav-item"
            role="presentation"
            onClick={() => (
              !fetchedOnSaleNFTs && getting_user_listed_nfts(), switchToOnSale()
            )}
          >
            <button
              className={`nav-link ${onSale && "active relative"
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
                <path d="M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm1 2v14h16V5H4zm4.5 9H14a.5.5 0 1 0 0-1h-4a2.5 2.5 0 1 1 0-5h1V6h2v2h2.5v2H10a.5.5 0 1 0 0 1h4a2.5 2.5 0 1 1 0 5h-1v2h-2v-2H8.5v-2z" />
              </svg>
              <span className="font-display text-base font-medium">
                On Sale
              </span>
            </button>
          </li>
          {/* owned button  */}
          <li
            className="nav-item"
            role="presentation"
            onClick={() => (
              !fetchedOwnedNFTs && fetch_user_nfts(), switchToOwned()
            )}
          >
            <button
              className={`nav-link ${owned && "active relative"
                } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
              id="created-tab"
              data-bs-toggle="tab"
              data-bs-target="#created"
              type="button"
              role="tab"
              aria-controls="created"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M5 5v3h14V5H5zM4 3h16a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm2 9h6a1 1 0 0 1 1 1v3h1v6h-4v-6h1v-2H5a1 1 0 0 1-1-1v-2h2v1zm11.732 1.732l1.768-1.768 1.768 1.768a2.5 2.5 0 1 1-3.536 0z" />
              </svg>
              <span className="font-display text-base font-medium">Owned</span>
            </button>
          </li>

          {/* my collections button  */}
          <li
            className="nav-item"
            role="presentation"
            onClick={switchToCollections}
          >
            <button
              className={`nav-link ${collections && "active relative"
                } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
              id="collections-tab"
              data-bs-toggle="tab"
              data-bs-target="#collections"
              type="button"
              role="tab"
              aria-controls="collections"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
              </svg>
              <span className="font-display text-base font-medium">
                Collections (
                {user_data?.nftCollections?.length
                  ? user_data?.nftCollections?.length
                  : "0"}
                )
              </span>
            </button>
          </li>
          <li
            className="nav-item"
            role="presentation"
            onClick={() => (
              !fetchedProfileActivity && fetch_user_activity(),
              switchToActivity()
            )}
          >
            <button
              className={`nav-link ${activity && "active relative"
                } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
              id="activity-tab"
              data-bs-toggle="tab"
              data-bs-target="#activity"
              type="button"
              role="tab"
              aria-controls="activity"
              aria-selected="false"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="24"
                height="24"
                className="mr-1 h-5 w-5 fill-current"
              >
                <path fill="none" d="M0 0h24v24H0z" />
                <path d="M11.95 7.95l-1.414 1.414L8 6.828 8 20H6V6.828L3.465 9.364 2.05 7.95 7 3l4.95 4.95zm10 8.1L17 21l-4.95-4.95 1.414-1.414 2.537 2.536L16 4h2v13.172l2.536-2.536 1.414 1.414z" />
              </svg>
              <span className="font-display text-base font-medium">
                Activity
              </span>
            </button>
          </li>
        </ul>
      </section>

      {/* fetch listed nfts here */}
      {onSale && (
        <section className={`relative pt-6 pb-24 dark:bg-jacarta-900`}>
          <div>
            <div className="tab-content">
              <div className="tab-pane fade show active">
                <div>
                  <div className="collectionFilterDiv bg-white dark:bg-jacarta-900 p-4">
                    {!mobileFilter && isBreakpoint && (
                      <div className="typeModelMainDiv flex justify-center align-middle relative my-1 mr-2.5 mb-4">
                        <button
                          onClick={() => openMobileFilter(true)}
                          className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                        >
                          <div className="flex justify-center align-middle">
                            <AiFillFilter className="mr-1 mt-[2px] h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                            <span className="text-jacarta-700 dark:text-white">
                              Edit Filters
                            </span>
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
                      <button
                        onClick={() => openMobileFilter(false)}
                        className="absolute top-2 right-6 z-20"
                      >
                        <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                      </button>
                    )}
                    {mobileFilter && (
                      <div className="collectionFilterDiv p-4">
                        <div className="collectionFilters mx-6">
                          {/* sale type  */}
                          <div className="typeModelMainDiv relative my-1 mr-2.5">
                            <button
                              onClick={(e) => (
                                e.stopPropagation(),
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
                                {saleType == "All" && (
                                  <span className="text-jacarta-700 dark:text-white">
                                    All NFTs
                                  </span>
                                )}
                                {saleType == "listed" && (
                                  <span className="text-jacarta-700 dark:text-white">
                                    Listed For Sale
                                  </span>
                                )}
                                {saleType == "notlisted" && (
                                  <span className="text-jacarta-700 dark:text-white">
                                    Not For Sale
                                  </span>
                                )}
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
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                              >
                                <ul className="flex flex-col flex-wrap">
                                  <li>
                                    <button
                                      onClick={() => (
                                        setSkip(0),
                                        setHasMore(true),
                                        setMinPrice(0),
                                        setMaxPrice(0),
                                        setSaleType("All"),
                                        showSaleTypeFilter(false)
                                      )}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">
                                        All NFTs
                                      </span>
                                      {saleType == "All" && (
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
                                      )}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => (
                                        setSkip(0),
                                        setHasMore(true),
                                        setMinPrice(0),
                                        setMaxPrice(0),
                                        setSaleType("listed"),
                                        showSaleTypeFilter(false)
                                      )}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">
                                        Listed For sale
                                      </span>
                                      {saleType == "listed" && (
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
                                      )}
                                    </button>
                                  </li>
                                  <li>
                                    <button
                                      onClick={() => (
                                        setSkip(0),
                                        setHasMore(true),
                                        setMinPrice(0),
                                        setMaxPrice(0),
                                        setSaleType("notlisted"),
                                        showSaleTypeFilter(false)
                                      )}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">
                                        Not for sale
                                      </span>
                                      {saleType == "notlisted" && (
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
                                      )}
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
                                <span className="text-jacarta-700 dark:text-white">
                                  All Price Range
                                </span>
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
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                              >
                                <div className="flex items-center space-x-3 px-5 pb-2">
                                  <input
                                    type="number"
                                    placeholder="From"
                                    min="0"
                                    onInput={(e) =>
                                    (e.target.value = Math.abs(
                                      e.target.value
                                    ))
                                    }
                                    // value={minPrice}
                                    onChange={(e) => (
                                      setSkip(0),
                                      setHasMore(true),
                                      setMinPrice(parseFloat(e.target.value))
                                    )}
                                    className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                  />
                                  <input
                                    type="number"
                                    placeholder="To"
                                    min="0"
                                    onInput={(e) =>
                                    (e.target.value = Math.abs(
                                      e.target.value
                                    ))
                                    }
                                    // value={maxPrice}
                                    onChange={(e) => (
                                      setSkip(0),
                                      setHasMore(true),
                                      setMaxPrice(parseFloat(e.target.value))
                                    )}
                                    className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                  />
                                </div>

                                <div className="-ml-2 -mr-2 mt-4 flex items-center justify-center space-x-3 border-t border-jacarta-100 px-7 pt-4 dark:border-jacarta-600">
                                  <button
                                    type="button"
                                    onClick={() => (
                                      setMaxPrice(0),
                                      setMinPrice(0),
                                      showPriceRangeFilter(false)
                                    )}
                                    className="flex-1 rounded-full bg-white py-2 px-6 text-center text-sm font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                  >
                                    Clear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => (
                                      getting_user_listed_nfts(),
                                      showPriceRangeFilter(false)
                                    )}
                                    className="flex-1 rounded-full bg-accent py-2 px-6 text-center text-sm font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                  >
                                    Apply
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* search  */}
                        <div className="collectionSearch">
                          <div className="typeModelMainDiv relative my-1 mr-2.5 cursor-pointer">
                            <div
                              onClick={(e) => (
                                e.stopPropagation(),
                                showPriceRangeFilter(false),
                                showSaleTypeFilter(false),
                                showListedFilter(!listedFilter)
                              )}
                              className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            >
                              {currentFilter == "recentlyListed" && (
                                <span className="text-jacarta-700 dark:text-white">
                                  Recently Listed
                                </span>
                              )}
                              {currentFilter == "lowToHigh" && (
                                <span className="text-jacarta-700 dark:text-white">
                                  Low To High
                                </span>
                              )}
                              {currentFilter == "highToLow" && (
                                <span className="text-jacarta-700 dark:text-white">
                                  High To Low
                                </span>
                              )}
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
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                              >
                                <span className="block px-5 py-2 font-display text-sm font-semibold text-jacarta-300">
                                  Sort By
                                </span>
                                <button
                                  onClick={() => (
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("recentlyListed"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                >
                                  Recently Listed
                                  {currentFilter == "recentlyListed" && (
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
                                  )}
                                </button>
                                <button
                                  onClick={() => (
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("lowToHigh"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Price: Low to High
                                  {currentFilter == "lowToHigh" && (
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
                                  )}
                                </button>

                                <button
                                  onClick={() => (
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("highToLow"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Price: High to Low
                                  {currentFilter == "highToLow" && (
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
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center align-middle flex-wrap">
                    <InfiniteScroll
                      dataLength={onSaleNFTs ? onSaleNFTs?.length : 0}
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
                      {onSaleNFTs?.map((e, index) => {
                        return (
                          <NftCard
                            key={index}
                            ImageSrc={e?.nft_image}
                            Name={e?.name}
                            Address={e?.NFTAddress}
                            Owner={e?.ownerAddress}
                            signerAddress={signer_address}
                            listedBool={e?.isListed}
                            listingPrice={e?.listingPrice}
                            NFTCollectionAddress={
                              e?.NFTCollection?.contractAddress
                            }
                            NFTCollectionName={e?.NFTCollection?.name}
                            NFTCollectionStatus={e?.NFTCollection?.isVerified}
                            setAnyModalOpen={setAnyModalOpen}
                            setCancelModal={setCancelModal}
                            setBuyModal={setBuyModal}
                            NFTData={e}
                            setSelectedNFT={setSelectedNFT}
                            cartNFTs={cartNFTs}
                            setCartNFTs={setCartNFTs}
                          />
                        );
                      })}
                    </InfiniteScroll>
                  </div>
                  <div className="flex justify-center">
                    {onSaleNFTs.length <= 0 && !moreLoading && (
                      <h2 className="text-xl font-display font-thin dark:text-jacarta-200 py-12">
                        No NFTs found!
                      </h2>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* fetch owned nfts  */}
      {owned && (
        <section className={`relative pt-6 pb-24 dark:bg-jacarta-900`}>
          <div>
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="on-sale"
                role="tabpanel"
                aria-labelledby="on-sale-tab"
              >
                <div className="flex justify-center align-middle flex-wrap">
                  <InfiniteScroll
                    dataLength={nfts.length}
                    next={fetch_user_nfts}
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
                          ImageSrc={e?.preview?.source?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          Name={e?.name}
                          Address={e?.nft._address}
                          Description={e?.description}
                          NFTCollectionName={e?.collection_name}
                          NFTCollectionAddress={e?.collection?._address}
                          cartNFTs={cartNFTs}
                          setCartNFTs={setCartNFTs}
                        />
                      );
                    })}
                  </InfiniteScroll>
                </div>

                <div className="flex justify-center">
                  {nfts?.length <= 0 && !moreLoading && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No NFTs to show!
                    </h2>
                  )}
                  {nfts?.length <= 0 && moreLoading && (
                    <div className="flex items-center justify-center space-x-2">
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
      )}

      {/* //fetch collections here */}
      {collections && (
        <section className="relative pt-6 pb-24 dark:bg-jacarta-900">
          <div>
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="on-sale"
                role="tabpanel"
                aria-labelledby="on-sale-tab"
              >
                <div className="flex justify-center align-middle flex-wrap">
                  {NFTCollections?.map((e, index) => (
                    <CollectionCard
                      key={index}
                      Cover={e?.coverImage}
                      Logo={e?.logo}
                      Name={e?.name}
                      Description={e?.description}
                      OwnerAddress={e?.creatorAddress}
                      CollectionAddress={e?.contractAddress}
                      verified={e?.isVerified}
                      Listing={e?.TotalListed}
                      Volume={e?.TotalVolume}
                      FloorPrice={e?.FloorPrice}
                      TotalSupply={e?.TotalSupply}
                    />
                  ))}
                </div>
                <div className="flex justify-center">
                  {NFTCollections?.length <= 0 && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No Collections to show!
                    </h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* fetch activity here  */}
      {activity && (
        <section className="relative pt-6 pb-24 dark:bg-jacarta-900">
          <div className="container">
            <div className="tab-pane fade show active">
              <div>
                {/* filters  */}
                <div className="collectionFilterDiv bg-white dark:bg-jacarta-900 p-4">
                  {!mobileFilter && isBreakpoint && (
                    <div className="typeModelMainDiv flex justify-center align-middle relative my-1 mr-2.5 mb-4">
                      <button
                        onClick={() => openMobileFilter(true)}
                        className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                      >
                        <div className="flex justify-center align-middle">
                          <AiFillFilter className="mr-1 mt-[2px] h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                          <span className="text-jacarta-700 dark:text-white">
                            Edit Filters
                          </span>
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
                    <button
                      onClick={() => openMobileFilter(false)}
                      className="absolute top-2 right-6 z-20"
                    >
                      <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                    </button>
                  )}
                  {mobileFilter && (
                    <div className="flex flex-wrap">
                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setHasMoreActivity(true),
                          setUserPurchases(false),
                          setActivityType("")
                        )}
                        className={`${activityType == ""
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <span
                          className={`text-2xs font-medium  ${activityType == "" && "text-white"
                            }`}
                        >
                          All
                        </span>
                      </button>
                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setHasMoreActivity(true),
                          setUserPurchases(false),
                          setActivityType("list")
                        )}
                        className={`${activityType == "list"
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "list"
                            ? "fill-white"
                            : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"
                            }`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span
                          className={`text-2xs font-medium  ${activityType == "list" && "text-white"
                            }`}
                        >
                          Listing
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setHasMoreActivity(true),
                          setUserPurchases(false),
                          setActivityType("cancel")
                        )}
                        className={`${activityType == "cancel"
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "cancel"
                            ? "fill-white"
                            : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"
                            }`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                        </svg>
                        <span
                          className={`text-2xs font-medium ${activityType == "cancel" && "text-white"
                            }`}
                        >
                          Remove Listing
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setHasMoreActivity(true),
                          setUserPurchases(true),
                          setActivityType("sale")
                        )}
                        className={`${activityType == "sale"
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "sale"
                            ? "fill-white"
                            : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"
                            }`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                        </svg>
                        <span
                          className={`text-2xs font-medium ${activityType == "sale" && "text-white"
                            }`}
                        >
                          Purchase
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setHasMoreActivity(true),
                          setUserPurchases(false),
                          setActivityType("user_sale")
                        )}
                        className={`${activityType == "user_sale"
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="24"
                          height="24"
                          className={`mr-2 h-4 w-4 ${activityType == "user_sale"
                            ? "fill-white"
                            : "group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"
                            }`}
                        >
                          <path fill="none" d="M0 0h24v24H0z" />
                          <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                        </svg>
                        <span
                          className={`text-2xs font-medium ${activityType == "user_sale" && "text-white"
                            }`}
                        >
                          Sale
                        </span>
                      </button>
                    </div>
                  )}
                </div>
                <div
                  className={`mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10`}
                >
                  <div className="flex justify-center align-middle flex-wrap">
                    <InfiniteScroll
                      dataLength={activityRecords ? activityRecords?.length : 0}
                      next={handleActivityScroll}
                      hasMore={hasMoreActivity}
                      className="flex flex-wrap justify-center align-middle"
                      loader={
                        <div className="flex items-center justify-center align-middle space-x-2">
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        </div>
                      }
                    >
                      {activityRecords?.map((e, index) => (
                        <ActivityRecord
                          key={index}
                          NFTImage={e?.item?.nft_image}
                          NFTName={e?.item?.name}
                          NFTAddress={e?.item?.NFTAddress}
                          Price={e?.price}
                          ActivityTime={e?.createdAt}
                          ActivityType={e?.type}
                          userPurchases={userPurchases}
                          blockURL={blockURL}
                          ActivityHash={e?.hash}
                          From={e?.from}
                          To={e?.to}
                          FromUser={e?.fromUser}
                          ToUser={e?.toUser}
                          MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                          signerAddress={signer_address}
                        />
                      ))}
                    </InfiniteScroll>
                    <div className="flex justify-center text-center">
                      {activityRecords?.length <= 0 && (
                        <h2 className="text-xl font-display font-thin dark:text-jacarta-200 py-12">
                          No Activity Found!
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center">
                {activity === undefined && (
                  <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                    No activities yet!
                  </h2>
                )}
              </div>
            </div>
          </div>
        </section>
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

      {/* success modal  */}
      {successModal && (
        <SuccessModal
          setSuccessModal={setSuccessModal}
          setAnyModalOpen={setAnyModalOpen}
          onCloseFunctionCall={getting_user_listed_nfts}
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
  );
};

export default Profile;
