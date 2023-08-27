import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import defBack from "../../../public/gradient_dark.jpg";
import defLogo from "../../../public/deflogo.png";
import Image from "next/image";
import NftCard from "../../components/cards/NftCard";
import CollectionCard from "../../components/cards/CollectionCard";
import Loader from "../../components/Loader";
import Head from "next/head";
import Link from "next/link";
import { loadNFTs_user } from "../../utils/user_nft";
import { BsArrowUpRight, BsDiscord, BsTwitter } from "react-icons/bs";
import { user_info } from "../../utils/mongo_api/user/user";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";

const Profile = ({
  theme,
  signer_address,
  blockURL,
  standalone,
  webURL,
  copyURL,
  currency,
  venomProvider
}) => {
  const [user_data, set_user_data] = useState({});
  const [loading, set_loading] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const [share, setShare] = useState(false);

  const [onSale, setOnSale] = useState(false);
  const [owned, setOwned] = useState(true);
  const [collections, setCollections] = useState(false);
  const [activity, setActivity] = useState(false);

  const [lastNFT, setLastNFT] = useState(undefined);

  const [activitySkip, setActivitySkip] = useState(0);

  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  const [nfts, set_nfts] = useState([]);
  const [NFTCollections, setNFTCollections] = useState([]);
  const [activityRecords, setActivityRecords] = useState([]);
  const [moreLoading, setMoreLoading] = useState(false);

  const getProfileData = async () => {
    set_loading(true);
    if (!standalone && !slug) return;
    // fetching user data
    const data = await user_info(slug, activitySkip);
    const nftFetch = await fetch_user_nfts();

    set_user_data(data?.data);
    setActivityRecords(data?.data?.activity);
    console.log(data?.data)
    setOnSaleNFTs(data?.data?.NFTs);
    setNFTCollections(data?.data?.nftCollections);
    set_loading(false);
  };

  const fetch_user_nfts = async () => {
    // getting profile nfts
    const res = await loadNFTs_user(standalone, slug, lastNFT);
    console.log({ res })
    let new_nfts = [...nfts];
    res?.nfts?.map((e) => {
      try {
        new_nfts.push({ ...JSON.parse(e.json), ...e });
      } catch (error) {
        return false;
      }
    });
    setLastNFT(res?.continuation);
    set_nfts(new_nfts);
  };

  const scrollActivityFetch = async () => {
    setMoreLoading(true);
    const newArray = await user_info(slug, activitySkip);
    if (newArray) {
      setActivityRecords([...activityRecords, ...newArray?.data?.activity]);
    }
    setMoreLoading(false);
  };

  const handleActivityScroll = (e) => {
    const { offsetHeight, scrollTop, scrollHeight } = e.target;
    if (offsetHeight + scrollTop + 10 >= scrollHeight) {
      setActivitySkip(activityRecords.length);
    }
  };

  useEffect(() => {
    getProfileData();
  }, [signer_address, standalone]);

  useEffect(() => {
    scrollActivityFetch();
  }, [activitySkip]);

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

  return loading ? (
    <Loader theme={theme} />
  ) : (
    <div className={`${theme} w-[100%] dark:bg-jacarta-900`}>
      <Head>
        <title>User Profile - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content={`venomart, ${user_data?.user_name} profile on venomart, ${user_data?.user_name} venomart, ${user_data?.wallet} `}
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.png" />
      </Head>
      {/* <!-- Banner IMG--> */}
      <div className="relative pt-24 dark:bg-jacarta-800">
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
      <section className="relative pb-6 pt-28 dark:bg-jacarta-800">
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
              className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[auto]"
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
            {user_data?.Date && (
              <p className="mx-auto max-w-xl text-[16px] dark:text-jacarta-400 mb-6">
                Joined on {user_data?.Date}
              </p>
            )}

            {/* social accounts  */}
            <div className="flex justify-center align-middle mb-10 mt-4">
              {user_data && (
                <>
                  <a
                    href={
                      user_data?.socials?.length ? user_data?.socials[0] : "#"
                    }
                    target="_blank"
                    className="group mr-4"
                  >
                    <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                  </a>
                  <a
                    href={
                      user_data?.socials?.length ? user_data?.socials[1] : "#"
                    }
                    target="_blank"
                    className="group"
                  >
                    <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                  </a>
                </>
              )}
              <div
                onClick={() => setShare(!share)}
                className="ml-4 mt-[-10px] dropdown rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800"
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
                      href={`https://twitter.com/intent/tweet?text=This%20is%20my%20profile%20on%20venomart.io%20,%20check%20it%20out%20here-%20${webURL}profile/${slug}`}
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
      <section className="pt-6 dark:bg-jacarta-800 pb-12">
        <ul className="nav nav-tabs scrollbar-custom flex items-center justify-start overflow-x-auto overflow-y-hidden border-b border-jacarta-100 dark:border-jacarta-600 md:justify-center">
          <li className="nav-item" role="presentation" onClick={switchToOnSale}>
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
          <li className="nav-item" role="presentation" onClick={switchToOwned}>
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
          {signer_address === slug && (
            <li
              className="nav-item"
              role="presentation"
              onClick={switchToActivity}
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
          )}
        </ul>
      </section>

      {/* fetch listed nfts here */}
      {onSale && (
        <section className="relative pt-6 pb-24 dark:bg-jacarta-800">
          <div>
            <div className="tab-content">
              <div
                className="tab-pane fade show active"
                id="on-sale"
                role="tabpanel"
                aria-labelledby="on-sale-tab"
              >
                <div className="flex justify-center align-middle flex-wrap">
                  {onSaleNFTs?.map((e, index) => {
                    return (
                      <NftCard
                        key={index}
                        ImageSrc={e?.nft_image}
                        Name={e?.name}
                        Description={e?.description}
                        Address={e?.NFTAddress}
                        listedBool={e?.isListed}
                        listingPrice={e?.listingPrice}
                        NFTCollectionAddress={e?.NFTCollection?.contractAddress}
                        NFTCollectionName={e?.NFTCollection?.name}
                        NFTCollectionStatus={e?.NFTCollection?.isVerified}
                        currency={currency}
                      />
                    );
                  })}
                </div>
                <div className="flex justify-center">
                  {onSaleNFTs?.length <= 0 && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No NFTs listed!
                    </h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* fetch owned nfts  */}
      {owned && (
        <section className={`relative pt-6 pb-24 dark:bg-jacarta-800`}>
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
                          Description={e?.description}
                          Address={e.nft._address}
                        />
                      );
                    })}
                  </InfiniteScroll>
                </div>

                <div className="flex justify-center">
                  {nfts?.length <= 0 && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                      No NFTs to show!
                    </h2>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* //fetch collections here */}
      {collections && (
        <section className="relative pt-6 pb-24 dark:bg-jacarta-800">
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
                      Listing={e?.TotalListing}
                      Volume={e?.TotalVolume}
                      FloorPrice={e?.FloorPrice}
                      venomProvider={venomProvider}
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
      {signer_address === slug && activity && (
        <section className="relative pt-6 pb-24 dark:bg-jacarta-800">
          <div className="container">
            <div className="tab-content">
              <div className="tab-pane fade show active">
                {activityRecords != "" && (
                  <div className="flexActivitySection">
                    <div
                      className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10 scroll-list"
                      onScroll={handleActivityScroll}
                    >
                      <div className="flex justify-center align-middle flex-wrap">
                        {activityRecords?.map((e, index) => (
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
                        {moreLoading &&
                          <div className="flex items-center justify-center space-x-2">
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                          </div>}
                      </div>
                    </div>

                    {/* <!-- Filters --> */}
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
              </div>
              <div className="flex justify-center text-center">
                {activityRecords?.length <= 0 && (
                  <h2 className="text-xl font-display font-thin dark:text-jacarta-200">
                    No Activity Yet!
                  </h2>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;
