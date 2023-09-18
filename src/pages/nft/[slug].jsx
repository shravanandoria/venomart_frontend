import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import defLogo from "../../../public/deflogo.png";
import Image from "next/image";
import Head from "next/head";
import Loader from "../../components/Loader";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import {
  buy_nft,
  get_nft_by_address,
  listing_fees,
  platform_fees,
} from "../../utils/user_nft";
import { list_nft, cancel_listing } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import {
  nftInfo,
  update_verified_nft_data,
  update_verified_nft_image,
} from "../../utils/mongo_api/nfts/nfts";
import { MARKETPLACE_ADDRESS } from "../../utils/user_nft";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { get_collection_if_nft_onchain } from "../../utils/mongo_api/collection/collection";
import NFTActivityCard from "../../components/cards/NFTActivityCard";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import BuyModal from "../../components/modals/BuyModal";
import CancelModal from "../../components/modals/CancelModal";
import SuccessModal from "../../components/modals/SuccessModal";
import ListModal from "../../components/modals/ListModal";

const NFTPage = ({
  signer_address,
  blockChain,
  blockURL,
  currency,
  theme,
  standalone,
  venomProvider,
  webURL,
  setAnyModalOpen,
  connectWallet
}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [pageLoading, setPageLoading] = useState(false);
  const [loading, set_loading] = useState(false);
  const [isHovering, SetIsHovering] = useState(false);

  const [listSale, setListSale] = useState(false);
  const [buyModal, setBuyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [onchainNFTData, setOnchainNFTData] = useState(false);
  const [collectionData, setCollectionData] = useState(false);

  const [properties, setProperties] = useState(true);
  const [offers, setOffers] = useState(false);
  const [details, setDetails] = useState(false);
  const [activity, setActivity] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [fetchedNFTActivity, setfetchedNFTActivity] = useState(false);
  const [actionDrop, setActionDrop] = useState(false);
  const [metaDataUpdated, setMetaDataUpdated] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [listingPrice, set_listing_price] = useState(0);
  const [finalListingPrice, setFinalListingPrice] = useState(0);
  const [creatorRoyalty, setCreatorRoyalty] = useState(0);
  const [platformFees, setPlatformFees] = useState(0);
  const [skip, setSkip] = useState(0);

  const [nft, set_nft_info] = useState({});
  const [activeOffers, setActiveOffers] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [activityType, setActivityType] = useState("");
  const [transactionType, setTransactionType] = useState("");

  // connecting wallet 
  const connect_wallet = async () => {
    const connect = await connectWallet();
  };

  // getting nft information
  const nft_info = async () => {
    if (!standalone && !slug) return;
    setPageLoading(true);
    const nft_database = await nftInfo(slug);
    if (nft_database) {
      let obj = {
        ...nft_database,
        attributes:
          nft_database?.attributes != ""
            ? JSON.parse(nft_database?.attributes)
            : [],
      };
      set_nft_info({ ...obj });
    }
    if (nft_database == undefined) {
      const nft_onchain = await get_nft_by_address(standalone, slug);
      setOnchainNFTData(true);
      set_nft_info(nft_onchain);
    }
    setPageLoading(false);
  };

  // refresh nft metadata
  const refreshMetadata = async () => {
    if (metaDataUpdated == true) return;
    setMetadataLoading(true);
    const nft_onchain = await get_nft_by_address(standalone, slug);
    let OnChainOwner = nft_onchain?.owner?._address;
    let OnChainManager = nft_onchain?.manager?._address;
    let onChainImage = nft_onchain?.preview?.source;

    let offChainOwner = nft?.ownerAddress;
    let offChainManager = nft?.managerAddress;
    let offChainImage = nft?.nft_image;

    if (OnChainOwner != offChainOwner || OnChainManager != offChainManager || offChainImage === "") {
      if (offChainImage === "") {
        const updateNFTImage = await update_verified_nft_image(
          onChainImage,
          slug
        );
        alert("Metadata updated successfully");
      }

      if (OnChainOwner != offChainOwner || OnChainManager != offChainManager) {
        const updateNFTData = await update_verified_nft_data(
          OnChainOwner,
          OnChainManager,
          slug
        );
        alert("Owners data updated successfully");
      }

      setMetadataLoading(false);
      router.reload();
      setMetaDataUpdated(true);
      return;
    }
    setMetaDataUpdated(true);
    setMetadataLoading(false);
    alert("Metadata is already up to date");
  };

  // fetching nft activity
  const fetch_nft_activity = async () => {
    if (nft._id == undefined) return;
    setMoreLoading(true);
    const res = await getActivity("", "", "", nft._id, activityType, skip);
    if (res) {
      setActivityHistory(res);
    }
    setfetchedNFTActivity(true);
    setMoreLoading(false);
  };

  // on scroll fetch nft activity
  const scroll_fetch_nft_activity = async () => {
    if (skip == 0) return;
    setMoreLoading(true);
    const res = await getActivity("", "", "", nft._id, activityType, skip);
    if (res) {
      setActivityHistory([...activityHistory, ...res]);
    }
    setMoreLoading(false);
  };

  const handleScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(activityHistory.length);
    }
  };

  // list nft for sale
  const sell_nft = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connect_wallet();
      return;
    }
    set_loading(true);

    let newFloorPrice = 0;
    if (
      finalListingPrice <
      (nft?.NFTCollection?.FloorPrice
        ? nft?.NFTCollection?.FloorPrice
        : collectionData?.data?.FloorPrice)
    ) {
      newFloorPrice = finalListingPrice;
    }
    try {
      const listing = await list_nft(
        standalone,
        nft?.ownerAddress,
        nft?.managerAddress,
        slug,
        nft?.NFTCollection?.contractAddress
          ? nft?.NFTCollection?.contractAddress
          : nft?.collection?._address,
        listingPrice,
        nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice,
        venomProvider,
        signer_address,
        nft,
        onchainNFTData,
        finalListingPrice,
        newFloorPrice
      );
      if (listing == true) {
        set_loading(false);
        setListSale(false);
        setTransactionType("List");
        nft_info();
        setSuccessModal(true);
      }
      if (listing == false) {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // buy nft
  const buy_NFT_ = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connect_wallet();
      return;
    }
    set_loading(true);
    let royaltyFinalAmount =
      ((parseFloat(nft?.demandPrice) *
        parseFloat(
          nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : 0
        )) /
        100) *
      1000000000;
    try {
      const buying = await buy_nft(
        venomProvider,
        standalone,
        nft?.ownerAddress,
        nft?.managerAddress,
        slug,
        nft?.NFTCollection?.contractAddress,
        nft.listingPrice,
        (nft.listingPrice * 1000000000).toString(),
        (nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice),
        signer_address,
        royaltyFinalAmount,
        nft?.NFTCollection?.royaltyAddress
          ? nft?.NFTCollection?.royaltyAddress
          : "0:0000000000000000000000000000000000000000000000000000000000000000"
      );

      if (buying == true) {
        set_loading(false);
        setBuyModal(false);
        setTransactionType("Sale");
        setSuccessModal(true);
      }
      if (buying == false) {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // cancel nft sale
  const cancelNFT = async (e) => {
    e.preventDefault();
    if (!signer_address) {
      connect_wallet();
      return;
    }
    set_loading(true);
    try {
      const cancelling = await cancel_listing(
        standalone,
        nft?.ownerAddress,
        nft?.managerAddress,
        slug,
        nft?.NFTCollection?.contractAddress,
        venomProvider,
        signer_address,
        (nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice)
      );
      if (cancelling == true) {
        set_loading(false);
        setCancelModal(false);
        setTransactionType("Cancel");
        setSuccessModal(true);
      }
      if (cancelling == false) {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // getting collection info if onChainData
  const getCollectionDataForOnchain = async () => {
    const collection_data = await get_collection_if_nft_onchain(
      nft?.collection?._address
    );
    if (collection_data) {
      setCollectionData(collection_data);
    }
  };

  const switchPropeties = async () => {
    setOffers(false);
    setDetails(false);
    setActivity(false);
    setProperties(true);
  };

  const switchOffers = async () => {
    setDetails(false);
    setActivity(false);
    setProperties(false);
    setOffers(true);
  };

  const switchDetails = async () => {
    setActivity(false);
    setProperties(false);
    setOffers(false);
    setDetails(true);
  };

  const switchActivity = async () => {
    setProperties(false);
    setOffers(false);
    setDetails(false);
    setActivity(true);
  };

  useEffect(() => {
    nft_info();
  }, [slug]);

  useEffect(() => {
    scroll_fetch_nft_activity();
  }, [skip]);

  useEffect(() => {
    fetch_nft_activity();
  }, [activityType]);

  return (
    <>
      <Head>
        <title>{`${nft?.name ? nft?.name : "NFT"
          } - Venomart Marketplace`}</title>
        <meta
          name="description"
          content={`${nft?.name
            ? nft?.name
            : "Explore, Create and Experience exculsive gaming NFTs on Venomart"
            } | An NFT on Venom Blockchain`}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {/* modal background  */}
      {listSale && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {buyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {successModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {cancelModal && (
        <div className="backgroundModelBlur backdrop-blur-lg"></div>
      )}

      {pageLoading ? (
        <Loader theme={theme} />
      ) : (
        <section className={`${theme}`}>
          <div className={`relative pt-32 pb-24 dark:bg-jacarta-900`}>
            <div className="container">
              <div className="md:flex md:flex-wrap">
                <div className="relative mb-8 md:w-2/5 md:flex-shrink-0 md:flex-grow-0 md:basis-auto lg:w-1/2">
                  <Image
                    src={
                      onchainNFTData
                        ? nft?.preview?.source
                        : nft?.nft_image?.replace(
                          "ipfs://",
                          "https://ipfs.io/ipfs/"
                        )
                    }
                    width={100}
                    height={100}
                    alt="item"
                    className="cursor-pointer rounded-2.5xl h-[auto] w-[100%]"
                  />
                </div>

                {/* <!-- Details --> */}
                <div className="md:w-3/5 md:basis-auto md:pl-8 lg:w-1/2 lg:pl-[3.75rem]">
                  <div className="mb-3 flex">
                    {/* <!-- Collection --> */}
                    <div className="flex items-center">
                      <Link
                        href={`/collection/${onchainNFTData
                          ? nft?.collection?._address
                          : nft?.NFTCollection?.contractAddress
                          }`}
                        className="mr-2 text-sm font-bold text-accent"
                      >
                        {onchainNFTData
                          ? collectionData?.data?.name
                            ? collectionData?.data?.name
                            : nft?.collection?._address?.slice(0, 5) +
                            "..." +
                            nft?.collection?._address?.slice(63)
                          : nft?.NFTCollection?.name
                            ? nft?.NFTCollection?.name
                            : nft?.NFTCollection?.contractAddress?.slice(0, 5) +
                            "..." +
                            nft?.NFTCollection?.contractAddress?.slice(63)}
                      </Link>
                      {!onchainNFTData ? (
                        nft?.NFTCollection?.isVerified ? (
                          <MdVerified
                            style={{ color: "#4f87ff", marginLeft: "-4px" }}
                            size={25}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                        ) : (
                          <BsFillExclamationCircleFill
                            style={{ color: "#c3c944", marginLeft: "-4px" }}
                            size={20}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                        )
                      ) : (
                        collectionData &&
                        (collectionData?.data?.isVerified ? (
                          <MdVerified
                            style={{ color: "#4f87ff", marginLeft: "-4px" }}
                            size={25}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                        ) : (
                          <BsFillExclamationCircleFill
                            style={{ color: "#c3c944", marginLeft: "-4px" }}
                            size={20}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                        ))
                      )}
                    </div>
                    <div className="absolute mt-[-18px] ml-[90px] inline-flex items-center justify-center">
                      {(nft?.NFTCollection?.isVerified || collectionData?.data?.isVerified) && isHovering && (
                        <p
                          className="bg-blue px-[20px] py-[3px] text-white text-[12px]"
                          style={{ borderRadius: "10px" }}
                        >
                          Verified
                        </p>
                      )}
                      {(nft?.NFTCollection?.isVerified == false || collectionData?.data?.isVerified == false) && isHovering && (
                        <p
                          className="bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]"
                          style={{ borderRadius: "10px" }}
                        >
                          Not Verified
                        </p>
                      )}
                    </div>

                    <div className="ml-auto flex space-x-2">
                      {/* <div className="flex items-center space-x-1 rounded-xl border border-jacarta-100 bg-white py-2 px-4 dark:border-jacarta-600 dark:bg-jacarta-700">
                        <span
                          className="js-likes relative cursor-pointer before:absolute before:h-4 before:w-4 before:bg-cover before:bg-center before:bg-no-repeat before:opacity-0">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                            className="h-4 w-4 fill-jacarta-500 hover:fill-red dark:fill-jacarta-200 dark:hover:fill-red">
                            <path fill="none" d="M0 0H24V24H0z"></path>
                            <path
                              d="M12.001 4.529c2.349-2.109 5.979-2.039 8.242.228 2.262 2.268 2.34 5.88.236 8.236l-8.48 8.492-8.478-8.492c-2.104-2.356-2.025-5.974.236-8.236 2.265-2.264 5.888-2.34 8.244-.228zm6.826 1.641c-1.5-1.502-3.92-1.563-5.49-.153l-1.335 1.198-1.336-1.197c-1.575-1.412-3.99-1.35-5.494.154-1.49 1.49-1.565 3.875-.192 5.451L12 18.654l7.02-7.03c1.374-1.577 1.299-3.959-.193-5.454z">
                            </path>
                          </svg>
                        </span>
                        <span className="text-sm dark:text-jacarta-200">1</span>
                      </div> */}

                      <div className="relative dropdown rounded-xl border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600">
                        <button
                          onClick={() => setActionDrop(!actionDrop)}
                          className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm"
                          id="collectionActions"
                        >
                          <svg
                            width="16"
                            height="4"
                            viewBox="0 0 16 4"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="fill-jacarta-500 dark:fill-jacarta-200"
                          >
                            <circle cx="2" cy="2" r="2"></circle>
                            <circle cx="8" cy="2" r="2"></circle>
                            <circle cx="14" cy="2" r="2"></circle>
                          </svg>
                        </button>

                        {actionDrop && (
                          <div className="absolute left-[-160px] dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                            {!onchainNFTData &&
                              (metadataLoading ? (
                                <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                  <div className="flex space-x-2">
                                    <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                                  </div>
                                </button>
                              ) : (
                                <button
                                  onClick={() => refreshMetadata()}
                                  className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600"
                                >
                                  Refresh Metadata
                                </button>
                              ))}
                            <a
                              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20NFT%20on%20venomart.io%0AThis%20NFT%20is%20part%20of%20${nft?.NFTCollection?.name
                                ? nft?.NFTCollection?.name
                                : "NFT"
                                }%20collection%20minted%20on%20venom%20blockchain%0ACheck%20it%20out%20here%20-%20${webURL}nft/${slug}%0A%23NFT%20%23venomartNFTs%20%23venomart%20%23Venom%20%23VenomBlockchain`}
                              target="_blank"
                              className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600"
                            >
                              Share
                            </a>
                            <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                              Report
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* nft title  */}
                  <h1 className="mb-4 font-display text-4xl font-semibold text-jacarta-700 dark:text-white">
                    {nft?.name}
                  </h1>

                  {/* nnft desc  */}
                  <p className="mb-10 dark:text-jacarta-300">
                    {nft?.description}
                  </p>

                  <div className="mb-8 flex flex-wrap">
                    {/* <!-- Owner --> */}
                    <div className="mb-4 flex">
                      <div className="mr-4 shrink-0">
                        <a className="relative block">
                          <Image
                            src={
                              nft?.ownerImage
                                ? nft?.ownerImage.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )
                                : defLogo
                            }
                            height={40}
                            width={40}
                            alt="avatar 1"
                            className="rounded-2lg "
                          />
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">
                          Owner
                        </span>
                        {MARKETPLACE_ADDRESS === nft?.ownerAddress ? (
                          <Link
                            href={`/profile/${MARKETPLACE_ADDRESS}`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">Market</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/profile/${onchainNFTData
                              ? nft?.owner?._address
                              : nft?.ownerAddress
                              }`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">
                              {(onchainNFTData
                                ? nft?.owner?._address?.slice(0, 5)
                                : nft?.ownerAddress?.slice(0, 5)) +
                                "..." +
                                (onchainNFTData
                                  ? nft?.owner?._address?.slice(63)
                                  : nft?.ownerAddress?.slice(63))}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>

                    {/* manager  */}
                    <div className="mb-4 ml-12 flex">
                      <div className="mr-4 shrink-0">
                        <a className="relative block">
                          <Image
                            src={
                              nft?.ownerImage
                                ? nft?.ownerImage.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/"
                                )
                                : defLogo
                            }
                            height={40}
                            width={40}
                            alt="avatar 1"
                            className="rounded-2lg "
                          />
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">
                          Manager
                        </span>
                        {MARKETPLACE_ADDRESS === nft?.managerAddress ? (
                          <Link
                            href={`/profile/${MARKETPLACE_ADDRESS}`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">Market</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/profile/${onchainNFTData
                              ? nft?.manager?._address
                              : nft?.managerAddress
                              }`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">
                              {(onchainNFTData
                                ? nft?.manager?._address?.slice(0, 5)
                                : nft?.managerAddress?.slice(0, 5)) +
                                "..." +
                                (onchainNFTData
                                  ? nft?.manager?._address?.slice(63)
                                  : nft?.managerAddress?.slice(63))}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* -------------------------- all action buttons start ------------------------  */}

                  {/* <!-- list nft --> */}
                  {(onchainNFTData
                    ? nft?.manager?._address
                    : nft?.managerAddress) == signer_address && (
                      <div className="rounded-2lg  border-jacarta-100 p-8 dark:border-jacarta-600">
                        <button
                          onClick={() => (
                            onchainNFTData && getCollectionDataForOnchain(),
                            setListSale(true),
                            setAnyModalOpen(true)
                          )}
                          href="#"
                          className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          List For Sale
                        </button>
                      </div>
                    )}

                  {/* buy now section  */}
                  {nft?.isListed == true &&
                    (onchainNFTData
                      ? nft?.owner?._address
                      : nft?.ownerAddress) !== signer_address && (
                      <div className="rounded-2lg border-jacarta-100 p-8 dark:border-jacarta-600">
                        <div className="mb-8 sm:flex sm:flex-wrap">
                          <div className="sm:w-1/2 sm:pr-4 lg:pr-8">
                            <div className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">
                                Price
                              </span>
                            </div>
                            <div className="mt-3 flex">
                              <div>
                                <div className="flex items-center whitespace-nowrap align-middle">
                                  <span className="dark:text-jacarta-200 mr-2 mt-1">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-5 w-5"
                                    />
                                  </span>
                                  <span className="text-[24px] font-medium leading-tight tracking-tight text-green">
                                    {nft?.listingPrice
                                      ? nft?.listingPrice
                                      : "0.00"}
                                  </span>
                                  {/* <span className="text-[19px] text-jacarta-700 dark:text-jacarta-200 ml-2">
                                    {currency}
                                  </span> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {loading ? (
                          <button
                            type="button"
                            className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            Proccessing{" "}
                            <svg
                              aria-hidden="true"
                              className="inline w-6 h-6 ml-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => (
                                setBuyModal(true), setAnyModalOpen(true)
                              )}
                              className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                            >
                              Buy Now
                            </button>
                          </>
                        )}
                      </div>
                    )}

                  {/* <!-- cancel nft sale --> */}
                  {(onchainNFTData
                    ? nft?.owner?._address
                    : nft?.ownerAddress) == signer_address &&
                    nft?.isListed == true && (
                      <div className="rounded-2lg  border-jacarta-100 p-8 dark:border-jacarta-600">
                        <div className="mb-8 sm:flex sm:flex-wrap">
                          <div className="sm:w-1/2 sm:pr-4 lg:pr-8">
                            <div className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">
                                Listed on sale for
                              </span>
                            </div>
                            <div className="mt-3 flex">
                              <div>
                                <div className="flex items-center whitespace-nowrap align-middle">
                                  <span className="dark:text-jacarta-200 mr-2 mt-1">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-5 w-5"
                                    />
                                  </span>
                                  <span className="text-[24px] font-medium leading-tight tracking-tight text-green">
                                    {nft?.listingPrice
                                      ? nft?.listingPrice
                                      : "0.00"}
                                  </span>
                                  {/* <span className="text-[19px] text-jacarta-700 dark:text-jacarta-200 ml-2">
                                    {currency}
                                  </span> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        {loading ? (
                          <button
                            type="button"
                            className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            Proccessing{" "}
                            <svg
                              aria-hidden="true"
                              className="inline w-6 h-6 ml-3 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                              viewBox="0 0 100 101"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"
                              />
                              <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"
                              />
                            </svg>
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                            onClick={() => (
                              setCancelModal(true), setAnyModalOpen(true)
                            )}
                          >
                            Cancel Sale
                          </button>
                        )}
                      </div>
                    )}

                  {/* <!-- not listed --> */}
                  {(onchainNFTData
                    ? nft?.manager?._address
                    : nft?.managerAddress) !== signer_address &&
                    nft?.isListed == false && (
                      <div className="rounded-2lg border-jacarta-100 p-8 dark:border-jacarta-600">
                        <button
                          type="button"
                          className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Not Listed
                        </button>
                      </div>
                    )}

                  {/* -------------------------- all action buttons end ------------------------  */}
                </div>
              </div>

              {/* <!-- other detail Tabs --> */}
              <div className="scrollbar-custom mt-14 overflow-x-auto rounded-lg">
                <div className="min-w-fit">
                  {/* <!-- Tabs Nav --> */}
                  <ul className="nav nav-tabs flex items-center" role="tablist">
                    {/* <!-- Properties --> */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={switchPropeties}
                    >
                      <button
                        className={`nav-link ${properties && "active relative"
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
                          <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                        </svg>
                        <span className="font-display text-base font-medium">
                          Properties
                        </span>
                      </button>
                    </li>

                    {/* offers  */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={switchOffers}
                    >
                      <button
                        className={`nav-link ${offers && "active relative"
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
                          <path d="M8 4h13v2H8V4zm-5-.5h3v3H3v-3zm0 7h3v3H3v-3zm0 7h3v3H3v-3zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
                        </svg>
                        <span className="font-display text-base font-medium">
                          Offers
                        </span>
                      </button>
                    </li>

                    {/* <!-- Details --> */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={switchDetails}
                    >
                      <button
                        className={`nav-link ${details && "active relative"
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
                          <path d="M20 22H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1zm-1-2V4H5v16h14zM7 6h4v4H7V6zm0 6h10v2H7v-2zm0 4h10v2H7v-2zm6-9h4v2h-4V7z" />
                        </svg>
                        <span className="font-display text-base font-medium">
                          Details
                        </span>
                      </button>
                    </li>

                    {/* activity  */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={() => (
                        !fetchedNFTActivity && fetch_nft_activity(),
                        switchActivity()
                      )}
                    >
                      <button
                        className={`nav-link ${activity && "active relative"
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
                          <path d="M11.95 7.95l-1.414 1.414L8 6.828 8 20H6V6.828L3.465 9.364 2.05 7.95 7 3l4.95 4.95zm10 8.1L17 21l-4.95-4.95 1.414-1.414 2.537 2.536L16 4h2v13.172l2.536-2.536 1.414 1.414z" />
                        </svg>
                        <span className="font-display text-base font-medium">
                          Activity
                        </span>
                      </button>
                    </li>
                  </ul>

                  {/* <!-- Tab Content --> */}
                  <div className="tab-content">
                    {properties && (
                      <div>
                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-700 md:p-10">
                          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4">
                            {nft?.attributes?.map((e, index) => {
                              return (
                                <a
                                  key={index}
                                  className="flex flex-col space-y-2 rounded-2lg border border-jacarta-100 bg-light-base p-5 text-center transition-shadow hover:shadow-lg dark:border-jacarta-600 dark:bg-jacarta-800"
                                >
                                  <span className="text-sm uppercase text-accent">
                                    {e.type}
                                  </span>
                                  <span className="text-base text-jacarta-700 dark:text-white">
                                    {e.value}
                                  </span>
                                </a>
                              );
                            })}
                            {nft?.attributes == "" && (
                              <p className="text-jacarta-700 dark:text-white">
                                No Properties
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {offers && (
                      <div
                        className="tab-pane fade show active"
                        id="offers"
                        role="tabpanel"
                        aria-labelledby="offers-tab"
                      >
                        <div
                          role="table"
                          className="scrollbar-custom grid max-h-72 w-full grid-cols-5 overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                        >
                          <div className="contents" role="row">
                            <div
                              className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Price
                              </span>
                            </div>
                            <div
                              className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                USD Price
                              </span>
                            </div>
                            <div
                              className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Expiration
                              </span>
                            </div>
                            <div
                              className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                From
                              </span>
                            </div>
                            <div
                              className="sticky top-0 bg-light-base py-2 px-4 dark:bg-jacarta-600"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Action
                              </span>
                            </div>
                          </div>

                          {/* offers loop here  */}
                          {/* <div className="contents" role="row">
                            <div
                              className="flex items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                              role="cell">
                              <span className="text-sm font-medium tracking-tight text-green">30 ETH</span>
                            </div>
                            <div className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                              role="cell">
                              $90,136.10
                            </div>
                            <div className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                              role="cell">
                              in 5 months
                            </div>
                            <div className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                              role="cell">
                              <a href="user.html" className="text-accent">ViviGiallo</a>
                            </div>
                            <div className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                              role="cell">
                              Cancel
                            </div>
                          </div> */}

                          <div className="flex p-4">
                            {activeOffers == "" && (
                              <p className="text-jacarta-700 dark:text-white">
                                No Offers
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {details && (
                      <div>
                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-700 md:p-10">
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">
                              Collection Address:
                            </span>
                            <a
                              href={
                                `${blockURL}` +
                                `accounts/` +
                                `${onchainNFTData
                                  ? nft?.collection?._address
                                  : nft?.NFTCollection?.contractAddress
                                }`
                              }
                              target="_blank"
                              className="text-accent"
                            >
                              {(onchainNFTData
                                ? nft?.collection?._address?.slice(0, 8)
                                : nft?.NFTCollection?.contractAddress?.slice(
                                  0,
                                  8
                                )) +
                                "..." +
                                (onchainNFTData
                                  ? nft?.collection?._address?.slice(60)
                                  : nft?.NFTCollection?.contractAddress?.slice(
                                    60
                                  ))}
                            </a>
                          </div>
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">
                              Token Address:
                            </span>
                            <a
                              href={`${blockURL}` + `accounts/` + `${slug}`}
                              target="_blank"
                              className="text-accent"
                            >
                              {slug?.slice(0, 8) + "..." + slug?.slice(60)}
                            </a>
                          </div>
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">
                              Token Standard:
                            </span>
                            <span className="text-jacarta-700 dark:text-white">
                              TIP 4
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">
                              Blockchain:
                            </span>
                            <span className="text-jacarta-700 dark:text-white">
                              {blockChain}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {activity && (
                      <div className="tab-pane fade show active">
                        {/* filter  */}
                        <div className="border border-b-0 border-jacarta-100 bg-light-base px-4 pt-5 pb-2.5 dark:border-jacarta-600 dark:bg-jacarta-700">
                          <div className="flex flex-wrap">
                            <button
                              onClick={() => (
                                setSkip(0), setActivityType("list")
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
                                setSkip(0), setActivityType("cancel")
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
                                setSkip(0), setActivityType("sale")
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
                                Sale
                              </span>
                            </button>
                          </div>
                        </div>

                        <div
                          className={`scrollbar-custom max-h-72 w-full overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white  ${skip != 0 && "scroll-list"
                            }`}
                          onScroll={handleScroll}
                        >
                          <div
                            className="sticky top-0 flex bg-light-base dark:bg-jacarta-600"
                            role="row"
                          >
                            <div
                              className="w-[17%] py-2 px-4"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Event
                              </span>
                            </div>
                            <div
                              className="w-[17%] py-2 px-4"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Price
                              </span>
                            </div>
                            <div
                              className="w-[22%] py-2 px-4"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                From
                              </span>
                            </div>
                            <div
                              className="w-[22%] py-2 px-4"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                To
                              </span>
                            </div>
                            <div
                              className="w-[22%] py-2 px-4"
                              role="columnheader"
                            >
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Explorer
                              </span>
                            </div>
                          </div>

                          {/* loop activites here  */}
                          {activityHistory?.map((e, index) => (
                            <NFTActivityCard
                              key={index}
                              type={e?.type}
                              price={e?.price}
                              from={e?.from}
                              to={e?.to}
                              hash={e?.hash}
                              createdAt={e?.createdAt}
                              blockURL={blockURL}
                              MARKETPLACE_ADDRESS={MARKETPLACE_ADDRESS}
                            />
                          ))}
                          {moreLoading && (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          )}
                          <div className="flex p-4">
                            {(onchainNFTData || activityHistory == "") && (
                              <p className="text-jacarta-700 dark:text-white">
                                No Activity
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* listing modal  */}
          {listSale && (
            <ListModal
              nft={nft}
              formSubmit={sell_nft}
              setListSale={setListSale}
              setAnyModalOpen={setAnyModalOpen}
              currency={currency}
              loading={loading}
              listing_fees={listing_fees}
              listingPrice={listingPrice}
              set_listing_price={set_listing_price}
              creatorRoyalty={creatorRoyalty}
              setCreatorRoyalty={setCreatorRoyalty}
              platformFees={platformFees}
              setPlatformFees={setPlatformFees}
              finalListingPrice={finalListingPrice}
              setFinalListingPrice={setFinalListingPrice}
              confirmChecked={confirmChecked}
              setConfirmChecked={setConfirmChecked}
              onchainNFTData={onchainNFTData}
              collectionData={collectionData}
            />
          )}

          {/* buy modal  */}
          {buyModal && (
            <BuyModal
              formSubmit={buy_NFT_}
              setBuyModal={setBuyModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={nft?.nft_image}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              NFTName={nft?.name}
              NFTListingPrice={nft?.listingPrice}
              actionLoad={loading}
            />
          )}

          {/* cancel modal  */}
          {cancelModal && (
            <CancelModal
              formSubmit={cancelNFT}
              setCancelModal={setCancelModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={nft?.nft_image}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              NFTName={nft?.name}
              actionLoad={loading}
            />
          )}

          {/* success modal  */}
          {successModal && (
            <SuccessModal
              setSuccessModal={setSuccessModal}
              setAnyModalOpen={setAnyModalOpen}
              onCloseFunctionCall={nft_info}
              TransactionType={transactionType}
              NFTImage={nft?.nft_image}
              NFTAddress={nft?.NFTAddress}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              NFTListingPrice={nft?.listingPrice}
              NFTName={nft?.name}
              actionLoad={loading}
            />
          )}
        </section>
      )}
    </>
  );
};

export default NFTPage;
