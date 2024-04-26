import React, { useState, useEffect, useContext } from "react";
import { useRouter } from "next/router";
import defLogo from "../../../public/deflogo.png";
import Image from "next/image";
import Head from "next/head";
import Loader from "../../components/Loader";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import {
  MARKETPLACE_ADDRESS,
  MakeOpenOffer,
  accept_offer,
  buy_nft,
  directSell_nft_info,
  get_nft_by_address,
  launchpad_minting,
  test_launchpad_minting,
} from "../../utils/user_nft";
import { list_nft, cancel_listing } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import {
  nftInfo,
  update_verified_nft_data,
  update_verified_nft_image,
  update_verified_nft_listing,
  update_verified_nft_props,
} from "../../utils/mongo_api/nfts/nfts";
import { BsArrowRight, BsFillCartPlusFill, BsFillCheckCircleFill, BsFillExclamationCircleFill } from "react-icons/bs";
import { get_collection_if_nft_onchain } from "../../utils/mongo_api/collection/collection";
import NFTActivityCard from "../../components/cards/NFTActivityCard";
import { addActivity, getActivity } from "../../utils/mongo_api/activity/activity";
import BuyModal from "../../components/modals/BuyModal";
import CancelModal from "../../components/modals/CancelModal";
import SuccessModal from "../../components/modals/SuccessModal";
import ListModal from "../../components/modals/ListModal";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import NftCard from "../../components/cards/NftCard";
import { IoHandLeftOutline, IoHandLeftSharp } from "react-icons/io5";
import { FaWallet } from "react-icons/fa";
import { GoHistory } from "react-icons/go";
import { addOffer, existingOffer, getActiveOffer, getOffers, updateOffer } from "../../utils/mongo_api/offer/offer";
import numeral from "numeral";
import moment from "moment";
// import { TonClientContext } from "../../context/tonclient";
import { cancel_offer } from "../../utils/user_nft";
import blurHash from '../../components/blurHash.json';

