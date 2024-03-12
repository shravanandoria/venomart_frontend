import { useEffect, useState, useContext } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import CollectionCard from "../components/cards/CollectionCard";
import LaunchCollectionCard from "../components/cards/LaunchCollectionCard";
import SmallCollectionCard from "../components/cards/SmallCollectionCard";
import SmallUserCard from "../components/cards/SmallUserCard";
import { MdVerified } from "react-icons/md";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { featured_collections, get_collections, top_collections } from "../utils/mongo_api/collection/collection";
import { TonClientContext } from "../context/tonclient";
import { top_users } from "../utils/mongo_api/user/user";
import customLaunchpad from "./launchpad/customLaunchpad.json";
import { BsFillExclamationCircleFill } from "react-icons/bs";
import defLogo from "../../public/deflogo.png";
import Loader from "../components/Loader";



export default function Home({ theme }) {
  const { client } = useContext(TonClientContext);

  const [topCollections, setTopCollections] = useState([]);
  const [trendingCollections, setTrendingCollections] = useState([]);
  const [featuredCollections, setFeaturedCollections] = useState([]);
  const [topUsers, setTopUsers] = useState([]);

  const [durationDrop, setDurationDrop] = useState(false);
  const [topSwitchDrop, setTopSwitchDrop] = useState(false);
  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);

  const [duration, setDuration] = useState("7days");
  const [topSwitch, setTopSwitch] = useState("collections");
  const [fullLoading, setFullLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [trendLoad, setTrendLoad] = useState(false);

  const fetchFeaturedCollections = async () => {
    const collectionsJSON = await featured_collections();
    setFeaturedCollections(collectionsJSON);
  };

  const fetchTopCollections = async () => {
    setLoading(true);
    const topCollections = await top_collections("All", "unverified", duration);
    setTopCollections(topCollections);
    setLoading(false);
  };

  const fetchTrendingCollection = async () => {
    setTrendLoad(true);
    const collectionsJSON = await top_collections("All", "unverified", "1day");
    setTrendingCollections(collectionsJSON);
    setTrendLoad(false);
  };

  const fetchTopUsers = async () => {
    setLoading(true);
    const result = await top_users(duration, "none");
    setTopUsers(result);
    setLoading(false);
  };

  useEffect(() => {
    setFullLoading(true);
    fetchFeaturedCollections();
    fetchTrendingCollection();
    fetchTopCollections();
    setFullLoading(false);
  }, []);

  useEffect(() => {
    if (!duration || defaultFilterFetch != true || topSwitch != "collections") return;
    fetchTopCollections();
  }, [duration]);

  useEffect(() => {
    if (!duration || defaultFilterFetch != true || topSwitch != "users") return;
    fetchTopUsers();
  }, [topSwitch, duration]);

  if (!client) {
    return <>-</>;
  }

  return (
    <div className={`${theme} overflow-x-hidden font-body text-jacarta-500 dark:bg-jacarta-900`}>
      <Head>
        <title>Venomart - NFT Marketplace on Venom</title>
        <meta
          name="description"
          content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
        />
        <meta
          name="keywords"
          content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom"
        />

        <meta property="og:title" content="Venomart - NFT Marketplace on Venom" />
        <meta property="og:description" content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain" />
        <meta property="og:image" content="https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg" />
        <meta property="og:url" content={"https://venomart.io/"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Venomart - NFT Marketplace on Venom" />
        <meta name="twitter:description" content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain" />
        <meta name="twitter:image" content="https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg" />
        <meta name="twitter:site" content="@venomart23" />
        <meta name="twitter:creator" content="@venomart23" />
        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>

      {fullLoading ?
        <Loader theme={theme} />
        :
        <>
          {/* hero section  */}
          <div className="relative py-12 dark:bg-jacarta-900 pb-10 pt-40" style={{ userSelect: "none" }}>
            <div className="containerForHeroSlider">
              <div className="flex justify-center align-middle flex-wrap">
                <Swiper
                  modules={[Pagination, Navigation, Autoplay]}
                  slidesPerView={1}
                  autoplay={{
                    delay: 2500,
                    disableOnInteraction: true,
                  }}
                  navigation={true}
                  className="mySwiper"
                >
                  {featuredCollections?.map((e, id) => {
                    return (
                      <SwiperSlide
                        key={id}
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Link href={`/collection/${e?.contractAddress}`} className="relative heroSectionFeatureCardSection">
                          <Image
                            height={100}
                            width={100}
                            className="absolute inset-0 w-full h-full object-cover"
                            style={{ borderRadius: "25px" }}
                            src={e?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                          />

                          {/* feature card div */}
                          <div className="flex absolute rounded-2.5xl border border-jacarta-100 bg-slate-100 hover:white py-4 px-7 transition-shadow hover:shadow-lg dark:border-transparent dark:bg-jacarta-700 heroSectionFeatureCard">
                            <div className="mr-4 shrink-0">
                              <div className="relative block">
                                <Image
                                  src={
                                    e?.logo
                                      ? e?.logo.replace("ipfs://", "https://ipfs.io/ipfs/")
                                      : defLogo
                                  }
                                  alt="avatar 1"
                                  className="rounded-2lg h-[85px] w-[85px]"
                                  height={100}
                                  width={100}

                                />
                                {e.isVerified == true ? (
                                  <div className="absolute right-[-5px] top-[75%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
                                    <MdVerified style={{ color: "#4f87ff" }} size={25} />
                                  </div>
                                ) : (
                                  <div className="absolute right-[-5px] top-[75%] flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-white dark:bg-transparent dark:border-jacarta-600">
                                    <BsFillExclamationCircleFill
                                      style={{ color: "#c3c944" }}
                                      size={20}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col justify-start">
                              <span className="text-[11px] font-bold dark:text-jacarta-300 text-left">FEATURED COLLECTION</span>
                              <span className="text-left textDotStyleTitle text-[27px] font-display font-semibold text-jacarta-700 dark:text-white">
                                {e?.name}
                              </span>
                              <div className="text-sm dark:text-jacarta-300 text-left max-w-md flex flex-wrap justify-center items-center">
                                <span className="text-left textDotStyle dark:text-jacarta-400">
                                  {e?.description}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            </div>
          </div>

          {/* launchpad collections  */}
          <div className="relative py-12 dark:bg-jacarta-900" style={{ userSelect: "none" }}>
            <div className="container">
              <div className="mb-2 text-center font-display text-3xl text-jacarta-700 dark:text-white">
                <h2 className="inline">Venomart Launchpad 🚀</h2>
              </div>
              <div className="flex justify-center align-middle flex-wrap">
                {/* custom lauchpad fetching  */}
                <Swiper
                  modules={[Pagination, Navigation]}
                  spaceBetween={30}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                  breakpoints={{
                    300: {
                      slidesPerView: 1,
                      spaceBetween: 20,
                    },
                    800: {
                      slidesPerView: 2,
                      spaceBetween: 20,
                    },
                    1204: {
                      slidesPerView: 3,
                      spaceBetween: 30,
                    },
                  }}
                  className="mySwiper"
                >
                  {customLaunchpad
                    ?.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
                    .filter((e, id) => id < 7 && e.verified === true)
                    .map((e, id) => {
                      return (
                        id < 6 &&
                        e.verified == true && (
                          <SwiperSlide
                            key={id}
                            style={{
                              display: "flex",
                              justifyContent: "center",
                              alignItems: "center",
                            }}
                          >
                            <LaunchCollectionCard
                              Cover={e.Cover}
                              Logo={e.Logo}
                              Name={e.Name}
                              Description={e.Description}
                              mintPrice={e.mintPrice}
                              supply={e.supply}
                              status={e.status}
                              CollectionAddress={e.CollectionAddress}
                              customLink={e.customLink}
                              verified={e.verified}
                              startDate={e.startDate}
                              endDate={e.endDate}
                            />
                          </SwiperSlide>
                        )
                      );
                    })}
                </Swiper>
              </div>
            </div>
          </div>

          {/* trending collections  */}
          <div className="relative py-12 dark:bg-jacarta-900" style={{ userSelect: "none" }}>
            <div className="container">
              <div className="mb-2 text-center font-display text-3xl text-jacarta-700 dark:text-white">
                <h2 className="inline">Trending Collections 🔥</h2>
              </div>
              <div className="flex justify-center align-middle flex-wrap">
                <Swiper
                  modules={[Pagination, Navigation]}
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
                  {trendingCollections?.map((e, id) => {
                    return (
                      id < 6 &&
                      e?.name != "" &&
                      e?.name != undefined && (
                        <SwiperSlide
                          key={id}
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <CollectionCard
                            Cover={e?.coverImage}
                            Logo={e?.logo}
                            Name={e?.name}
                            Description={e?.description}
                            OwnerAddress={e?.OwnerAddress}
                            CollectionAddress={e?.contractAddress}
                            verified={e?.isVerified}
                            // Listing={e?.TotalListed}
                            Volume={e?.TotalVolume}
                            FloorPrice={e?.FloorPrice}
                            TotalSupply={e?.TotalSupply}
                          />
                        </SwiperSlide>
                      )
                    );
                  })}
                </Swiper>
                {trendLoad && (
                  <div className="flex items-center justify-center space-x-2 py-28">
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                    <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* top collections  */}
          <section className="relative py-24 dark:bg-jacarta-900">
            <div className="container">
              <div className="mb-12 text-center font-display text-3xl text-jacarta-700 dark:text-white">
                <h2 className="inline mr-2">Top</h2>
                <div className="relative inline cursor-pointer">
                  <button
                    onClick={() => setTopSwitchDrop(!topSwitchDrop)}
                    className="dropdown-toggle inline-flex items-center text-accent"
                    type="button"
                  >
                    {topSwitch == "collections" && "collections"}
                    {topSwitch == "users" && "users"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-8 w-8 fill-accent"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                    </svg>
                  </button>
                  {topSwitchDrop && (
                    <div className="absolute right-0 z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-900">
                      <div
                        onClick={() => (
                          setDefaultFilterFetch(true), setTopSwitch("collections"), setTopSwitchDrop(false)
                        )}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        collections
                      </div>
                      <div
                        onClick={() => (setDefaultFilterFetch(true), setTopSwitch("users"), setTopSwitchDrop(false))}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        users
                      </div>
                    </div>
                  )}
                </div>
                <h2 className="inline mr-2">over</h2>
                <div className="relative inline cursor-pointer">
                  <button
                    onClick={() => setDurationDrop(!durationDrop)}
                    className="dropdown-toggle inline-flex items-center text-accent"
                    type="button"
                  >
                    {duration == "1day" && "last 24 hours"}
                    {duration == "7days" && "last 7 days"}
                    {duration == "30days" && "last 30 days"}
                    {duration == "1year" && "last 1 year"}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-8 w-8 fill-accent"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 13.172l4.95-4.95 1.414 1.414L12 16 5.636 9.636 7.05 8.222z" />
                    </svg>
                  </button>
                  {durationDrop && (
                    <div className="absolute right-0 z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-900">
                      <div
                        onClick={() => (setDefaultFilterFetch(true), setDuration("1day"), setDurationDrop(false))}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        Last 24 Hours
                      </div>
                      <div
                        onClick={() => (setDefaultFilterFetch(true), setDuration("7days"), setDurationDrop(false))}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        Last 7 Days
                      </div>
                      <div
                        onClick={() => (setDefaultFilterFetch(true), setDuration("30days"), setDurationDrop(false))}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        Last 30 Days
                      </div>
                      <div
                        onClick={() => (setDefaultFilterFetch(true), setDuration("1year"), setDurationDrop(false))}
                        className="dropdown-item block rounded-xl px-5 py-2 text-sm transition-colors hover:bg-jacarta-50 dark:hover:bg-jacarta-600"
                      >
                        Last 1 Year
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {topSwitch == "collections" ? (
                <>
                  <div className="flex justify-center align-middle flex-wrap">
                    {topCollections?.map((e, index) => {
                      return (
                        index < 9 && (
                          <SmallCollectionCard
                            key={index}
                            id={index + 1}
                            Logo={e?.logo}
                            Name={e?.name}
                            OwnerAddress={e?.creatorAddress}
                            CollectionAddress={e?.contractAddress}
                            theme={theme}
                            isVerified={e?.isVerified}
                            Volume={e?.TotalVolume}
                            Floor={e?.FloorPrice}
                          />
                        )
                      );
                    })}
                    {loading && (
                      <div className="flex items-center justify-center space-x-2 py-28">
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      </div>
                    )}
                  </div>
                  <div className="mt-10 text-center">
                    <Link
                      href="/explore/rankings/Collections"
                      className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Go to Rankings
                    </Link>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-center align-middle flex-wrap">
                    {topUsers?.map((e, index) => {
                      return (
                        index < 9 && (
                          <SmallUserCard
                            key={index}
                            theme={theme}
                            id={index + 1}
                            Logo={e?.profileImage}
                            Name={e?.user_info}
                            wallet_address={e?._id}
                            isVerified={e?.isVerified}
                            Volume={e?.totalSaleVolume}
                            totalSales={e?.totalSales}
                          />
                        )
                      );
                    })}
                    {loading && (
                      <div className="flex items-center justify-center space-x-2 py-28">
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      </div>
                    )}
                  </div>
                  <div className="mt-10 text-center">
                    <Link
                      href="/explore/rankings/Users"
                      className="inline-block rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                    >
                      Go to Rankings
                    </Link>
                  </div>
                </>
              )}
            </div>
          </section>
        </>
      }
    </div>
  );
}
