import React, { useEffect, useState } from "react";
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
import Head from "next/head";
import Loader from "../../components/Loader";
import { loadNFTs_collection } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import defBack from "../../../public/defback.png";
import { get_collection_by_contract } from "../../utils/mongo_api/collection/collection";
import collectionAbi from "../../../abi/CollectionDrop.abi.json";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";

const Collection = ({
  blockURL,
  theme,
  standalone,
  webURL,
  copyURL,
  venomProvider,
  currency,
}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [loading, setLoading] = useState(false);
  const [isHovering, SetIsHovering] = useState(false);

  const [itemsTab, showItemsTab] = useState(true);
  const [analyticsTab, showAnalyticsTab] = useState(false);
  const [activityTab, showActivityTab] = useState(false);

  const [share, setShare] = useState(false);
  const [collection, set_collection] = useState({});
  const [nfts, set_nfts] = useState([]);
  const [activity, set_activity] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);
  const [lastNFT, setLastNFT] = useState(true);
  const [page, set_page] = useState(0);

  const gettingCollectionInfo = async () => {
    if (!standalone && !slug) return;
    setLoading(true);
    // getting nfts
    const nfts = await loadNFTs_collection(standalone, slug, undefined, 0);
    console.log(nfts);
    setLastNFT(nfts?.continuation);

    set_nfts(nfts?.nfts);

    // getting contract info
    const res = await get_collection_by_contract(slug);
    set_collection(res?.data);
    set_activity(res?.data?.activity);
    setLoading(false);
  };

  // getting total supply
  const gettingTotalSupply = async () => {
    if (venomProvider != undefined) {
      try {
        const contract = new venomProvider.Contract(collectionAbi, slug);
        const totalSupply = await contract.methods
          .totalSupply({ answerId: 0 })
          .call();
        setTotalSupply(totalSupply.count);
      } catch (error) {
        console.log("total supply error");
      }
    }
  };

  const fetch_nfts = async () => {
    let res = await loadNFTs_collection(standalone, slug, lastNFT, page);

    setLastNFT(res?.continuation);
    console.log(res?.continuation);
    if (res?.nfts?.length && res?.continuation) {
      let all_nfts = [...nfts, ...res.nfts];
      set_nfts(all_nfts);
      set_page(page + 1);
      return all_nfts;
    }

    console.log({ page });
  };

  useEffect(() => {
    if (!slug) return;
    gettingCollectionInfo();
  }, [standalone, slug]);
  useEffect(() => {
    gettingTotalSupply();
  }, [venomProvider]);

  useEffect(() => {}, [page]);

  return (
    <div className={`${theme}`}>
      <Head>
        <title>Collection - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
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
        <div className="dark:bg-jacarta-900">
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
                      {totalSupply ? totalSupply : 100 + "+"}
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
                          ? collection?.TotalVolume
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
                  <div
                    onClick={() => setShare(!share)}
                    className="dropdown rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800"
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
                      <div className="dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                        <a
                          href={`https://twitter.com/intent/tweet?text=I%20found%20this%20collection%20on%20venomart.io%20check%20it%20here-%20${webURL}collection/${slug}%20`}
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
              </div>
            </div>
          </section>

          {/* main section  */}
          <section className="relative pb-24 pt-12">
            <div>
              <ul className="nav nav-tabs mb-12 flex items-center justify-center border-b border-jacarta-100 dark:border-jacarta-600">
                <li className="nav-item" role="presentation">
                  <button
                    onClick={() => (showActivityTab(false), showItemsTab(true))}
                    className={`nav-link ${
                      itemsTab && "active relative"
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
                    onClick={() => (showItemsTab(false), showActivityTab(true))}
                    className={`nav-link ${
                      activityTab && "active relative"
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
                      Activity
                    </span>
                  </button>
                </li>
              </ul>

              {/* items  */}
              {itemsTab && (
                <div className="tab-content">
                  <div
                    className="tab-pane fade show active"
                    id="on-sale"
                    role="tabpanel"
                    aria-labelledby="on-sale-tab"
                  >
                    <div className="flex justify-center align-middle flex-wrap ">
                      <InfiniteScroll
                        dataLength={nfts ? nfts?.length : 0}
                        next={fetch_nfts}
                        hasMore={lastNFT}
                        className="flex flex-wrap justify-center align-middle"
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
                              Description={e?.description}
                              Address={e?.nftAddress?._address}
                              listedBool={e?.isListed}
                              listingPrice={e?.listingPrice}
                              NFTCollectionAddress={
                                e?.NFTCollection?.contractAddress
                              }
                              NFTCollectionName={e?.NFTCollection?.name}
                              NFTCollectionStatus={e?.NFTCollection?.isVerified}
                              currency={currency}
                            />
                          );
                        })}
                      </InfiniteScroll>
                    </div>
                    <div className="flex justify-center">
                      {nfts?.length <= 0 && (
                        <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                          This collection has no NFTs !!
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* activity  */}
              {activityTab && (
                <div className="container">
                  {activity?.length >= 1 && (
                    <div className="flexActivitySection">
                      <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
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
                            />
                          ))}
                        </div>
                      </div>
                      <div className="basis-4/12 lg:pl-5">
                        <h3 className="mb-4 font-display font-semibold text-jacarta-500 dark:text-white">
                          Filters
                        </h3>
                        <div className="flex flex-wrap">
                          <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 fill-jacarta-700 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                            </svg>
                            <span className="text-2xs font-medium">
                              Listing
                            </span>
                          </button>

                          <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M10.9 2.1l9.899 1.415 1.414 9.9-9.192 9.192a1 1 0 0 1-1.414 0l-9.9-9.9a1 1 0 0 1 0-1.414L10.9 2.1zm.707 2.122L3.828 12l8.486 8.485 7.778-7.778-1.06-7.425-7.425-1.06zm2.12 6.364a2 2 0 1 1 2.83-2.829 2 2 0 0 1-2.83 2.829z" />
                            </svg>
                            <span className="text-2xs font-medium">
                              Remove Listing
                            </span>
                          </button>

                          <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M6.5 2h11a1 1 0 0 1 .8.4L21 6v15a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6l2.7-3.6a1 1 0 0 1 .8-.4zM19 8H5v12h14V8zm-.5-2L17 4H7L5.5 6h13zM9 10v2a3 3 0 0 0 6 0v-2h2v2a5 5 0 0 1-10 0v-2h2z" />
                            </svg>
                            <span className="text-2xs font-medium">Sale</span>
                          </button>

                          <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M14 20v2H2v-2h12zM14.586.686l7.778 7.778L20.95 9.88l-1.06-.354L17.413 12l5.657 5.657-1.414 1.414L16 13.414l-2.404 2.404.283 1.132-1.415 1.414-7.778-7.778 1.415-1.414 1.13.282 6.294-6.293-.353-1.06L14.586.686zm.707 3.536l-7.071 7.07 3.535 3.536 7.071-7.07-3.535-3.536z" />
                            </svg>
                            <span className="text-2xs font-medium">Bids</span>
                          </button>

                          <button className="group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mr-2 h-4 w-4 group-hover:fill-white fill-jacarta-700 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M16.05 12.05L21 17l-4.95 4.95-1.414-1.414 2.536-2.537L4 18v-2h13.172l-2.536-2.536 1.414-1.414zm-8.1-10l1.414 1.414L6.828 6 20 6v2H6.828l2.536 2.536L7.95 11.95 3 7l4.95-4.95z" />
                            </svg>
                            <span className="text-2xs font-medium">
                              Transfer
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex justify-center">
                    {(activity?.length <= 0 || activity === undefined) && (
                      <h2 className="text-xl font-display font-thin text-gray-700 dark:text-gray-300">
                        No activities yet!
                      </h2>
                    )}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default Collection;