const NFTPage = ({
  signer_address,
  blockChain,
  blockURL,
  currency,
  theme,
  venomProvider,
  webURL,
  setAnyModalOpen,
  connectWallet,
  cartNFTs,
  setCartNFTs,
  vnmBalance,
  EnableMakeOffer,
  EnableNFTList,
  EnableNFTCancel,
  EnableNFTSale,
  NFTDataProps,
  OtherImagesBaseURI,
  NFTImagesBaseURI,
  NFTImageToReplaceURIs,
  adminAccount
}) => {
  const router = useRouter();
  const { slug } = router.query;
  // const { client } = useContext(TonClientContext);

  const [lastSold, setLastSold] = useState("");
  const [higestOffer, setHigestOffer] = useState("");
  const [offerPrice, setOfferPrice] = useState(0);
  const [noExistingOffer, setNoExistingOffer] = useState(false);
  const [offerExpiration, setOfferExpiration] = useState("1day");
  const [selectedNFT, setSelectedNFT] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const [loading, set_loading] = useState(false);

  const [offerModal, setOfferModal] = useState(false);
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
  const [fetchedNFTOffers, setfetchedNFTOffers] = useState(false);
  const [actionDrop, setActionDrop] = useState(false);
  const [metaDataUpdated, setMetaDataUpdated] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);

  const [listingPrice, set_listing_price] = useState(0);
  const [creatorRoyalty, setCreatorRoyalty] = useState(0);
  const [platformFees, setPlatformFees] = useState(0);
  const [skip, setSkip] = useState(0);

  const [nft, set_nft_info] = useState({});
  const [activeOffers, setActiveOffers] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);
  const [activityType, setActivityType] = useState("");
  const [transactionType, setTransactionType] = useState("");

  // formart num
  function formatNumberShort(number) {
    if (number >= 1e6) {
      const formatted = numeral(number / 1e6).format("0.00a");
      if (formatted.endsWith("k")) {
        return formatted.slice(0, -1) + "M";
      } else {
        return formatted + "M";
      }
    } else if (number >= 1e3) {
      return numeral(number / 1e3).format("0.00a") + "K";
    } else if (number % 1 !== 0) {
      return numeral(number).format("0.00");
    } else {
      return numeral(number).format("0");
    }
  }

  // carting nfts
  const addToCart = () => {
    if (!cartNFTs.some(item => item._id === nft._id)) {
      setCartNFTs([...cartNFTs, nft]);
    }
  };

  const removeFromCart = itemToRemove => {
    const updatedCartNFTs = cartNFTs.filter(item => item._id !== itemToRemove._id);
    setCartNFTs(updatedCartNFTs);
  };

  // connecting wallet
  const connect_wallet = async () => {
    const connect = await connectWallet();
  };

  // getting nft information
  const nft_info = async () => {
    setPageLoading(true);
    if ((!venomProvider || venomProvider == undefined) && !slug) return;
    const nft_database = await nftInfo(slug);
    if (nft_database) {
      let obj = {
        ...nft_database,
        attributes: nft_database?.attributes != "" ? nft_database?.attributes : [],
      };
      setLastSold(nft_database?.lastSold);
      setHigestOffer(nft_database?.highestOffer);
      set_nft_info({ ...obj });
    }
    if (nft_database == undefined) {
      const nft_onchain = await get_nft_by_address(venomProvider, slug);
      if (nft_onchain?.attributes == "") {
        if ((nft_onchain?.files[0]?.source == "") || (nft_onchain?.files[0]?.source == undefined)) return;
        const sourceURL = nft_onchain?.files[0]?.source;
        if (sourceURL && sourceURL.startsWith("https://") && sourceURL.endsWith(".json")) {
          try {
            let response;
            let newSourceURL = sourceURL.replace("https://ipfs.io/ipfs", "https://ipfs.venomart.io/ipfs");
            try {
              response = await fetch(newSourceURL);
            } catch (error) {
              response = await fetch(sourceURL);
            }
            if (response.ok) {
              const parsedData = await response.json();
              const extractedProps = parsedData.attributes;
              let obj = {
                ...nft_onchain,
                attributes: extractedProps,
              };
              set_nft_info(obj);
            } else {
              console.error("Failed to fetch JSON data:", response.statusText);
            }
          } catch (error) {
            console.error("Error fetching or parsing JSON data:", error);
          }
        } else {
          let obj = {
            ...nft_onchain,
            attributes: [],
          };
          set_nft_info(obj);
        }
      } else {
        set_nft_info(nft_onchain);
      }
      setOnchainNFTData(true);
    }
    setPageLoading(false);
  };

  // refresh nft metadata
  const refreshMetadata = async () => {
    if (metaDataUpdated == true && !signer_address && !venomProvider) return;
    setMetadataLoading(true);
    const nft_onchain = await get_nft_by_address(venomProvider, slug);
    const onChainNFTData = await directSell_nft_info(venomProvider, nft?.managerAddress);

    let OnChainOwner = nft_onchain?.owner?._address;
    let OnChainManager = nft_onchain?.manager?._address;
    let onChainImage = nft_onchain?.preview?.source;
    let onChainDemandPrice = onChainNFTData?.value5 / 1000000000;

    let offChainOwner = nft?.ownerAddress;
    let offChainManager = nft?.managerAddress;
    let offChainListed = nft?.isListed;
    let offChainImage = nft?.nft_image;
    let offChainDemandPrice = nft?.demandPrice;
    let offChainAttributes = nft?.attributes;

    const updateNFTImage = await update_verified_nft_image(onChainImage, slug);

    if (
      (OnChainOwner != offChainOwner) || (OnChainManager != offChainManager) || (offChainAttributes = []) ||
      (OnChainOwner != OnChainManager && !offChainListed) || (offChainDemandPrice < onChainDemandPrice)
    ) {
      if (OnChainOwner != offChainOwner || OnChainManager != offChainManager) {
        // updating the owners data 
        const updateNFTData = await update_verified_nft_data(OnChainOwner, OnChainManager, slug);
        alert("Owners data updated successfully");
      }

      if (offChainAttributes = []) {
        const sourceURL = nft_onchain?.files[0]?.source;
        if (sourceURL && sourceURL.startsWith("https://") && sourceURL.endsWith(".json")) {
          try {
            let response;
            let newSourceURL = sourceURL.replace("https://ipfs.io/ipfs", "https://ipfs.venomart.io/ipfs");
            try {
              response = await fetch(newSourceURL);
            } catch (error) {
              response = await fetch(sourceURL);
            }
            if (response.ok) {
              const parsedData = await response.json();
              const extractedProps = parsedData.attributes;
              const updateNFTProps = await update_verified_nft_props(extractedProps, slug);
              alert("Properties updated successfully");
            } else {
              console.error("Failed to fetch JSON data:", response.statusText);
            }
          } catch (error) {
            console.error("Error fetching or parsing JSON data:", error);
          }
        }
      }

      if ((onChainNFTData && (offChainDemandPrice < onChainDemandPrice)) && (onChainNFTData != undefined)) {
        // updating the listing status here
        const updatingData = await update_verified_nft_listing(onChainDemandPrice, offChainDemandPrice, slug);
        alert("Listing price updated successfully");
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

  const handleScroll = e => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setSkip(activityHistory.length);
    }
  };

  // list nft for sale
  const sell_nft = async e => {
    e.preventDefault();
    if (!EnableNFTList) {
      alert("Listing is disabled for a while!!")
      return;
    }
    if (!signer_address) {
      connect_wallet();
      return;
    }
    set_loading(true);

    try {
      const listing = await list_nft(
        selectedNFT ? selectedNFT?.ownerAddress : nft?.ownerAddress,
        selectedNFT ? selectedNFT?.managerAddress : nft?.managerAddress,
        selectedNFT ? selectedNFT?.NFTAddress : slug,
        nft?.NFTCollection?.contractAddress ? nft?.NFTCollection?.contractAddress : nft?.collection?._address,
        listingPrice,
        venomProvider,
        signer_address,
        selectedNFT ? selectedNFT : nft,
        onchainNFTData,
        nft?.NFTCollection?.royalty
          ? nft?.NFTCollection?.royalty
          : collectionData?.data?.royalty
            ? collectionData?.data?.royalty
            : "0",
        nft?.NFTCollection?.royaltyAddress
          ? nft?.NFTCollection?.royaltyAddress
          : "0:0000000000000000000000000000000000000000000000000000000000000000"
      );
      if (listing == true) {
        set_loading(false);
        setListSale(false);
        setTransactionType("List");
        if (onchainNFTData) {
          router.reload();
        } else {
          nft_info();
        }
        setfetchedNFTActivity(false);
        setfetchedNFTOffers(false);
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
  const buy_NFT_ = async e => {
    e.preventDefault();
    if (!EnableNFTSale) {
      alert("Buying is disabled for a while!!")
      return;
    }
    if (!signer_address) {
      connect_wallet();
      return;
    }
    if (parseFloat(vnmBalance) <= selectedNFT.listingPrice || parseFloat(vnmBalance) <= nft?.listingPrice) {
      alert("You do not have sufficient venom tokens to buy this NFT!!");
      return;
    }
    set_loading(true);
    let royaltyFinalAmount =
      ((parseFloat(selectedNFT ? selectedNFT?.demandPrice : nft?.demandPrice) *
        parseFloat(nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : 0)) /
        100) *
      1000000000;
    try {
      const buying = await buy_nft(
        venomProvider,
        selectedNFT ? selectedNFT?.ownerAddress : nft?.ownerAddress,
        selectedNFT ? selectedNFT?.managerAddress : nft?.managerAddress,
        selectedNFT ? selectedNFT?.NFTAddress : slug,
        nft?.NFTCollection?.contractAddress,
        selectedNFT ? selectedNFT?.listingPrice : nft?.listingPrice,
        ((selectedNFT ? selectedNFT?.listingPrice : nft?.listingPrice) * 1000000000).toString(),
        signer_address,
        royaltyFinalAmount,
        nft?.NFTCollection?.royaltyAddress
          ? nft?.NFTCollection?.royaltyAddress
          : "0:0000000000000000000000000000000000000000000000000000000000000000",
        nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice,
      );

      if (buying == true) {
        set_loading(false);
        setBuyModal(false);
        setTransactionType("Sale");
        setfetchedNFTActivity(false);
        setfetchedNFTOffers(false);
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
  const cancelNFT = async e => {
    e.preventDefault();
    if (!EnableNFTCancel) {
      alert("Cancel is disabled for a while!!")
      return;
    }
    if (!signer_address) {
      connect_wallet();
      return;
    }
    set_loading(true);
    try {
      const cancelling = await cancel_listing(
        selectedNFT ? selectedNFT?.ownerAddress : nft?.ownerAddress,
        selectedNFT ? selectedNFT?.managerAddress : nft?.managerAddress,
        selectedNFT ? selectedNFT?.NFTAddress : slug,
        nft?.NFTCollection?.contractAddress,
        venomProvider,
        signer_address,
        nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice,
      );
      if (cancelling == true) {
        set_loading(false);
        setCancelModal(false);
        setTransactionType("Cancel");
        setfetchedNFTActivity(false);
        setfetchedNFTOffers(false);
        setSuccessModal(true);
      }
      if (cancelling == false) {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // get offers
  const getNFTOffers = async () => {
    if (!nft) return;
    setMoreLoading(true);
    const getOffer = await getOffers(nft?._id, 0);
    setActiveOffers(getOffer);
    setfetchedNFTOffers(true);
    setMoreLoading(false);
  };

  // check for exisiting offer
  const checkExistingOffer = async () => {
    if (!nft && !signer_address) return;
    const getOffer = await existingOffer(nft?._id, signer_address);
    if (getOffer != "") {
      setNoExistingOffer(true);
    } else {
      setNoExistingOffer(false);
    }
  };

  // add offer
  const makeOffer = async e => {
    e.preventDefault();
    if (!slug) return;
    try {
      if (noExistingOffer) {
        alert("You already have an active offer on this NFT!!");
        return;
      }

      set_loading(true);
      // getting previous offer contract address if exists
      const getActiveOffers = await getActiveOffer(nft?._id);

      const makeOffer = await MakeOpenOffer(
        venomProvider,
        signer_address,
        onchainNFTData,
        nft,
        slug,
        getActiveOffers?.offerContract
          ? getActiveOffers?.offerContract
          : "0:0000000000000000000000000000000000000000000000000000000000000000",
        offerPrice,
        offerExpiration,
        nft?.ownerAddress,
        nft?.NFTCollection?.contractAddress,
      );

      if (makeOffer) {
        await getNFTOffers();
        set_loading(false);
        setOfferModal(false);
      } else {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // remove offer
  const removeOffer = async (offerAddress, venomProvider, signer_address, nft_address, selectedOfferId) => {
    try {
      set_loading(true);
      const removeOffer = await cancel_offer(
        offerAddress,
        venomProvider,
        nft_address,
        signer_address,
        nft?.ownerAddress,
        nft?.NFTCollection?.contractAddress,
        selectedOfferId,
      );

      if (removeOffer) {
        await getNFTOffers();
        set_loading(false);
        setOfferModal(false);
      } else {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // accept offer
  const acceptOffer = async (offerAddress, offerPrice, from, venomProvider, nft_address, signer_address) => {
    try {
      set_loading(true);

      const acceptOffer = await accept_offer(
        offerAddress,
        offerPrice,
        from,
        venomProvider,
        nft_address,
        signer_address,
        nft?.ownerAddress,
        nft?.managerAddress,
        nft?.NFTCollection?.contractAddress,
        nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice,
      );

      if (acceptOffer) {
        await getNFTOffers();
        set_loading(false);
        setOfferModal(false);
      } else {
        set_loading(false);
      }
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // getting collection info if onChainData
  const getCollectionDataForOnchain = async () => {
    const collection_data = await get_collection_if_nft_onchain(nft?.collection?._address);
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
  }, [slug, venomProvider]);

  useEffect(() => {
    scroll_fetch_nft_activity();
  }, [skip]);

  useEffect(() => {
    fetch_nft_activity();
  }, [activityType]);

  return (
    <>
      <Head>
        <title>{`${NFTDataProps?.name ? NFTDataProps?.name : "NFT"} - Venomart Marketplace`}</title>
        <meta
          name="description"
          content={`${NFTDataProps?.name ? NFTDataProps?.name : "Explore, Create and Experience exculsive NFTs on Venomart"
            } | An NFT on Venom Blockchain`}
        />

        <meta property="og:title" content={`${NFTDataProps?.name ? NFTDataProps?.name : "NFT"} - Venomart Marketplace`} />
        <meta property="og:description" content={`${NFTDataProps?.NFTCollection?.description ? NFTDataProps?.NFTCollection?.description : "Explore, Create and Experience exclusive NFTs on Venomart"} | Powered by Venomart`} />
        <meta property="og:image" content={`${NFTDataProps?.nft_image ? NFTDataProps?.nft_image?.replace(NFTImageToReplaceURIs, NFTImagesBaseURI) : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"}`} />
        <meta property="og:url" content={"https://venomart.io/"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${NFTDataProps?.name ? NFTDataProps?.name : "NFT"} - Venomart Marketplace`} />
        <meta name="twitter:description" content={`${NFTDataProps?.NFTCollection?.description ? NFTDataProps?.NFTCollection?.description : "Explore, Create and Experience exclusive NFTs on Venomart"} | Powered by Venomart`} />
        <meta name="twitter:image" content={`${NFTDataProps?.nft_image ? NFTDataProps?.nft_image?.replace(NFTImageToReplaceURIs, NFTImagesBaseURI) : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"}`} />
        <meta name="twitter:site" content="@venomart23" />
        <meta name="twitter:creator" content="@venomart23" />

        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>

      {/* modal background  */}
      {listSale && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {buyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {successModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {offerModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {cancelModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {pageLoading ? (
        <Loader theme={theme} />
      ) : (
        <section className={`${theme}`}>
          <div className={`relative pt-32 pb-24 dark:bg-jacarta-900`}>
            <div className="container">
              <div className="md:flex md:flex-wrap">
                <div className="relative mb-8 md:w-2/5 md:flex-shrink-0 md:flex-grow-0 md:basis-auto lg:w-1/2">
                  {(onchainNFTData ? nft?.preview?.source?.includes(".mp4") : nft?.nft_image?.includes(".mp4")) ? (
                    <video
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "100%",
                      }}
                      autoPlay="autoplay"
                      loop={true}
                    >
                      <source
                        src={
                          onchainNFTData
                            ? nft?.preview?.source
                            : nft?.nft_image?.replace(NFTImageToReplaceURIs, NFTImagesBaseURI)
                        }
                        onError={(e) => {
                          e.target.src = nft?.nft_image?.replace(NFTImageToReplaceURIs, "https://ipfs.io/ipfs/");
                        }}
                        type="video/mp4"
                      ></source>
                    </video>
                  ) : (
                    <Image
                      src={
                        onchainNFTData
                          ? nft?.preview?.source
                          : nft?.nft_image?.replace(NFTImageToReplaceURIs, NFTImagesBaseURI)
                      }
                      onError={(e) => {
                        e.target.src = nft?.nft_image?.replace(NFTImageToReplaceURIs, "https://ipfs.io/ipfs/");
                      }}
                      placeholder="blur"
                      blurDataURL={blurHash?.blurURL}
                      width={100}
                      height={100}
                      alt="item"
                      className="cursor-pointer rounded-2.5xl h-[auto] w-[100%]"
                    />
                  )}
                </div>

                {/* <!-- Details --> */}
                <div className="md:w-3/5 md:basis-auto md:pl-8 lg:w-1/2 lg:pl-[3.75rem]">
                  <div className="mb-3 flex">
                    {/* <!-- Collection --> */}
                    <div className="flex items-center mb-4">
                      <Link
                        href={`/collection/${onchainNFTData ? nft?.collection?._address : nft?.NFTCollection?.contractAddress
                          }`}
                        className="flex"
                      >
                        {!onchainNFTData && (
                          <div className="relative mr-2">
                            <Image
                              src={
                                nft?.NFTCollection?.logo
                                  ? nft?.NFTCollection?.logo?.replace("ipfs://", OtherImagesBaseURI)
                                  : defLogo
                              }
                              height={100}
                              width={100}
                              alt="avatar 1"
                              className="rounded-full h-[40px] w-[40px] object-cover mr-2"
                            />
                            {!onchainNFTData ? (
                              nft?.NFTCollection?.isVerified ? (
                                <MdVerified className="absolute top-[27px] right-[2px] text-[#4f87ff]" size={17} />
                              ) : (
                                <BsFillExclamationCircleFill
                                  className="absolute top-[27px] right-[2px] text-[#c3c944]"
                                  size={16}
                                />
                              )
                            ) : (
                              collectionData &&
                              (collectionData?.data?.isVerified ? (
                                <MdVerified className="absolute top-[27px] right-[2px] text-[#4f87ff]" size={17} />
                              ) : (
                                <BsFillExclamationCircleFill
                                  className="absolute top-[27px] right-[2px] text-[#c3c944]"
                                  size={16}
                                />
                              ))
                            )}
                          </div>
                        )}
                        <div className="mr-2">
                          <p className="text-sm font-bold text-jacarta-600 dark:text-jacarta-100">
                            {onchainNFTData
                              ? collectionData?.data?.name
                                ? collectionData?.data?.name
                                : nft?.collection?._address?.slice(0, 5) + "..." + nft?.collection?._address?.slice(63)
                              : nft?.NFTCollection?.name
                                ? nft?.NFTCollection?.name
                                : nft?.NFTCollection?.contractAddress?.slice(0, 5) +
                                "..." +
                                nft?.NFTCollection?.contractAddress?.slice(63)}
                          </p>
                          {!onchainNFTData && (
                            <span className="flex text-[12px] text-jacarta-600 dark:text-jacarta-100">
                              {formatNumberShort(nft?.NFTCollection?.TotalSupply)} Items
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>

                    <div className="ml-auto ">
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
                              href={nft?.nft_metadata ? nft?.nft_metadata : nft?.files ? nft?.files[0]?.source : ""}
                              target="_blank"
                              className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600"
                            >
                              View Metadata
                            </a>
                            <a
                              href={`https://twitter.com/intent/tweet?text=Check%20out%20this%20NFT%20on%20venomart.io%0AThis%20NFT%20is%20part%20of%20${nft?.NFTCollection?.name ? nft?.NFTCollection?.name : "NFT"
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
                  <h1 className="mb-1 font-display text-4xl font-semibold text-jacarta-700 dark:text-white">
                    {nft?.name}
                  </h1>

                  {nft?.rank &&
                    <div className="flex mb-6">
                      <p className={`bottom-[-4px] right-0 ${nft?.rank < 100 && "bg-[#d1d102]" || ((nft?.rank >= 100 && nft?.rank < 250) && "bg-[#8402db]") || ((nft?.rank >= 250 && nft?.rank < 500) && "bg-[#55c902]") || ((nft?.rank >= 500) && "bg-[#9e9e9e]")} px-[12px] py-[4px] text-white text-[12px]`} style={{ borderRadius: "10px" }}>Rank {nft?.rank}</p>
                    </div>
                  }

                  {/* nnft desc  */}
                  <p className="mb-10 dark:text-jacarta-300">{nft?.description}</p>

                  <div className="mb-8 flex flex-wrap justify-normal">
                    {/* <!-- Owner --> */}
                    <div className="mb-4 flex mr-8">
                      <div className="mr-4 shrink-0">
                        <a className="relative block">
                          {nft?.userProfileImage?.includes(".mp4") ? (
                            <video
                              style={{
                                objectFit: "cover",
                              }}
                              className="rounded-2lg h-[45px] w-[45px] object-cover"
                              autoPlay="autoplay"
                              loop="true"
                            >
                              <source
                                src={nft?.userProfileImage?.replace("ipfs://", OtherImagesBaseURI)}
                                type="video/mp4"
                              ></source>
                            </video>
                          ) : (
                            <Image
                              src={
                                nft?.userProfileImage
                                  ? nft?.userProfileImage.replace("ipfs://", OtherImagesBaseURI)
                                  : defLogo
                              }
                              height={100}
                              width={100}
                              alt="avatar 1"
                              className="rounded-2lg h-[45px] w-[45px] object-cover"
                            />
                          )}
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">Owner</span>
                        <Link
                          href={`/profile/${onchainNFTData ? nft?.owner?._address : nft?.ownerAddress}`}
                          className="block text-accent"
                        >
                          <span className="text-sm font-bold">
                            {nft?.username
                              ? nft?.username
                              : (nft?.owner?._address ? nft?.owner?._address : nft?.ownerAddress) == signer_address
                                ? "You"
                                : (onchainNFTData ? nft?.owner?._address?.slice(0, 5) : nft?.ownerAddress?.slice(0, 5)) +
                                "..." +
                                (onchainNFTData ? nft?.owner?._address?.slice(63) : nft?.ownerAddress?.slice(63))}
                          </span>
                        </Link>
                      </div>
                    </div>

                    {/* manager  */}
                    <div className="mb-4 flex">
                      <div className="mr-4 shrink-0">
                        <a className="relative block">
                          {nft?.userProfileImage?.includes(".mp4") ? (
                            <video
                              style={{
                                objectFit: "cover",
                              }}
                              className="rounded-2lg h-[45px] w-[45px] object-cover"
                              autoPlay="autoplay"
                              loop="true"
                            >
                              <source
                                src={nft?.userProfileImage?.replace("ipfs://", OtherImagesBaseURI)}
                                type="video/mp4"
                              ></source>
                            </video>
                          ) : (
                            <Image
                              src={
                                nft?.managerAddress
                                  ? nft?.managerAddress == nft?.ownerAddress
                                    ? nft?.userProfileImage
                                      ? nft?.userProfileImage?.replace("ipfs://", OtherImagesBaseURI)
                                      : defLogo
                                    : defLogo
                                  : defLogo
                              }
                              height={100}
                              width={100}
                              alt="avatar 1"
                              className="rounded-2lg h-[45px] w-[45px]"
                            />
                          )}
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">Manager</span>
                        {nft?.isListed ? (
                          <Link href={`/profile/${nft?.managerAddress}`} className="block text-accent">
                            <span className="text-sm font-bold">Market</span>
                          </Link>
                        ) : (
                          <Link
                            href={`/profile/${onchainNFTData ? nft?.manager?._address : nft?.managerAddress}`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">
                              {nft?.username && nft?.managerAddress == nft?.ownerAddress
                                ? nft?.username
                                : (nft?.manager?._address ? nft?.manager?._address : nft?.managerAddress) ==
                                  signer_address
                                  ? "You"
                                  : (onchainNFTData
                                    ? nft?.manager?._address?.slice(0, 5)
                                    : nft?.managerAddress?.slice(0, 5)) +
                                  "..." +
                                  (onchainNFTData ? nft?.manager?._address?.slice(63) : nft?.managerAddress?.slice(63))}
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* -------------------------- all action buttons start ------------------------  */}

                  {/* <!-- list nft --> */}
                  {(((onchainNFTData ? nft?.manager?._address : nft?.managerAddress) == signer_address) && nft?.isListed != true) && (
                    <div className="rounded-2lg  border-jacarta-100 dark:border-jacarta-600">
                      <div className="mb-8 flex flex-row justify-between">
                        <div></div>
                        <div className="flex flex-col justify-end" style={{ alignItems: "end" }}>
                          {lastSold && (
                            <div className="flex flex-row">
                              <GoHistory className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1 mb-2" />
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Last sold</span>
                              <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                              </span>
                              <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                {lastSold ? formatNumberShort(lastSold) : "0.00"}
                              </span>
                            </div>
                          )}
                          {higestOffer && (
                            <div className="flex flex-row">
                              <IoHandLeftSharp className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1" />
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Best Offer</span>
                              <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                              </span>
                              <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                {higestOffer ? formatNumberShort(higestOffer) : "0.00"}
                              </span>
                            </div>
                          )}
                          {(nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice) && (
                            <div className="flex flex-row mt-2">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Floor price</span>
                              <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                              </span>
                              <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                {nft?.FloorPrice
                                  ? formatNumberShort(nft?.FloorPrice)
                                  : formatNumberShort(collectionData?.data?.FloorPrice)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      {((nft?.NFTCollection?.isTrading == true) || (collectionData?.data?.isTrading == true)) ?
                        <button
                          onClick={() => (
                            onchainNFTData && getCollectionDataForOnchain(),
                            setSelectedNFT(""),
                            setListSale(true),
                            setAnyModalOpen(true)
                          )}
                          href="#"
                          className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          List For Sale
                        </button>
                        :
                        (onchainNFTData ?
                          <button
                            onClick={() => (
                              onchainNFTData && getCollectionDataForOnchain(),
                              setSelectedNFT(""),
                              setListSale(true),
                              setAnyModalOpen(true)
                            )}
                            href="#"
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            List For Sale
                          </button>
                          :
                          <button
                            onClick={() => (
                              alert("Trading is currently disabled on this collection!")
                            )}
                            href="#"
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            List For Sale 🔒
                          </button>)
                      }
                    </div>
                  )}

                  {/* buy now section  */}
                  {nft?.isListed == true &&
                    (onchainNFTData ? nft?.owner?._address : nft?.ownerAddress) !== signer_address && (
                      <div className="rounded-2lg border-jacarta-100 dark:border-jacarta-600">
                        <div className="mb-8 flex flex-row justify-between">
                          <div>
                            <div className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Price</span>
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
                                    {nft?.listingPrice != "0" ? formatNumberShort(nft?.listingPrice) : (nft?.demandPrice ? nft?.demandPrice : "0.00")}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-end" style={{ alignItems: "end" }}>
                            {lastSold && (
                              <div className="flex flex-row">
                                <GoHistory className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1 mb-2" />
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Last sold</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {lastSold ? formatNumberShort(lastSold) : "0.00"}
                                </span>
                              </div>
                            )}
                            {higestOffer && (
                              <div className="flex flex-row">
                                <IoHandLeftSharp className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1" />
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Best Offer</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {higestOffer ? formatNumberShort(higestOffer) : "0.00"}
                                </span>
                              </div>
                            )}
                            {(nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice) && (
                              <div className="flex flex-row mt-2">
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Floor price</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {nft?.FloorPrice
                                    ? formatNumberShort(nft?.FloorPrice)
                                    : formatNumberShort(collectionData?.data?.FloorPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {loading ? (
                          <button
                            type="button"
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
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
                          <div>
                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => (setSelectedNFT(""), setBuyModal(true), setAnyModalOpen(true))}
                                className={`flex justify-center align-middle ${nft?.managerAddress == MARKETPLACE_ADDRESS ? "w-[100%]" : "w-[88%]"
                                  } rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark`}
                              >
                                <FaWallet className="text-[18px] mt-1 mr-2" />
                                Buy Now
                              </button>

                              {nft?.managerAddress != MARKETPLACE_ADDRESS &&
                                (cartNFTs.some(item => item._id === nft._id) ? (
                                  <button
                                    type="button"
                                    onClick={e => (e.preventDefault(), removeFromCart(nft))}
                                    className="flex justify-center align-middle w-[12%] items-center rounded-xl bg-white ml-4 text-center font-semibold text-accent shadow-white-volume transition-all  hover:text-white"
                                  >
                                    <BsFillCheckCircleFill className="text-center text-[28px] text-accent" />
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={e => (e.preventDefault(), addToCart())}
                                    className="flex justify-center align-middle w-[12%] items-center rounded-xl bg-accent font-semibold text-white shadow-accent-volume hover:bg-accent-dark ml-4"
                                  >
                                    <BsFillCartPlusFill className="text-center text-[25px]" />
                                  </button>
                                ))}
                            </div>
                            {EnableMakeOffer &&
                              <div className="flex mt-4">
                                <button
                                  type="button"
                                  onClick={() => (
                                    setSelectedNFT(""), checkExistingOffer(), setOfferModal(true), setAnyModalOpen(true)
                                  )}
                                  className="flex justify-center align-middle w-full mb-4 rounded-xl bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                >
                                  <IoHandLeftSharp className="text-[18px] mt-1 mr-1" />
                                  Make An Offer
                                </button>
                              </div>
                            }
                          </div>
                        )}
                      </div>
                    )}

                  {/* auction section  */}
                  {/* {nft?.isAuction == true &&
                    (onchainNFTData
                      ? nft?.owner?._address
                      : nft?.ownerAddress) !== signer_address && (
                      <div className="rounded-2lg border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-700">
                        <div className="mb-8 sm:flex sm:flex-wrap">
                          <div className="sm:w-1/2 sm:pr-4 lg:pr-8">
                            <div className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Highest bid by </span>
                              <a href="user.html"
                                className="text-sm font-bold text-accent">0x695d2ef170ce69e794707eeef9497af2de25df82</a>
                            </div>
                            <div className="mt-3 flex">
                              <div>
                                <div className="flex items-center whitespace-nowrap">
                                  <span className="dark:text-jacarta-200 mr-2">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-5 w-5"
                                    />
                                  </span>
                                  <span className="text-lg font-medium leading-tight tracking-tight text-green">4.7</span>
                                </div>
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">~10,864.10</span>
                              </div>
                            </div>
                          </div>
                          <div
                            className="mt-4 dark:border-jacarta-600 sm:mt-0 sm:w-1/2 sm:border-l sm:border-jacarta-100 sm:pl-4 lg:pl-8">
                            <span className="js-countdown-ends-label text-sm text-jacarta-400 dark:text-jacarta-300">Auction ends
                              in</span>
                            <div className="js-countdown-single-timer mt-3 flex space-x-4" data-countdown="2023-09-07T19:40:30"
                              data-expired="This auction has ended">
                              <span className="countdown-days text-jacarta-700 dark:text-white">
                                <span className="js-countdown-days-number text-lg font-medium lg:text-[1.5rem]"></span>
                                <span className="block text-xs font-medium tracking-tight">Days</span>
                              </span>
                              <span className="countdown-hours text-jacarta-700 dark:text-white">
                                <span className="js-countdown-hours-number text-lg font-medium lg:text-[1.5rem]"></span>
                                <span className="block text-xs font-medium tracking-tight">Hrs</span>
                              </span>
                              <span className="countdown-minutes text-jacarta-700 dark:text-white">
                                <span className="js-countdown-minutes-number text-lg font-medium lg:text-[1.5rem]"></span>
                                <span className="block text-xs font-medium tracking-tight">Min</span>
                              </span>
                              <span className="countdown-seconds text-jacarta-700 dark:text-white">
                                <span className="js-countdown-seconds-number text-lg font-medium lg:text-[1.5rem]"></span>
                                <span className="block text-xs font-medium tracking-tight">Sec</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <button onClick={() => (setAnyModalOpen(true), setOfferModal(true))}
                          className="inline-block w-full rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark">Place
                          Bid</button>
                      </div>
                    )} */}

                  {/* <!-- cancel nft sale --> */}
                  {(onchainNFTData ? nft?.owner?._address : nft?.ownerAddress) == signer_address &&
                    nft?.isListed == true && (
                      <div className="rounded-2lg  border-jacarta-100 dark:border-jacarta-600">
                        <div className="mb-8 flex flex-row justify-between">
                          <div>
                            <div className="block overflow-hidden text-ellipsis whitespace-nowrap">
                              <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Listed on sale for</span>
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
                                    {nft?.listingPrice ? formatNumberShort(nft?.listingPrice) : "0.00"}
                                  </span>
                                  {/* <span className="text-[19px] text-jacarta-700 dark:text-jacarta-200 ml-2">
                                    {currency}
                                  </span> */}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col justify-end" style={{ alignItems: "end" }}>
                            {lastSold && (
                              <div className="flex flex-row">
                                <GoHistory className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1 mb-2" />
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Last sold</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {lastSold ? formatNumberShort(lastSold) : "0.00"}
                                </span>
                              </div>
                            )}
                            {higestOffer && (
                              <div className="flex flex-row">
                                <IoHandLeftSharp className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1" />
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Best Offer</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {higestOffer ? formatNumberShort(higestOffer) : "0.00"}
                                </span>
                              </div>
                            )}
                            {(nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice) && (
                              <div className="flex flex-row mt-2">
                                <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Floor price</span>
                                <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                  <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-3 w-3" />
                                </span>
                                <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                  {nft?.FloorPrice
                                    ? formatNumberShort(nft?.FloorPrice)
                                    : formatNumberShort(collectionData?.data?.FloorPrice)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        {loading ? (
                          <button
                            type="button"
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
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
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                            onClick={() => (setSelectedNFT(""), setCancelModal(true), setAnyModalOpen(true))}
                          >
                            Cancel Sale
                          </button>
                        )}
                      </div>
                    )}

                  {/* <!-- not listed --> */}
                  {(onchainNFTData ? nft?.manager?._address : nft?.managerAddress) !== signer_address &&
                    nft?.isListed == false && (
                      <>
                        <div className="rounded-2lg border-jacarta-100 dark:border-jacarta-600">
                          <div className="mb-8 flex flex-row justify-between">
                            <div></div>
                            <div className="flex flex-col justify-end" style={{ alignItems: "end" }}>
                              {lastSold && (
                                <div className="flex flex-row">
                                  <GoHistory className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1 mb-2" />
                                  <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Last sold</span>
                                  <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-3 w-3"
                                    />
                                  </span>
                                  <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                    {lastSold ? formatNumberShort(lastSold) : "0.00"}
                                  </span>
                                </div>
                              )}
                              {higestOffer && (
                                <div className="flex flex-row">
                                  <IoHandLeftSharp className="text-[13px] text-jacarta-700 dark:text-white mt-1 mr-1" />
                                  <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Best Offer</span>
                                  <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-3 w-3"
                                    />
                                  </span>
                                  <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                    {higestOffer ? formatNumberShort(higestOffer) : "0.00"}
                                  </span>
                                </div>
                              )}
                              {(nft?.FloorPrice ? nft?.FloorPrice : collectionData?.data?.FloorPrice) && (
                                <div className="flex flex-row mt-2">
                                  <span className="text-sm text-jacarta-400 dark:text-jacarta-300">Floor price</span>
                                  <span className="dark:text-jacarta-200 mr-1 ml-2 mt-1">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      alt="venomLogo"
                                      className="h-3 w-3"
                                    />
                                  </span>
                                  <span className="text-[14px] font-medium leading-tight tracking-tight text-green">
                                    {nft?.FloorPrice
                                      ? formatNumberShort(nft?.FloorPrice)
                                      : formatNumberShort(collectionData?.data?.FloorPrice)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <button
                            type="button"
                            className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            Not Listed
                          </button>
                        </div>
                        {EnableMakeOffer &&
                          <div className="flex mt-4">
                            <button
                              type="button"
                              onClick={() => (
                                setSelectedNFT(""),
                                !onchainNFTData && checkExistingOffer(),
                                setOfferModal(true),
                                setAnyModalOpen(true)
                              )}
                              className="flex justify-center align-middle w-full mb-4 rounded-xl bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                            >
                              <IoHandLeftSharp className="text-[18px] mt-1 mr-1" />
                              Make An Offer
                            </button>
                          </div>
                        }
                      </>
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
                    <li className="nav-item" role="presentation" onClick={switchPropeties}>
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
                        <span className="font-display text-base font-medium">Properties</span>
                      </button>
                    </li>

                    {/* offers  */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={() => (!fetchedNFTOffers && !onchainNFTData && getNFTOffers(), switchOffers())}
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
                        <span className="font-display text-base font-medium">Offers</span>
                      </button>
                    </li>

                    {/* <!-- Details --> */}
                    <li className="nav-item" role="presentation" onClick={switchDetails}>
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
                        <span className="font-display text-base font-medium">Details</span>
                      </button>
                    </li>

                    {/* activity  */}
                    <li
                      className="nav-item"
                      role="presentation"
                      onClick={() => (!fetchedNFTActivity && fetch_nft_activity(), switchActivity())}
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
                        <span className="font-display text-base font-medium">Activity</span>
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
                                    {e.type ? e.type : e.trait_type}
                                  </span>
                                  <span
                                    className="text-base text-jacarta-700 dark:text-white"
                                    style={{
                                      width: "220px",
                                      whiteSpace: "nowrap",
                                      textOverflow: "ellipsis",
                                      overflow: "hidden",
                                    }}
                                  >
                                    {e.value}
                                  </span>
                                  {nft?.NFTCollection?.isPropsEnabled && (
                                    <span className="text-[14px] text-jacarta-500 dark:text-jacarta-200">
                                      {parseFloat(e?.probability)?.toFixed(0)}% have this trait
                                    </span>
                                  )}
                                </a>
                              );
                            })}
                            {nft?.attributes == "" && <p className="text-jacarta-700 dark:text-white">No Properties</p>}
                          </div>
                        </div>
                      </div>
                    )}

                    {offers && (
                      <div className="tab-pane fade show active">
                        <div className="scrollbar-custom grid max-h-72 w-full grid-cols-5 overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white">
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
                                Status
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
                          {activeOffers?.map((offer, index) => {
                            const currentTime = new Date();
                            const date = new Date(offer?.createdAt);
                            let expDate;
                            if (offer?.expiration == "1day") {
                              expDate = new Date(date.setHours(date.getHours() + 24));
                            }
                            if (offer?.expiration == "7days") {
                              expDate = new Date(date.setHours(date.getHours() + 168));
                            }
                            if (offer?.expiration == "15days") {
                              expDate = new Date(date.setHours(date.getHours() + 360));
                            }
                            if (offer?.expiration == "30days") {
                              expDate = new Date(date.setHours(date.getHours() + 720));
                            }

                            let expiredOffer = false;
                            if (currentTime >= expDate) {
                              expiredOffer = true;
                            }

                            const timeLeftToExp = moment(new Date(expDate)).fromNow();
                            return (
                              <div className="contents" key={index}>
                                <div
                                  className="flex items-center whitespace-nowrap border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                                  role="cell"
                                >
                                  <span className="flex text-sm font-medium tracking-tight text-green">
                                    <Image
                                      src={venomLogo}
                                      height={100}
                                      width={100}
                                      style={{
                                        height: "13px",
                                        width: "14px",
                                        marginRight: "5px",
                                        marginTop: "5px",
                                      }}
                                      alt="VenomLogo"
                                    />
                                    {offer?.offerPrice}
                                  </span>
                                </div>
                                <div
                                  className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600 text-jacarta-700 dark:text-jacarta-200 font-semibold"
                                  role="cell"
                                >
                                  {expiredOffer ? "expired" : offer?.status}
                                </div>
                                <div
                                  className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600 text-jacarta-700 dark:text-jacarta-200"
                                  role="cell"
                                >
                                  {timeLeftToExp}
                                </div>
                                <div
                                  className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                                  role="cell"
                                >
                                  <Link href={`/profile/${offer?.from}`} className="text-accent">
                                    {offer?.fromUser
                                      ? offer?.fromUser
                                      : offer?.from?.slice(0, 5) + "..." + offer?.from?.slice(64)}
                                  </Link>
                                </div>
                                <div
                                  className="flex items-center border-t border-jacarta-100 py-4 px-4 dark:border-jacarta-600"
                                  role="cell"
                                >
                                  {signer_address == offer?.from &&
                                    offer?.status == "active" &&
                                    (expiredOffer ? (
                                      <button
                                        className="text-jacarta-700 dark:text-jacarta-200"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to cancel your offer?")) {
                                            removeOffer(
                                              offer?.offerContract,
                                              venomProvider,
                                              signer_address,
                                              slug,
                                              offer?._id,
                                            );
                                          }
                                        }}
                                      >
                                        Claim
                                      </button>
                                    ) : (
                                      <button
                                        className="text-jacarta-700 dark:text-jacarta-200"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to cancel your offer?")) {
                                            removeOffer(
                                              offer?.offerContract,
                                              venomProvider,
                                              signer_address,
                                              slug,
                                              offer?._id,
                                            );
                                          }
                                        }}
                                      >
                                        Cancel
                                      </button>
                                    ))}
                                  {signer_address == offer?.from && offer?.status == "cancelled" && (
                                    <button className="text-red cursor-default">Cancelled</button>
                                  )}
                                  {signer_address == nft?.ownerAddress &&
                                    offer?.status == "active" &&
                                    (expiredOffer ? (
                                      <button className="text-red cursor-default">Expired</button>
                                    ) : (
                                      <button
                                        className="text-jacarta-700 dark:text-jacarta-200"
                                        onClick={() => {
                                          if (window.confirm("Are you sure you want to accept this offer?")) {
                                            acceptOffer(
                                              offer?.offerContract,
                                              offer?.offerPrice,
                                              offer?.from,
                                              venomProvider,
                                              slug,
                                              signer_address,
                                            );
                                          }
                                        }}
                                      >
                                        Accept
                                      </button>
                                    ))}
                                  {signer_address == nft?.ownerAddress && offer?.status == "accepted" && (
                                    <button className="text-green cursor-default">Accepted</button>
                                  )}
                                  {signer_address != nft?.ownerAddress && signer_address != offer?.from && "-----"}
                                </div>
                              </div>
                            );
                          })}

                          {moreLoading && (
                            <div className="flex items-center justify-center space-x-2 py-12">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          )}

                          {(activeOffers == "" || activeOffers == undefined) && !moreLoading && (
                            <div className="flex p-4">
                              <p className="text-jacarta-700 dark:text-white">No Offers</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {details && (
                      <div>
                        <div className="rounded-t-2lg rounded-b-2lg rounded-tl-none border border-jacarta-100 bg-white p-6 dark:border-jacarta-600 dark:bg-jacarta-700 md:p-10">
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">Collection Address:</span>
                            <a
                              href={
                                `${blockURL}` +
                                `accounts/` +
                                `${onchainNFTData ? nft?.collection?._address : nft?.NFTCollection?.contractAddress}`
                              }
                              target="_blank"
                              className="text-accent"
                            >
                              {(onchainNFTData
                                ? nft?.collection?._address?.slice(0, 8)
                                : nft?.NFTCollection?.contractAddress?.slice(0, 8)) +
                                "..." +
                                (onchainNFTData
                                  ? nft?.collection?._address?.slice(60)
                                  : nft?.NFTCollection?.contractAddress?.slice(60))}
                            </a>
                          </div>
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">Token Address:</span>
                            <a href={`${blockURL}` + `accounts/` + `${slug}`} target="_blank" className="text-accent">
                              {slug?.slice(0, 8) + "..." + slug?.slice(60)}
                            </a>
                          </div>
                          <div className="mb-2 flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">Token Standard:</span>
                            <span className="text-jacarta-700 dark:text-white">TIP 4</span>
                          </div>
                          <div className="flex items-center">
                            <span className="mr-2 min-w-[9rem] dark:text-jacarta-300">Blockchain:</span>
                            <span className="text-jacarta-700 dark:text-white">{blockChain}</span>
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
                              onClick={() => (setSkip(0), setActivityType(""))}
                              className={`${activityType == ""
                                ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                                : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                                }`}
                            >
                              <span className={`text-2xs font-medium  ${activityType == "" && "text-white"}`}>All</span>
                            </button>

                            <button
                              onClick={() => (setSkip(0), setActivityType("list"))}
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
                              <span className={`text-2xs font-medium  ${activityType == "list" && "text-white"}`}>
                                Listing
                              </span>
                            </button>

                            <button
                              onClick={() => (setSkip(0), setActivityType("cancel"))}
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
                              <span className={`text-2xs font-medium ${activityType == "cancel" && "text-white"}`}>
                                Remove Listing
                              </span>
                            </button>

                            <button
                              onClick={() => (setSkip(0), setActivityType("sale"))}
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
                              <span className={`text-2xs font-medium ${activityType == "sale" && "text-white"}`}>
                                Sale
                              </span>
                            </button>

                            <button
                              onClick={() => (setSkip(0), setActivityType("offer"))}
                              className={`${activityType == "offer"
                                ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                                : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                                }`}
                            >
                              <IoHandLeftOutline
                                className={`mr-2 h-4 w-4 ${activityType == "offer"
                                  ? "text-white"
                                  : "group-hover:text-white text-jacarta-700 dark:text-white"
                                  }`}
                              />
                              <span className={`text-2xs font-medium ${activityType == "offer" && "text-white"}`}>
                                Offer
                              </span>
                            </button>

                            <button
                              onClick={() => (setSkip(0), setActivityType("canceloffer"))}
                              className={`${activityType == "canceloffer"
                                ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                                : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                                }`}
                            >
                              <IoHandLeftOutline
                                className={`mr-2 h-4 w-4 ${activityType == "offer"
                                  ? "text-white"
                                  : "group-hover:text-white text-jacarta-700 dark:text-white"
                                  }`}
                              />
                              <span className={`text-2xs font-medium ${activityType == "canceloffer" && "text-white"}`}>
                                Cancel Offer
                              </span>
                            </button>
                          </div>
                        </div>

                        <div
                          className={`scrollbar-custom max-h-72 w-full overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white  ${skip != 0 && "scroll-list"
                            }`}
                          onScroll={handleScroll}
                        >
                          <div className="sticky top-0 flex bg-light-base dark:bg-jacarta-600" role="row">
                            <div className="w-[17%] py-2 px-4" role="columnheader">
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Event
                              </span>
                            </div>
                            <div className="w-[17%] py-2 px-4" role="columnheader">
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                Price
                              </span>
                            </div>
                            <div className="w-[22%] py-2 px-4" role="columnheader">
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                From
                              </span>
                            </div>
                            <div className="w-[22%] py-2 px-4" role="columnheader">
                              <span className="w-full overflow-hidden text-ellipsis text-jacarta-700 dark:text-jacarta-100">
                                To
                              </span>
                            </div>
                            <div className="w-[22%] py-2 px-4" role="columnheader">
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
                              FromUser={e?.fromUser}
                              ToUser={e?.toUser}
                              createdAt={e?.createdAt}
                              blockURL={blockURL}
                              signerAddress={signer_address}
                            />
                          ))}
                          {moreLoading && (
                            <div className="flex items-center justify-center space-x-2 py-6">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          )}
                          <div className="flex p-4">
                            {(onchainNFTData || activityHistory == "") && (
                              <p className="text-jacarta-700 dark:text-white">No Activity</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {nft?.moreNFTs?.length > 0 && (
              <div className="container">
                <div className="mt-16 mb-2 lg:pl-6 text-start font-display text-xl text-jacarta-700 dark:text-white">
                  <h2 className="flex">
                    More from this collection <BsArrowRight className="ml-4" />
                  </h2>
                </div>
                <div className="flex justify-center align-middle flex-wrap">
                  <Swiper
                    modules={[Pagination]}
                    spaceBetween={60}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    breakpoints={{
                      300: {
                        slidesPerView: 1,
                      },
                      800: {
                        slidesPerView: 2,
                      },
                      1204: {
                        slidesPerView: 3,
                      },
                    }}
                    className="mySwiper"
                  >
                    {nft?.moreNFTs?.map((e, index) => {
                      return (
                        <SwiperSlide
                          key={index}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <NftCard
                            ImageSrc={e?.nft_image?.replace(NFTImageToReplaceURIs, NFTImagesBaseURI)}
                            Name={e?.name}
                            Address={e.NFTAddress}
                            Owner={e?.ownerAddress}
                            rank={e?.rank}
                            signerAddress={signer_address}
                            tokenId={e?._id}
                            listedBool={e?.isListed}
                            listingPrice={e?.listingPrice}
                            NFTCollectionAddress={nft?.NFTCollection?.contractAddress}
                            NFTCollectionName={nft?.NFTCollection?.name}
                            NFTCollectionStatus={nft?.NFTCollection?.isVerified}
                            setAnyModalOpen={setAnyModalOpen}
                            setBuyModal={setBuyModal}
                            setCancelModal={setCancelModal}
                            NFTData={e}
                            setSelectedNFT={setSelectedNFT}
                            cartNFTs={cartNFTs}
                            setCartNFTs={setCartNFTs}
                            NFTImagesBaseURI={NFTImagesBaseURI}
                            NFTImageToReplaceURIs={NFTImageToReplaceURIs}
                          />
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                </div>
                <div className="mt-10 text-center">
                  <Link
                    href={`/collection/${nft?.NFTCollection?.contractAddress
                      ? nft?.NFTCollection?.contractAddress
                      : nft?.collection?._address
                      }`}
                    className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                  >
                    View collection
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* <!-- Place Bid Modal --> */}
          {offerModal && (
            <div className="afterMintDiv">
              <form
                onSubmit={e => (e.preventDefault(), alert("This feature will be available soon.."))}
                className="modal-dialog max-w-2xl"
              >
                {/* <form onSubmit={makeOffer} className="modal-dialog max-w-2xl"> */}
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title" id="placeBidLabel">
                      Place an offer
                    </h5>
                    <button
                      type="button"
                      onClick={() => (setAnyModalOpen(false), setOfferModal(false))}
                      className="btn-close"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="24"
                        height="24"
                        className="h-6 w-6 fill-jacarta-700 dark:fill-white"
                      >
                        <path fill="none" d="M0 0h24v24H0z" />
                        <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                      </svg>
                    </button>
                  </div>
                  <div className="modal-body p-6">
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                          Price
                        </span>
                      </div>

                      <div className="relative mb-2 flex items-center overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                        <div className="flex flex-1 items-center self-stretch border-r border-jacarta-100 bg-jacarta-50 px-2">
                          <span className="dark:text-jacarta-200 mr-1 mb-[2px]">
                            <Image src={venomLogo} height={100} width={100} alt="venomLogo" className="h-4 w-4" />
                          </span>
                          <span className="font-display text-sm text-jacarta-700">{currency}</span>
                        </div>

                        <input
                          onChange={e => setOfferPrice(e.target.value)}
                          type="text"
                          className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          placeholder="Amount"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                          Expiration
                        </span>
                      </div>

                      <div className="relative mb-2 flex items-center overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                        <select
                          onChange={e => setOfferExpiration(e.target.value)}
                          name=""
                          className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                        >
                          <option
                            value="1day"
                            className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          >
                            1 Day
                          </option>
                          <option
                            value="7days"
                            className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          >
                            7 Days
                          </option>
                          <option
                            value="15days"
                            className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          >
                            15 Days
                          </option>
                          <option
                            value="30days"
                            className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          >
                            30 Days
                          </option>
                        </select>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm dark:text-jacarta-400">
                        Balance: {formatNumberShort(vnmBalance)} {currency}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="buyNowTerms"
                        className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
                        required
                      />
                      <label htmlFor="buyNowTerms" className="dark:text-jacarta-200 text-sm">
                        By checking this box, I agree to{" "}
                        <Link className="text-accent" target="_blank" href="/legal/Terms&Conditions">
                          Terms of Service
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <div className="flex items-center justify-center space-x-4">
                      {loading ? (
                        <button
                          type="button"
                          className="inline-block w-full rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Placing{" "}
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
                          type="submit"
                          className="rounded-xl bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Place your offer
                        </button>
                      )}
                      ;
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* listing modal  */}
          {listSale && (
            <ListModal
              nft={nft}
              formSubmit={sell_nft}
              setListSale={setListSale}
              setAnyModalOpen={setAnyModalOpen}
              currency={currency}
              loading={loading}
              listingPrice={listingPrice}
              set_listing_price={set_listing_price}
              creatorRoyalty={creatorRoyalty}
              setCreatorRoyalty={setCreatorRoyalty}
              platformFees={platformFees}
              setPlatformFees={setPlatformFees}
              confirmChecked={confirmChecked}
              setConfirmChecked={setConfirmChecked}
              onchainNFTData={onchainNFTData}
              collectionData={collectionData}
              NFTImagesBaseURI={NFTImagesBaseURI}
              NFTImageToReplaceURIs={NFTImageToReplaceURIs}
            />
          )}

          {/* buy modal  */}
          {buyModal && (
            <BuyModal
              formSubmit={buy_NFT_}
              setBuyModal={setBuyModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={selectedNFT ? selectedNFT?.nft_image : nft?.nft_image}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              collectionTrading={nft?.NFTCollection?.isTrading}
              NFTName={selectedNFT ? selectedNFT?.name : nft?.name}
              NFTRank={selectedNFT ? selectedNFT?.rank : nft?.rank}
              NFTListingPrice={selectedNFT ? selectedNFT?.listingPrice : (nft?.listingPrice != "0" ? nft?.listingPrice : nft?.demandPrice)}
              actionLoad={loading}
              NFTImagesBaseURI={NFTImagesBaseURI}
              NFTImageToReplaceURIs={NFTImageToReplaceURIs}
            />
          )}

          {/* cancel modal  */}
          {cancelModal && (
            <CancelModal
              formSubmit={cancelNFT}
              setCancelModal={setCancelModal}
              setAnyModalOpen={setAnyModalOpen}
              NFTImage={selectedNFT ? selectedNFT?.nft_image : nft?.nft_image}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              collectionTrading={nft?.NFTCollection?.isTrading}
              NFTName={selectedNFT ? selectedNFT?.name : nft?.name}
              actionLoad={loading}
              NFTImagesBaseURI={NFTImagesBaseURI}
              NFTImageToReplaceURIs={NFTImageToReplaceURIs}
            />
          )}

          {/* success modal  */}
          {successModal && (
            <SuccessModal
              setSuccessModal={setSuccessModal}
              setAnyModalOpen={setAnyModalOpen}
              onCloseFunctionCall={nft_info}
              TransactionType={transactionType}
              NFTImage={selectedNFT ? selectedNFT?.nft_image : nft?.nft_image}
              NFTAddress={selectedNFT ? selectedNFT?.NFTAddress : nft?.NFTAddress}
              NFTCollectionContract={nft?.NFTCollection?.contractAddress}
              NFTCollectionName={nft?.NFTCollection?.name}
              CollectionVerification={nft?.NFTCollection?.isVerified}
              NFTListingPrice={selectedNFT ? selectedNFT?.listingPrice : nft?.listingPrice}
              NFTName={selectedNFT ? selectedNFT?.name : nft?.name}
              actionLoad={loading}
              NFTImagesBaseURI={NFTImagesBaseURI}
              NFTImageToReplaceURIs={NFTImageToReplaceURIs}
            />
          )}
        </section>
      )}
    </>
  );
};

export async function getServerSideProps(context) {
  const slug = context.query.slug;
  let NFTDataProps;
  if (context.req.headers.host.includes("localhost")) {
    const NFTData = await (await fetch(`http://localhost:3000/api/nft/nft?nft_address=${slug}`)).json();
    NFTDataProps = NFTData?.data;
  }
  else {
    const NFTData = await (await fetch(`https://venomart.io/api/nft/nft?nft_address=${slug}`)).json();
    NFTDataProps = NFTData?.data;
  }
  return {
    props: {
      NFTDataProps
    },
  };
}

export default NFTPage;
