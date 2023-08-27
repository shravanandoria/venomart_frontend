import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import defLogo from "../../../public/deflogo.png";
import Image from "next/image";
import Head from "next/head";
import Loader from "../../components/Loader";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { buy_nft, get_nft_by_address, listing_fees, platform_fees } from "../../utils/user_nft";
import { list_nft, cancel_listing } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import { nftInfo } from "../../utils/mongo_api/nfts/nfts";
import { MARKETPLACE_ADDRESS } from "../../utils/user_nft";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import { get_collection_if_nft_onchain } from "../../utils/mongo_api/collection/collection";
import NFTActivityCard from "../../components/cards/NFTActivityCard";

const NFTPage = ({
  signer_address,
  blockChain,
  blockURL,
  currency,
  theme,
  standalone,
  venomProvider,
}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [pageLoading, setPageLoading] = useState(false);
  const [loading, set_loading] = useState(false);
  const [isHovering, SetIsHovering] = useState(false);

  const [anyModalOpen, setAnyModalOpen] = useState(false);
  const [listSale, setListSale] = useState(false);
  const [buyModal, setBuyModal] = useState(false);
  const [onchainNFTData, setOnchainNFTData] = useState(false);
  const [collectionData, setCollectionData] = useState(false);

  const [properties, setProperties] = useState(true);
  const [offers, setOffers] = useState(false);
  const [details, setDetails] = useState(false);
  const [activity, setActivity] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const [listingPrice, set_listing_price] = useState(0);
  const [finalListingPrice, setFinalListingPrice] = useState(0);
  const [creatorRoyalty, setCreatorRoyalty] = useState(0);
  const [platformFees, setPlatformFees] = useState(0);

  const [nft, set_nft_info] = useState({});
  const [activeOffers, setActiveOffers] = useState([]);
  const [activityHistory, setActivityHistory] = useState([]);

  // getting nft information
  const nft_info = async () => {
    if (!standalone && !slug && !signer_address) return;
    setPageLoading(true);
    const nft_database = await nftInfo(slug);
    console.log({ nft_database })
    setActivityHistory(nft_database?.activity)
    if (nft_database) {
      let obj = {
        ...nft_database,
        attributes: JSON.parse(nft_database?.attributes),
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

  // list nft for sale
  const sell_nft = async (e) => {
    e.preventDefault();
    set_loading(true);

    let newFloorPrice = 0;
    if (finalListingPrice < (nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice)) {
      newFloorPrice = finalListingPrice;
    }
    try {
      await list_nft(
        slug,
        nft?.NFTCollection?.contractAddress,
        listingPrice,
        venomProvider,
        signer_address,
        nft,
        onchainNFTData,
        finalListingPrice,
        newFloorPrice
      );
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // buy nft
  const buy_NFT_ = async (e) => {
    e.preventDefault();
    set_loading(true);
    let royaltyFinalAmount = (((parseFloat(nft?.demandPrice) * parseFloat(nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : 0)) / 100) * 1000000000);
    try {
      await buy_nft(
        venomProvider,
        slug,
        nft?.ownerAddress,
        nft?.NFTCollection?.contractAddress,
        nft.listingPrice,
        (nft.listingPrice * 1000000000).toString(),
        signer_address,
        royaltyFinalAmount,
        nft?.NFTCollection?.royaltyAddress ? nft?.NFTCollection?.royaltyAddress : "0:0000000000000000000000000000000000000000000000000000000000000000"
      );
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // cancel nft sale
  const cancelNFT = async () => {
    set_loading(true);
    try {
      await cancel_listing(
        slug,
        nft?.NFTCollection?.contractAddress,
        venomProvider,
        signer_address
      );
    } catch (error) {
      console.log(error);
      set_loading(false);
    }
  };

  // getting collection info if onChainData 
  const getCollectionDataForOnchain = async () => {
    const collection_data = await get_collection_if_nft_onchain(nft?.collection?._address);
    console.log({ collection_data })
    setCollectionData(collection_data);
  }

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
    if (anyModalOpen) {
      document.body.style.overflow = "hidden";
      window.scrollTo(0, 0);
    }
    if (!anyModalOpen) {
      document.body.style.overflow = "scroll";
      document.body.style.overflowX = "hidden";
      window.scrollTo(0, 0);
    }
  }, [listSale, buyModal]);

  return (
    <>
      <Head>
        <title>NFT - Rarfinite Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>

      {/* modal background  */}
      {listSale && (
        <div className="backdrop-blur-lg absolute w-[100%] h-[100%] z-20"></div>
      )}

      {buyModal && (
        <div className="backdrop-blur-lg absolute w-[100%] h-[100%] z-20"></div>
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
                        {onchainNFTData ?
                          (collectionData?.data?.name ? collectionData?.data?.name : nft?.collection?._address?.slice(0, 5) + "..." + nft?.collection?._address?.slice(63))
                          :
                          nft?.NFTCollection?.name ? nft?.NFTCollection?.name : (nft?.NFTCollection?.contractAddress?.slice(0, 5) + "..." + nft?.NFTCollection?.contractAddress?.slice(63))
                        }
                      </Link>
                      {!onchainNFTData ?
                        (nft?.NFTCollection?.isVerified ?
                          <MdVerified
                            style={{ color: "#4f87ff", marginLeft: "-4px" }}
                            size={25}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                          :
                          <BsFillExclamationCircleFill
                            style={{ color: "#c3c944", marginLeft: "-4px" }}
                            size={20}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />)
                        :
                        collectionData &&
                        (collectionData?.data?.isVerified ?
                          <MdVerified
                            style={{ color: "#4f87ff", marginLeft: "-4px" }}
                            size={25}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />
                          :
                          <BsFillExclamationCircleFill
                            style={{ color: "#c3c944", marginLeft: "-4px" }}
                            size={20}
                            onMouseOver={() => SetIsHovering(true)}
                            onMouseOut={() => SetIsHovering(false)}
                          />)
                      }
                    </div>
                    <div className="absolute mb-6 ml-44 inline-flex items-center justify-center">
                      {nft?.NFTCollection?.isVerified && isHovering && (
                        <p
                          className="bg-blue px-[20px] py-[3px] text-white text-[12px]"
                          style={{ borderRadius: "10px" }}
                        >
                          Verified
                        </p>
                      )}
                      {!nft?.NFTCollection?.isVerified && isHovering && (
                        <p
                          className="bg-[#c3c944] px-[10px] py-[3px] text-black text-[12px]"
                          style={{ borderRadius: "10px" }}
                        >
                          Not Verified
                        </p>
                      )}
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
                            loading="lazy"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">
                          Owner
                        </span>
                        {MARKETPLACE_ADDRESS === nft?.ownerAddress ?
                          <Link
                            href={`/profile/${MARKETPLACE_ADDRESS}`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">
                              Market
                            </span>
                          </Link>
                          :
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
                        }
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
                            loading="lazy"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col justify-center">
                        <span className="block text-sm text-jacarta-400 dark:text-white">
                          Manager
                        </span>
                        {MARKETPLACE_ADDRESS === nft?.managerAddress ?
                          <Link
                            href={`/profile/${MARKETPLACE_ADDRESS}`}
                            className="block text-accent"
                          >
                            <span className="text-sm font-bold">
                              Market
                            </span>
                          </Link>
                          :
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
                        }
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
                            (onchainNFTData && getCollectionDataForOnchain()), setListSale(true), setAnyModalOpen(true)
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
                            onClick={cancelNFT}
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
                      onClick={switchActivity}
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
                      <div
                        className="tab-pane fade show active"
                        id="offers"
                        role="tabpanel"
                        aria-labelledby="offers-tab"
                      >
                        {/* filter  */}
                        {/* <div className="border border-b-0 border-jacarta-100 bg-light-base px-4 pt-5 pb-2.5 dark:border-jacarta-600 dark:bg-jacarta-700">
                          <div className="flex flex-wrap">
                            <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="mr-2 h-4 w-4 fill-jacarta-700 group-hover:fill-white dark:fill-white"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z"></path>
                              </svg>
                              <span className="text-2xs font-medium">
                                Listing
                              </span>
                            </button>
                            <button className="mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="mr-2 h-4 w-4 fill-white"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M14 20v2H2v-2h12zM14.586.686l7.778 7.778L20.95 9.88l-1.06-.354L17.413 12l5.657 5.657-1.414 1.414L16 13.414l-2.404 2.404.283 1.132-1.415 1.414-7.778-7.778 1.415-1.414 1.13.282 6.294-6.293-.353-1.06L14.586.686zm.707 3.536l-7.071 7.07 3.535 3.536 7.071-7.07-3.535-3.536z"></path>
                              </svg>
                              <span className="text-2xs font-medium text-white">
                                Bids
                              </span>
                            </button>
                            <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="mr-2 h-4 w-4 fill-jacarta-700 group-hover:fill-white dark:fill-white"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M16.05 12.05L21 17l-4.95 4.95-1.414-1.414 2.536-2.537L4 18v-2h13.172l-2.536-2.536 1.414-1.414zm-8.1-10l1.414 1.414L6.828 6 20 6v2H6.828l2.536 2.536L7.95 11.95 3 7l4.95-4.95z"></path>
                              </svg>
                              <span className="text-2xs font-medium">
                                Transfers
                              </span>
                            </button>
                            <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="mr-2 h-4 w-4 fill-jacarta-700 group-hover:fill-white dark:fill-white"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z"></path>
                              </svg>
                              <span className="text-2xs font-medium">
                                Sales
                              </span>
                            </button>
                          </div>
                        </div> */}

                        <div className="scrollbar-custom max-h-72 w-full overflow-y-auto rounded-lg rounded-tl-none border border-jacarta-100 bg-white text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white">
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
                          <div className="flex p-4">
                            {onchainNFTData && (
                              <p className="text-jacarta-700 dark:text-white">
                                No Activity
                              </p>
                            )}
                            {activityHistory == "" && (
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
            <div className="afterMintDiv">
              <form onSubmit={sell_nft} className="modal-dialog max-w-2xl">
                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                  <div className="modal-header">
                    <h5 className="modal-title" id="placeBidLabel">
                      List For Sale
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => (
                        setListSale(false), setAnyModalOpen(false)
                      )}
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

                  {/* listing price  */}
                  <div className="modal-body p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-sm font-semibold text-jacarta-700 dark:text-white">
                        Listing price
                      </span>
                    </div>

                    <div className="relative mb-2 flex items-center overflow-hidden rounded-lg border border-jacarta-100 dark:border-jacarta-600">
                      <div className="flex flex-1 items-center self-stretch border-r border-jacarta-100 bg-jacarta-50 px-2">
                        <span className="font-display text-sm text-jacarta-700">
                          {currency}
                        </span>
                      </div>
                      {loading ? (
                        <input
                          disabled
                          required
                          type="text"
                          className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          placeholder="Enter price"
                        />
                      ) : (
                        <input
                          required
                          type="text"
                          onChange={(e) => (
                            set_listing_price(e.target.value),
                            setCreatorRoyalty((parseFloat(nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : (collectionData?.data?.royalty ? collectionData?.data?.royalty : 0)) * e.target.value) / 100),
                            setPlatformFees((platform_fees * e.target.value) / 100),
                            setFinalListingPrice(
                              (
                                parseFloat(e.target.value) +
                                parseFloat((parseFloat(nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : (collectionData?.data?.royalty ? collectionData?.data?.royalty : 0)) * e.target.value) / 100) +
                                parseFloat((platform_fees * e.target.value) / 100)
                              ).toFixed(2)
                            )
                          )}
                          className="h-12 w-full flex-[3] border-0 focus:ring-inset focus:ring-accent"
                          placeholder="Enter price"
                        />
                      )}
                    </div>
                  </div>

                  {/* fees and display section  */}
                  <div className="modal-body p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                        You are listing Item
                      </span>
                      <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                        Subtotal
                      </span>
                    </div>
                    <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center border-t border-b py-4">
                      <div className="mr-5 self-start">
                        <Image
                          src={
                            onchainNFTData
                              ? nft?.preview?.source
                              : nft?.nft_image?.replace(
                                "ipfs://",
                                "https://ipfs.io/ipfs/"
                              )
                          }
                          alt="nftPreview"
                          width="80"
                          height="80"
                          className="rounded-2lg"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/collection/${onchainNFTData
                            ? nft?.collection?._address
                            : nft?.NFTCollection?.contractAddress
                            }`}
                          className="text-accent text-sm"
                        >

                          {!onchainNFTData ?
                            (<div className="flex align-middle mb-2">
                              {nft?.NFTCollection?.name ? nft?.NFTCollection?.name : (nft?.NFTCollection?.contractAddress?.slice(0, 8) +
                                "..." +
                                nft?.NFTCollection?.contractAddress?.slice(60))}
                              {nft?.NFTCollection?.isVerified ?
                                <MdVerified
                                  style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "3px" }}
                                  size={16}
                                  onMouseOver={() => SetIsHovering(true)}
                                  onMouseOut={() => SetIsHovering(false)}
                                />
                                :
                                <BsFillExclamationCircleFill
                                  style={{ color: "#c3c944", marginLeft: "4px", marginTop: "4px" }}
                                  size={15}
                                  onMouseOver={() => SetIsHovering(true)}
                                  onMouseOut={() => SetIsHovering(false)}
                                />
                              }
                            </div>)
                            :
                            (collectionData ?
                              (<div className="flex align-middle mb-2">
                                {collectionData?.data?.name ? collectionData?.data?.name : (collectionData?.data?.contractAddress?.slice(0, 8) +
                                  "..." +
                                  collectionData?.data?.contractAddress?.slice(60))}

                                {collectionData?.data?.isVerified ?
                                  <MdVerified
                                    style={{ color: "#4f87ff", marginLeft: "4px", marginTop: "3px" }}
                                    size={16}
                                    onMouseOver={() => SetIsHovering(true)}
                                    onMouseOut={() => SetIsHovering(false)}
                                  />
                                  :
                                  <BsFillExclamationCircleFill
                                    style={{ color: "#c3c944", marginLeft: "4px", marginTop: "4px" }}
                                    size={15}
                                    onMouseOver={() => SetIsHovering(true)}
                                    onMouseOut={() => SetIsHovering(false)}
                                  />
                                }
                              </div>)
                              :
                              (nft?.collection?._address?.slice(0, 8) +
                                "..." +
                                nft?.collection?._address?.slice(60)))
                          }
                        </Link>
                        <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                          {nft?.name}
                        </h3>

                        {/* fees title  */}
                        <div className="feesSectionTarget">
                          <div className="flex flex-wrap items-center mt-2">
                            <span className="dark:text-jacarta-300 text-jacarta-500 mr-1 block text-sm">
                              Creator Royalty: {nft?.NFTCollection?.royalty ? nft?.NFTCollection?.royalty : (collectionData?.data?.royalty ? collectionData?.data?.royalty : 0)}%
                            </span>
                            <span data-tippy-content="The creator of this collection will receive 5% of the sale total from future sales of this item.">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="dark:fill-jacarta-300 fill-jacarta-700 h-4 w-4"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                              </svg>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center mt-1">
                            <span className="dark:text-jacarta-300 text-jacarta-500 mr-1 block text-sm">
                              Platform Fees: {platform_fees}%
                            </span>
                            <span data-tippy-content="The creator of this collection will receive 5% of the sale total from future sales of this item.">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="dark:fill-jacarta-300 fill-jacarta-700 h-4 w-4"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                              </svg>
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center mt-1">
                            <span className="dark:text-jacarta-300 text-jacarta-500 mr-1 text-sm flex">
                              Listing Fees:
                              <span className="flex align-middle justify-center">
                                <Image
                                  src={venomLogo}
                                  height={100}
                                  width={100}
                                  alt="venomLogo"
                                  className="h-3 w-3 mr-1 ml-1 mt-1"
                                />
                                {listing_fees / 1000000000}
                              </span>
                            </span>
                            <span data-tippy-content="The creator of this collection will receive 5% of the sale total from future sales of this item.">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                width="24"
                                height="24"
                                className="dark:fill-jacarta-300 fill-jacarta-700 h-4 w-4"
                              >
                                <path fill="none" d="M0 0h24v24H0z"></path>
                                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM11 7h2v2h-2V7zm0 4h2v6h-2v-6z"></path>
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                      {/* fees amounts  */}
                      <div className="feesSectionTarget ml-auto">
                        <span className="mb-8 flex items-center whitespace-nowrap">
                          <span>
                            <Image
                              src={venomLogo}
                              height={100}
                              width={100}
                              className="h-4 w-4 mr-2"
                            />
                          </span>
                          <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                            {listingPrice}
                          </span>
                        </span>
                        <span className="mb-1 flex items-center whitespace-nowrap">
                          <span>
                            <Image
                              src={venomLogo}
                              height={100}
                              width={100}
                              className="h-4 w-4 mr-2"
                            />
                          </span>
                          <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                            {creatorRoyalty}
                          </span>
                        </span>
                        <span className="mb-1 flex items-center whitespace-nowrap">
                          <span>
                            <Image
                              src={venomLogo}
                              height={100}
                              width={100}
                              className="h-4 w-4 mr-2"
                            />
                          </span>
                          <span className="dark:text-jacarta-100 text-sm font-medium tracking-tight">
                            {platformFees}
                          </span>
                        </span>
                        <span className="mb-1 flex items-center whitespace-nowrap"></span>
                      </div>
                    </div>
                    <div className="dark:border-jacarta-600 border-jacarta-100 mb-2 flex items-center justify-between border-b py-2.5">
                      <span className="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white">
                        Total listing price
                      </span>
                      <div className="ml-auto">
                        <span className="flex items-center whitespace-nowrap">
                          <span>
                            <Image
                              src={venomLogo}
                              height={100}
                              width={100}
                              className="h-4 w-4 mr-2"
                            />
                          </span>
                          <span className="text-green font-medium tracking-tight">
                            {finalListingPrice}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="buyNowTerms"
                        className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
                        onClick={() => setConfirmChecked(!confirmChecked)}
                        required
                      />
                      <label
                        htmlFor="buyNowTerms"
                        className="dark:text-jacarta-200 text-sm"
                      >
                        By checking this box, I agree to{" "}
                        <Link
                          className="text-accent"
                          target="_blank"
                          href="/legal/Terms&Conditions"
                        >
                          Terms of Service
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    {finalListingPrice < (nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice) && confirmChecked &&
                      <h3 className=" mb-6 text-[14px] text-red text-center">
                        Please confirm you are listing your item below collection floor price, the current floor price is {nft?.NFTCollection?.FloorPrice ? nft?.NFTCollection?.FloorPrice : collectionData?.data?.FloorPrice} VENOM
                      </h3>
                    }
                    <div className="flex items-center justify-center space-x-4">
                      {loading ? (
                        <button
                          disabled
                          type="button"
                          className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Listing{" "}
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
                          className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          List Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* buy modal  */}
          {buyModal && (
            <div className="afterMintDiv">
              <form onSubmit={buy_NFT_} className="modal-dialog max-w-2xl">
                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                  <div className="modal-header">
                    <h5 className="modal-title" id="placeBidLabel">
                      Confirm Purchase
                    </h5>
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={() => (
                        setBuyModal(false), setAnyModalOpen(false)
                      )}
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

                  {/* fees and display section  */}
                  <div className="modal-body p-6">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                        You are purchasing Item
                      </span>
                    </div>
                    <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center py-4">
                      <div className="mr-5 self-start">
                        <Image
                          src={nft?.nft_image?.replace(
                            "ipfs://",
                            "https://ipfs.io/ipfs/"
                          )}
                          alt="nftPreview"
                          width="70"
                          height="70"
                          className="rounded-2lg"
                        />
                      </div>
                      <div>
                        <Link
                          href={`/collection/${nft?.NFTCollection?.contractAddress}`}
                          className="text-accent text-sm"
                        >
                          {nft?.NFTCollection?.contractAddress?.slice(0, 8) +
                            "..." +
                            nft?.NFTCollection?.contractAddress?.slice(60)}
                        </Link>
                        <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                          {nft?.name}
                        </h3>
                      </div>
                      {/* fees amounts  */}
                      <div className="feesSectionTarget ml-auto">
                        <span className="mb-1 flex items-center whitespace-nowrap">
                          <span>
                            <Image
                              src={venomLogo}
                              height={100}
                              width={100}
                              alt="venomLogo"
                              className="h-5 w-5 mr-2"
                            />
                          </span>
                          <span className="dark:text-jacarta-100 text-lg font-medium tracking-tight">
                            {nft?.listingPrice ? nft?.listingPrice : "0.00"}
                          </span>
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="buyNowTerms"
                        className="checked:bg-accent dark:bg-jacarta-600 text-accent border-jacarta-200 focus:ring-accent/20 dark:border-jacarta-500 h-5 w-5 self-start rounded focus:ring-offset-0"
                        required
                      />
                      <label
                        htmlFor="buyNowTerms"
                        className="dark:text-jacarta-200 text-sm"
                      >
                        By checking this box, I agree to{" "}
                        <Link
                          className="text-accent"
                          target="_blank"
                          href="/legal/Terms&Conditions"
                        >
                          Terms of Service
                        </Link>
                      </label>
                    </div>
                  </div>

                  <div className="modal-footer">
                    <div className="flex items-center justify-center space-x-4">
                      {loading ? (
                        <button
                          disabled
                          type="button"
                          className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Buying{" "}
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
                          className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                        >
                          Buy
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
    </>
  );
};

export default NFTPage;
