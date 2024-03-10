import React, { useCallback, useEffect, useState, useContext } from "react";
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
import { RxActivityLog } from "react-icons/rx";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import Head from "next/head";
import Loader from "../../components/Loader";
import { buy_nft, cancel_listing, loadNFTs_collection, loadNFTs_collection_RPC } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import defLogo from "../../../public/deflogo.png";
import defBack from "../../../public/defback.png";
import {
  edit_collection_settings,
  get_collection_by_contract,
  get_collection_props,
  update_collection_supply,
} from "../../utils/mongo_api/collection/collection";
import collectionAbi from "../../../abi/CollectionDrop.abi.json";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";
import { fetch_collection_nfts } from "../../utils/mongo_api/nfts/nfts";
import { search_nfts } from "../../utils/mongo_api/search";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import BuyModal from "../../components/modals/BuyModal";
import CancelModal from "../../components/modals/CancelModal";
import LineChart from "../../components/charts/LineChart";
import BarChart from "../../components/charts/BarChart";
import { get_charts } from "../../utils/mongo_api/analytics/analytics";
import moment from "moment";
import SuccessModal from "../../components/modals/SuccessModal";
import PropertyModal from "../../components/modals/PropertyModal";
import numeral from "numeral";
// import { TonClientContext } from "../../context/tonclient";
import { IoHandLeftOutline } from "react-icons/io5";
import { useStorage } from "@thirdweb-dev/react";

const Collection = ({
  blockURL,
  theme,
  standalone,
  webURL,
  copyURL,
  signer_address,
  venomProvider,
  setAnyModalOpen,
  cartNFTs,
  setCartNFTs,
  vnmBalance,
  connectWallet,
  EnableNFTCancel,
  EnableNFTSale,
  adminAccount
}) => {
  const router = useRouter();
  const storage = useStorage();

  const { slug } = router.query;

  const [loading, setLoading] = useState(false);
  const [propLoading, setPropLoading] = useState(false);
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
  const [property_traits, set_property_traits] = useState("");
  const [nfts, set_nfts] = useState([]);
  const [activity, set_activity] = useState([]);
  const [analytics, set_analytics] = useState([]);
  const [lastNFT, setLastNFT] = useState(undefined);
  const [onChainData, setOnChainData] = useState(false);

  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [skipActivity, setSkipActivity] = useState(0);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);

  const [fetchedCollectionActivity, setFetchedCollectionActivity] = useState(false);
  const [fetchedCollectionAnalytics, setFetchedCollectionAnalytics] = useState(false);
  const [fetchedProps, setFetchedProps] = useState(false);
  const [activityType, setActivityType] = useState("");

  const [searchLoading, setSearchLoading] = useState(false);
  const [query_search, set_query_search] = useState("");
  const [isTyping, set_isTyping] = useState(true);
  const [def_query, set_def_query] = useState(undefined);
  const [actionDrop, setActionDrop] = useState(false);
  const [metaDataUpdated, setMetaDataUpdated] = useState(false);
  const [metadataLoading, setMetadataLoading] = useState(false);
  const [chartLoading, setChartLoading] = useState(false);

  const [propsFilter, setPropsFilter] = useState([]);
  const [currentFilter, setCurrentFilter] = useState("recentlyListed");
  const [currentDuration, setCurrentDuration] = useState("30days");
  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [actionLoad, setActionLoad] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState("");
  const [propertyModal, setPropertyModal] = useState(false);
  const [buyModal, setBuyModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [transactionType, setTransactionType] = useState("");
  const [collectionSettingUpdated, setCollectionSettingUpdated] = useState(false);

  const [preview, set_preview] = useState({ logo: "", coverImage: "" });

  // edit collection 
  const [data, set_data] = useState({
    contractAddress: "",
    royaltyAddress: "",
    name: "",
    logo: "",
    coverImage: "",
    website: "",
    twitter: "",
    discord: "",
    telegram: "",
    isNSFW: false,
    isVerified: true,
    isPropsEnabled: true,
    isFeatured: false,
    isTrading: true,
    Category: "",
    description: "",
  });

  const handleChange = (e) => {
    set_data({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    set_data({
      ...data,
      [e.target.name]: value,
    });
  };

  const handle_submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let obj = {
      ...data,
    };

    if (typeof data.coverImage === "object") {
      let ipfs_coverImg = await storage?.upload(data.coverImage);
      obj.coverImage = ipfs_coverImg;
    }
    if (typeof data.logo === "object") {
      let ipfs_logo = await storage?.upload(data.logo);
      obj.logo = ipfs_logo;
    }

    const updatedSettings = await edit_collection_settings(obj);
    if (updatedSettings) {
      setCollectionSettingUpdated(true);
    }
    setLoading(false);
  };

  // chartdata
  const salesData = {
    labels: analytics?.map(e =>
      currentDuration === "1day"
        ? moment(new Date(e.Time)).format("hh:mm a")
        : currentDuration === "7days" ||
          currentDuration === "30days" ||
          currentDuration === "6months" ||
          currentDuration === "1year"
          ? moment(new Date(e.Time)).format("DD MMM")
          : currentDuration === "alltime" && moment(new Date(e.Time)).format("MMMM"),
    ),
    datasets: [
      {
        label: "Sales",
        data: analytics?.map(e => e.TotalSales),
        fill: "start",
        backgroundColor: "rgba(160, 131, 247, 0.2)",
        borderColor: "rgba(131, 91, 251, 1)",
        borderWidth: 2,
      },
    ],
  };

  const volumeData = {
    labels: analytics?.map(e =>
      currentDuration === "1day"
        ? moment(new Date(e.Time)).format("hh:mm a")
        : currentDuration === "7days" ||
          currentDuration === "30days" ||
          currentDuration === "6months" ||
          currentDuration === "1year"
          ? moment(new Date(e.Time)).format("DD MMM")
          : currentDuration === "alltime" && moment(new Date(e.Time)).format("MMMM"),
    ),
    datasets: [
      {
        label: "Volume",
        data: analytics?.map(e => e.SalesVolume),
        fill: "start",
        backgroundColor: "rgba(160, 131, 247, 0.2)",
        borderColor: "rgba(131, 91, 251, 1)",
        borderWidth: 2,
      },
    ],
  };

  const listingData = {
    labels: analytics?.map(e =>
      currentDuration === "1day"
        ? moment(new Date(e.Time)).format("hh:mm a")
        : currentDuration === "7days" ||
          currentDuration === "30days" ||
          currentDuration === "6months" ||
          currentDuration === "1year"
          ? moment(new Date(e.Time)).format("DD MMM")
          : currentDuration === "alltime" && moment(new Date(e.Time)).format("MMMM"),
    ),
    datasets: [
      {
        label: "Listings",
        data: analytics?.map(e => e.TotalListings),
        fill: "start",
        backgroundColor: "rgba(160, 131, 247, 0.2)",
        borderColor: "rgba(131, 91, 251, 1)",
        borderWidth: 2,
      },
    ],
  };

  const floorData = {
    labels: analytics?.map(e =>
      currentDuration === "1day"
        ? moment(new Date(e.Time)).format("hh:mm a")
        : currentDuration === "7days" ||
          currentDuration === "30days" ||
          currentDuration === "6months" ||
          currentDuration === "1year"
          ? moment(new Date(e.Time)).format("DD MMM")
          : currentDuration === "alltime" && moment(new Date(e.Time)).format("MMMM"),
    ),
    datasets: [
      {
        label: "Floor Price",
        data: analytics?.map(e => e.floorPrice),
        fill: "start",
        backgroundColor: "rgba(160, 131, 247, 0.2)",
        borderColor: "rgba(131, 91, 251, 1)",
        borderWidth: 2,
      },
    ],
  };

  const marketData = {
    labels: analytics?.map(e =>
      currentDuration === "1day"
        ? moment(new Date(e.Time)).format("hh:mm a")
        : currentDuration === "7days" ||
          currentDuration === "30days" ||
          currentDuration === "6months" ||
          currentDuration === "1year"
          ? moment(new Date(e.Time)).format("DD MMM")
          : currentDuration === "alltime" && moment(new Date(e.Time)).format("MMMM"),
    ),
    datasets: [
      {
        label: "Market Cap",
        data: analytics?.map(e => e.marketCap),
        fill: "start",
        backgroundColor: "rgba(160, 131, 247, 0.2)",
        borderColor: "rgba(131, 91, 251, 1)",
        borderWidth: 2,
      },
    ],
  };

  // getting charts
  const get_charts_data = async () => {
    if (!collection._id) return;
    setChartLoading(true);
    const chartData = await get_charts(collection._id, currentDuration);
    if (chartData) {
      chartData.reverse();
      setFetchedCollectionAnalytics(true);
      set_analytics(chartData);
    }
    setChartLoading(false);
  };

  // refresh nft metadata
  const refreshMetadata = async () => {
    if (metaDataUpdated == true) return;
    setMetadataLoading(true);

    const contract = new venomProvider.Contract(collectionAbi, slug);
    const totalSupply = await contract.methods.totalSupply({ answerId: 0 }).call();

    if (collection?.TotalSupply < totalSupply?.count) {
      const updateNFTData = await update_collection_supply(slug, totalSupply.count);
      setMetadataLoading(false);
      alert("Metadata has been updated to latest");
      router.reload();
      setMetaDataUpdated(true);
      return;
    } else {
      setMetaDataUpdated(true);
      setMetadataLoading(false);
      alert("Metadata is already up to date!");
    }
  };

  // mediaQuery
  const useMediaQuery = width => {
    const [targetReached, setTargetReached] = useState(false);

    const updateTarget = useCallback(e => {
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
  // const { client } = useContext(TonClientContext);

  // getting def collection info
  const gettingCollectionInfo = async () => {
    if (!venomProvider && !slug) return;
    setLoading(true);
    const nfts_offchain = await fetch_collection_nfts(
      slug,
      signer_address,
      currentFilter,
      propsFilter,
      minPrice,
      maxPrice,
      skip,
    );
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
      if (nfts_offchain == "" || nfts_offchain == undefined) {
        setHasMore(false);
      }
    }

    if (nfts_offchain == undefined || nfts_offchain.length <= 0) {
      // fetch using RPC 
      const nfts_onchain = await loadNFTs_collection_RPC(venomProvider, slug, lastNFT);

      // fetch using GRAPHQL
      // const nfts_onchain = await loadNFTs_collection(
      //   venomProvider,
      //   slug,
      //   undefined,
      //   client
      // );
      setOnChainData(true);
      setLastNFT(nfts_onchain?.continuation);
      set_nfts(nfts_onchain?.nfts);
    }

    // getting contract info
    const res = await get_collection_by_contract(slug);
    if (res) {
      set_collection(res?.data);
      set_preview({
        ...preview,
        logo: res?.data?.logo,
        coverImage: res?.data?.coverImage,
      });
      set_data({
        contractAddress: res?.data?.contractAddress,
        royaltyAddress: res?.data?.royaltyAddress,
        logo: res?.data?.logo,
        name: res?.data?.name,
        coverImage: res?.data?.coverImage,
        website: res?.data?.socials[0],
        twitter: res?.data?.socials[1],
        discord: res?.data?.socials[2],
        telegram: res?.data?.socials[3],
        isNSFW: res?.data?.isNSFW,
        isVerified: res?.data?.isVerified,
        isPropsEnabled: res?.data?.isPropsEnabled,
        isFeatured: res?.data?.isFeatured,
        isTrading: res?.data?.isTrading,
        Category: res?.data?.Category,
        description: res?.data?.description,
      });
    }
    setLoading(false);
  };

  const getCollectionProperties = async () => {
    if (fetchedProps == true) return;
    setPropLoading(true);
    const res = await get_collection_props(collection?._id);
    if (res) {
      set_property_traits(res?.data);
      setFetchedProps(true);
    }
    setPropLoading(false);
  };

  // getting nfts according to success modal response
  const fetch_nfts_success = async () => {
    if (defaultFilterFetch == false) return;
    const nfts_offchain = await fetch_collection_nfts(
      slug,
      signer_address,
      currentFilter,
      propsFilter,
      minPrice,
      maxPrice,
      skip,
    );
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
      if (nfts_offchain == "" || nfts_offchain == undefined) {
        setHasMore(false);
      }
    }
  };

  // getting nfts according to filter
  const fetch_filter_nfts = async () => {
    if (defaultFilterFetch == false) return;
    const nfts_offchain = await fetch_collection_nfts(
      slug,
      signer_address,
      currentFilter,
      propsFilter,
      minPrice,
      maxPrice,
      skip,
    );
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
      if (nfts_offchain == "" || nfts_offchain == undefined) {
        setHasMore(false);
      }
    }
  };
  // clearing nfts according to filter
  const clear_filter_nfts = async () => {
    if (defaultFilterFetch == false) return;
    const nfts_offchain = await fetch_collection_nfts(slug, signer_address, currentFilter, propsFilter, 0, 0, skip);
    if (nfts_offchain) {
      set_nfts(nfts_offchain);
      if (nfts_offchain == "" || nfts_offchain == undefined) {
        setHasMore(false);
      }
    }
  };

  // filter btn for fetch onchain data
  const filterFetchOnchainData = async () => {
    setSearchLoading(true);
    const nfts_onchain = await loadNFTs_collection_RPC(venomProvider, slug, lastNFT);
    setOnChainData(true);
    setLastNFT(nfts_onchain?.continuation);
    set_nfts(nfts_onchain?.nfts);
    setSearchLoading(false);
  };

  // fetching collection activity
  const fetch_collection_activity = async () => {
    if (collection?._id == undefined) return;
    setSearchLoading(true);
    const res = await getActivity("", "", collection._id, "", activityType, skipActivity);
    if (res) {
      set_activity(res);
      if (res == "" || res == undefined) {
        setHasMoreActivity(false);
      }
    }
    setFetchedCollectionActivity(true);
    setSearchLoading(false);
  };

  // fetching on onchain scroll
  const fetch_more_nftsOnChain = async () => {
    if (onChainData == false) return;
    const res = await loadNFTs_collection_RPC(venomProvider, slug, lastNFT);
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
    const nfts_offchain = await fetch_collection_nfts(
      slug,
      signer_address,
      currentFilter,
      propsFilter,
      minPrice,
      maxPrice,
      skip,
    );
    if (nfts_offchain) {
      set_nfts([...nfts, ...nfts_offchain]);
      if (nfts_offchain == "" || nfts_offchain == undefined) {
        setHasMore(false);
      }
    }
  };

  const handleScroll = e => {
    setSkip(nfts.length);
  };

  // acitivty scroll function
  const scrollFetchActivity = async () => {
    if (collection._id == undefined) return;
    setSearchLoading(true);
    const res = await getActivity("", "", collection._id, "", activityType, skipActivity);
    if (res) {
      set_activity([...activity, ...res]);
      if (res == "" || res == undefined) {
        setHasMoreActivity(false);
      }
    }
    setSearchLoading(false);
  };

  const handleActivityScroll = () => {
    setSkipActivity(activity.length);
  };

  // handling search
  const handle_search = async data => {
    setSearchLoading(true);
    set_query_search(data);
    set_isTyping(true);
    set_def_query("");
  };

  // connecting wallet
  const connect_wallet = async () => {
    const connect = await connectWallet();
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
    if (parseFloat(vnmBalance) <= selectedNFT.listingPrice) {
      alert("You do not have sufficient venom tokens to buy this NFT!!");
      return;
    }
    setActionLoad(true);
    let royaltyFinalAmount =
      ((parseFloat(selectedNFT?.demandPrice) *
        parseFloat(selectedNFT?.NFTCollection?.royalty ? selectedNFT?.NFTCollection?.royalty : 0)) /
        100) *
      1000000000;
    try {
      const buying = await buy_nft(
        venomProvider,
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
        selectedNFT?.FloorPrice,
      );
      if (buying == true) {
        setActionLoad(false);
        setBuyModal(false);
        setTransactionType("Sale");
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
  const cancelNFT = async e => {
    e.preventDefault();
    if (!EnableNFTCancel) {
      alert("Cancel is disabled for a while!!")
      return;
    }
    setActionLoad(true);
    try {
      const cancelling = await cancel_listing(
        selectedNFT?.ownerAddress,
        selectedNFT?.managerAddress,
        selectedNFT?.NFTAddress,
        selectedNFT?.NFTCollection?.contractAddress,
        venomProvider,
        signer_address,
        selectedNFT?.FloorPrice,
      );
      if (cancelling == true) {
        setActionLoad(false);
        setCancelModal(false);
        setTransactionType("Cancel");
        setSuccessModal(true);
      }
      if (cancelling == false) {
        setActionLoad(false);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // format num
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

  // use effects
  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || def_query == undefined) return;
      setSearchLoading(true);
      const res = await search_nfts(query_search, collection._id);
      if (res) {
        set_nfts(res.nfts);
        if (res.nfts == "") {
          setHasMore(false);
        }
      }
      set_isTyping(false);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  useEffect(() => {
    if (!slug) return;
    gettingCollectionInfo();
  }, [slug, venomProvider]);

  useEffect(() => {
    if (!slug) return;
    fetch_more_nftsOffChain();
  }, [skip]);

  useEffect(() => {
    scrollFetchActivity();
  }, [skipActivity]);

  useEffect(() => {
    fetch_collection_activity();
  }, [activityType]);

  useEffect(() => {
    fetch_filter_nfts();
  }, [currentFilter, propsFilter]);

  useEffect(() => {
    get_charts_data();
  }, [currentDuration]);

  useEffect(() => {
    if (listedFilter || saleTypeFilter || priceRangeFilter) {
      document.body.addEventListener("click", () => {
        showListedFilter(false);
        showSaleTypeFilter(false);
        showPriceRangeFilter(false);
      });
    }
  }, [listedFilter, saleTypeFilter, priceRangeFilter]);

  return (
    <div className={`${theme}`}>
      <Head>
        <title>{`${collection?.name ? collection?.name : "Collection"} - Venomart Marketplace`}</title>
        <meta
          name="description"
          content={`${collection?.description
            ? collection?.description
            : "Explore, Create and Experience exculsive NFTs on Venomart"
            } | Powered by Venom Blockchain`}
        />
        <meta
          name="keywords"
          content={`${collection?.name}, ${collection?.name} nft collection, venomart, nft collections on venom, top nft collection on venom, best NFTs on venom, venom network nfts, venom nfts`}
        />

        <meta property="og:title" content={`${collection?.name ? collection?.name : "Collection"} - Venomart Marketplace`} />
        <meta property="og:description" content={`${collection?.description ? collection?.description : "Explore, Create and Experience exclusive NFTs on Venomart"} | Powered by Venomart`} />
        <meta property="og:image" content={`${collection?.coverImage ? collection?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/") : "https://ipfs.io/ipfs/QmQkBPAQegtJymtC9AdsdkpJrsbsj3ijPXSEfNDyj7RzJM/bg.png"}`} />
        <meta property="og:url" content={"https://venomart.io/"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${collection?.name ? collection?.name : "Collection"} - Venomart Marketplace`} />
        <meta name="twitter:description" content={`${collection?.description ? collection?.description : "Explore, Create and Experience exclusive NFTs on Venomart"} | Powered by Venomart`} />
        <meta name="twitter:image" content={`${collection?.coverImage ? collection?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/") : "https://ipfs.io/ipfs/QmQkBPAQegtJymtC9AdsdkpJrsbsj3ijPXSEfNDyj7RzJM/bg.png"}`} />
        <meta name="twitter:site" content="@venomart23" />
        <meta name="twitter:creator" content="@venomart23" />

        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>

      {buyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {cancelModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {!loading && (editModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>)}

      {propertyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {successModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {loading ? (
        <Loader theme={theme} />
      ) : (
        <div className="dark:bg-jacarta-900 ">
          {/* <!-- Banner IMG--> */}
          <div className="relative pt-24">
            {collection?.coverImage ? (
              <Image
                src={collection?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/")}
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
            {(adminAccount.includes(signer_address) || (signer_address == collection?.creatorAddress)) && (
              < div className="container relative -translate-y-4 cursor-pointer" onClick={() => setEditModal(true)}>
                <div className="group absolute right-0 bottom-2 flex items-center rounded-lg bg-white py-2 px-4 font-display text-sm hover:bg-accent">
                  <span className="mt-0.5 block group-hover:text-white">
                    Collection Settings ⚙️
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* <!-- Collection Section --> */}
          <section className="relative pb-6 pt-20 dark:bg-jacarta-900">
            <div className="absolute left-1/2 top-0 z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="relative">
                {collection?.logo ? (
                  <Image
                    src={collection?.logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[130px] bg-gray-800 object-fill"
                  />
                ) : (
                  <Image
                    src={defLogo}
                    width={100}
                    height={100}
                    alt="collection avatar"
                    className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[130px]"
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
                    <p className="bg-blue px-[20px] py-[3px] text-white text-[12px]" style={{ borderRadius: "10px" }}>
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
                {/* name  */}
                <h2 className="mb-2 mt-2 font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                  {collection?.name ? collection?.name : "Unknown Collection"}
                </h2>

                {/* socials  */}
                <div className="flex justify-center align-middle mb-2 mt-2">
                  {collection?.socials && (
                    <>
                      {collection?.socials[0] && (
                        <a href={collection?.socials[0]} target="_blank" className="group ml-3">
                          <BsBrowserChrome className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[1] && (
                        <a href={collection?.socials[1]} target="_blank" className="group ml-3">
                          <BsTwitter className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[2] && (
                        <a href={collection?.socials[2]} target="_blank" className="group ml-3">
                          <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                      {collection?.socials[3] && (
                        <a href={collection?.socials[3]} target="_blank" className="group ml-3">
                          <BsTelegram className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                        </a>
                      )}
                    </>
                  )}
                </div>

                {/* address  */}
                <div className="mb-2 flex justify-center align-middle py-1.5 px-4">
                  <a
                    href={`${blockURL}accounts/${slug}`}
                    target="_blank"
                    className="js-copy-clipboard dark:text-jacarta-200"
                  >
                    <span>{slug?.slice(0, 6) + "..." + slug?.slice(61)}</span>
                  </a>
                  <svg
                    onClick={() => (
                      navigator.clipboard.writeText(`${slug}`), alert("copied collection contract address to clipboard")
                    )}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    width="24"
                    height="24"
                    className="ml-2 mb-px h-5 w-5 mt-[2px] fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white cursor-pointer"
                  >
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path d="M7 7V3a1 1 0 0 1 1-1h13a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-4v3.993c0 .556-.449 1.007-1.007 1.007H3.007A1.006 1.006 0 0 1 2 20.993l.003-12.986C2.003 7.451 2.452 7 3.01 7H7zm2 0h6.993C16.549 7 17 7.449 17 8.007V15h3V4H9v3zM4.003 9L4 20h11V9H4.003z" />
                  </svg>
                </div>

                {/* royalty  */}
                {collection?.royalty != "" && (
                  <div className="mb-4">
                    <button className="bg-blue-500 text-white text-[12px] px-3 py-1 rounded-3xl cursor-default">
                      Royalties Fee {collection?.royalty}%
                    </button>
                  </div>
                )}

                {/* stats  */}
                <div className="mb-8 mt-4 inline-flex flex-wrap items-center justify-center rounded-xl border border-jacarta-100 bg-white dark:border-jacarta-600 dark:bg-jacarta-800">
                  <div className="w-1/2 rounded-l-xl border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32">
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white uppercase">
                      {collection?.TotalSupply ? formatNumberShort(collection?.TotalSupply) : "0"}
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">Items</div>
                  </div>
                  <div className="w-1/2 border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32 sm:border-r">
                    <div className="mb-1 text-base font-bold text-jacarta-700 dark:text-white uppercase">
                      {collection?.TotalListed ? formatNumberShort(collection?.TotalListed) : "0"}
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">For Sale</div>
                  </div>
                  <div className="w-1/2 border-r border-jacarta-100 py-4 hover:shadow-md dark:border-jacarta-600 sm:w-32">
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
                      <span className="font-bold ml-1 uppercase">
                        {" "}
                        {collection?.FloorPrice ? formatNumberShort(collection?.FloorPrice) : "0"}
                      </span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">Floor Price</div>
                  </div>
                  <div className="w-1/2 rounded-r-xl border-jacarta-100 py-4 hover:shadow-md sm:w-32">
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
                      <span className="font-bold ml-1 uppercase">
                        {collection?.TotalVolume ? formatNumberShort(collection?.TotalVolume) : "0"}
                      </span>
                    </div>
                    <div className="text-2xs font-medium tracking-tight dark:text-jacarta-400">Volume Traded</div>
                  </div>
                </div>

                {/* desc  */}
                <div className="mx-auto mb-8 max-w-xl text-lg dark:text-jacarta-300">
                  {collection?.description ? (
                    collection?.description
                  ) : (
                    <div>
                      This collection is tracked but not verified on Venomart. If you are the owner, you can contact us for the approval now!
                    </div>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-center space-x-2.5">
                  {/* Share  */}
                  <div className="relative dropdown rounded-xl border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600">
                    <button
                      onClick={() => (setActionDrop(false), setShare(!share))}
                      className="dropdown-toggle inline-flex h-10 w-10 items-center justify-center text-sm"
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
                    </button>

                    {share && (
                      <div className="absolute left-[-140px] top-[50px] dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                        <a
                          href={`https://twitter.com/intent/tweet?text=I%20found%20this%20awesome%20collection%20on%20venomart.io%0A${collection?.name ? collection?.name : "It"
                            }%20is%20an%20NFT%20collection%20on%20venom%20blockchain%20%F0%9F%94%A5%0ACheck%20it%20out%20here%20-%20${webURL}collection/${slug}%0A%23Venom%20%23VenomBlockchain%20%23venomart%20%23NFTCollection%20%23VenomNFTs`}
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
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">Twitter</span>
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
                          <span className="mt-1 inline-block text-jacarta-700 dark:text-jacarta-200">Copy</span>
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="relative dropdown rounded-xl border border-jacarta-100 bg-white hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700 dark:hover:bg-jacarta-600">
                    <button
                      onClick={() => (setShare(false), setActionDrop(!actionDrop))}
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
                      <div className="absolute left-[-140px] top-[50px] dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                        {metadataLoading ? (
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
                        )}
                        <button className="block w-full rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 text-jacarta-700 dark:text-jacarta-200 dark:hover:bg-jacarta-600">
                          Report
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* main section  */}
          <section className="relative pb-24 pt-12">
            {/* select tabs  */}
            <ul
              className="nav nav-tabs mb-12 flex items-center justify-center border-b border-jacarta-100 dark:border-jacarta-600"
              style={{ overflow: "hidden" }}
            >
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
                  <span className="font-display text-base font-medium">Items</span>
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  onClick={() => (
                    !fetchedCollectionAnalytics && get_charts_data(),
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
                  <span className="font-display text-base font-medium">Analytics</span>
                </button>
              </li>

              <li className="nav-item" role="presentation">
                <button
                  onClick={() => (
                    !fetchedCollectionActivity && fetch_collection_activity(),
                    showItemsTab(false),
                    showAnalyticsTab(false),
                    showActivityTab(true)
                  )}
                  className={`nav-link ${activityTab && "active relative"
                    } flex items-center whitespace-nowrap py-3 px-6 text-jacarta-400 hover:text-jacarta-700 dark:hover:text-white`}
                >
                  <RxActivityLog className="mr-1 h-4 w-4 fill-current" />
                  <span className="font-display text-base font-medium">Activity</span>
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
                      {!mobileFilter && isBreakpoint && (
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
                      )}
                      {mobileFilter && isBreakpoint && (
                        <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-6 z-20">
                          <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                        </button>
                      )}
                      {mobileFilter && (
                        <div className="collectionFilterDiv p-4">
                          <div className="collectionFilters mx-6">
                            {/* sale type  */}
                            <div className="typeModelMainDiv relative my-1 mr-2.5">
                              <button
                                onClick={e => (
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
                                <div
                                  onClick={e => e.stopPropagation()}
                                  className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                                >
                                  <ul className="flex flex-col flex-wrap">
                                    <li>
                                      <button className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                        <span className="text-jacarta-700 dark:text-white">Fixed price</span>
                                        {!onChainData && (
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
                                        )}
                                      </button>
                                    </li>
                                    <li>
                                      <button
                                        onClick={() => filterFetchOnchainData()}
                                        className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                      >
                                        <span className="text-jacarta-700 dark:text-white">Not for sale</span>
                                        {onChainData && (
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
                                onClick={e => (
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
                                  <span className="text-jacarta-700 dark:text-white">All Price Range</span>
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
                                  onClick={e => e.stopPropagation()}
                                  className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                                >
                                  <div className="flex items-center space-x-3 px-5 pb-2">
                                    <input
                                      type="number"
                                      placeholder="From"
                                      min="0"
                                      onInput={e => (e.target.value = Math.abs(e.target.value))}
                                      // value={minPrice}
                                      onChange={e => (
                                        setSkip(0), setHasMore(true), setMinPrice(parseFloat(e.target.value))
                                      )}
                                      className="w-full max-w-[7.5rem] rounded-lg border border-jacarta-100 py-[0.6875rem] px-4 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                    />
                                    <input
                                      type="number"
                                      placeholder="To"
                                      min="0"
                                      onInput={e => (e.target.value = Math.abs(e.target.value))}
                                      // value={maxPrice}
                                      onChange={e => (
                                        setDefaultFilterFetch(true),
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
                                        setDefaultFilterFetch(true),
                                        setMaxPrice(0),
                                        setMinPrice(0),
                                        clear_filter_nfts(),
                                        showPriceRangeFilter(false)
                                      )}
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
                                onClick={e => (
                                  e.stopPropagation(),
                                  showPriceRangeFilter(false),
                                  showSaleTypeFilter(false),
                                  showListedFilter(!listedFilter)
                                )}
                                className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                              >
                                {currentFilter == "recentlyListed" && (
                                  <span className="text-jacarta-700 dark:text-white">Recently Listed</span>
                                )}
                                {currentFilter == "recentlySold" && (
                                  <span className="text-jacarta-700 dark:text-white">Recently Sold</span>
                                )}
                                {currentFilter == "ownedBy" && (
                                  <span className="text-jacarta-700 dark:text-white">Owned By You</span>
                                )}
                                {currentFilter == "lowToHigh" && (
                                  <span className="text-jacarta-700 dark:text-white">Low To High</span>
                                )}
                                {currentFilter == "highToLow" && (
                                  <span className="text-jacarta-700 dark:text-white">High To Low</span>
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
                                  onClick={e => e.stopPropagation()}
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
                                      setDefaultFilterFetch(true),
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
                                      setDefaultFilterFetch(true),
                                      setCurrentFilter("recentlySold"),
                                      showListedFilter(false)
                                    )}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    Recently Sold
                                    {currentFilter == "recentlySold" && (
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
                                      setDefaultFilterFetch(true),
                                      setCurrentFilter("ownedBy"),
                                      showListedFilter(false)
                                    )}
                                    className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                  >
                                    Owned By You
                                    {currentFilter == "ownedBy" && (
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
                                      setDefaultFilterFetch(true),
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
                                      setDefaultFilterFetch(true),
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

                            {/* property modal  */}
                            {collection?.isPropsEnabled && (
                              <div className="typeModelMainDiv relative my-1 mr-2.5">
                                <button
                                  onClick={() => (
                                    getCollectionProperties(), setAnyModalOpen(true), setPropertyModal(true)
                                  )}
                                  className="typeModelBtn dropdown-toggle group group flex h-9 items-center rounded-lg border border-jacarta-100 bg-white px-4 text-sm text-jacarta-700 transition-colors hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white dark:hover:bg-accent"
                                  type="button"
                                  id="propertiesFilter"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    width="24"
                                    height="24"
                                    className="mr-1 h-4 w-4 fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100"
                                  >
                                    <path fill="none" d="M0 0h24v24H0z" />
                                    <path d="M6.17 18a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2v-2h4.17zm6-7a3.001 3.001 0 0 1 5.66 0H22v2h-4.17a3.001 3.001 0 0 1-5.66 0H2v-2h10.17zm-6-7a3.001 3.001 0 0 1 5.66 0H22v2H11.83a3.001 3.001 0 0 1-5.66 0H2V4h4.17z" />
                                  </svg>
                                  <span style={{ whiteSpace: "nowrap" }}>Filter Properties</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* search  */}
                          <div className="collectionSearch">
                            <form action="search" className="relative w-[60%]" onSubmit={e => e.preventDefault()}>
                              <input
                                type="search"
                                onChange={e => handle_search(e.target.value.replace(/[^\w\s]/gi, ""))}
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
                      )}
                    </div>
                  )}

                  <div>
                    <div className={`flex justify-center align-middle flex-wrap`}>
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
                                ImageSrc={(onChainData ? e?.preview?.source : e?.nft_image)?.replace(
                                  "ipfs://",
                                  "https://ipfs.io/ipfs/",
                                )}
                                Name={e?.name}
                                Address={onChainData ? e?.nftAddress?._address : e?.NFTAddress}
                                listedBool={e?.isListed}
                                listingPrice={e?.listingPrice}
                                NFTCollectionAddress={e?.NFTCollection?.contractAddress}
                                Description={e?.description}
                                NFTCollectionName={e?.NFTCollection?.name}
                                NFTCollectionStatus={e?.NFTCollection?.isVerified}
                                cartNFTs={cartNFTs}
                                setCartNFTs={setCartNFTs}
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
                              <InfiniteScroll
                                dataLength={nfts ? nfts?.length : 0}
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
                                {nfts?.map((e, index) => {
                                  return (
                                    <NftCard
                                      key={index}
                                      ImageSrc={(onChainData ? e?.preview?.source : e?.nft_image)?.replace(
                                        "ipfs://",
                                        "https://ipfs.io/ipfs/",
                                      )}
                                      Name={e?.name}
                                      Address={onChainData ? e?.nftAddress?._address : e?.NFTAddress}
                                      Owner={e?.ownerAddress}
                                      signerAddress={signer_address}
                                      listedBool={e?.isListed}
                                      listingPrice={e?.listingPrice}
                                      NFTCollectionAddress={e?.NFTCollection?.contractAddress}
                                      NFTCollectionName={e?.NFTCollection?.name}
                                      NFTCollectionStatus={e?.NFTCollection?.isVerified}
                                      setAnyModalOpen={setAnyModalOpen}
                                      setBuyModal={setBuyModal}
                                      setCancelModal={setCancelModal}
                                      NFTData={e}
                                      setSelectedNFT={setSelectedNFT}
                                      cartNFTs={cartNFTs}
                                      setCartNFTs={setCartNFTs}
                                    />
                                  );
                                })}
                              </InfiniteScroll>
                            </>
                          )}
                        </>
                      )}
                    </div>
                    <div className="flex justify-center">
                      {(nfts?.length <= 0 || nfts == undefined) && def_query == undefined && (
                        <h2 className="text-xl font-display font-thin text-jacarta-100 dark:text-jacarta-200 py-20">
                          No NFTs Found!!
                        </h2>
                      )}
                      {nfts?.length <= 0 && def_query == "" && !searchLoading && (
                        <h2 className="text-xl font-display font-thin text-jacarta-100 dark:text-jacarta-200 py-12">
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
                  <div className="collectionFilterDiv bg-white dark:bg-jacarta-900 p-4">
                    {!mobileFilter && isBreakpoint && (
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
                    )}
                    {mobileFilter && isBreakpoint && (
                      <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-6 z-20">
                        <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                      </button>
                    )}
                    {mobileFilter && (
                      <div className="collectionFilterDiv p-4">
                        <div className="collectionFilters mx-6">
                          <div className="typeModelMainDiv relative my-1 mr-2.5 cursor-pointer">
                            <div
                              onClick={e => (
                                e.stopPropagation(),
                                showPriceRangeFilter(false),
                                showSaleTypeFilter(false),
                                showListedFilter(!listedFilter)
                              )}
                              className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            >
                              {currentDuration == "1day" && (
                                <span className="text-jacarta-700 dark:text-white">Last 1 Day</span>
                              )}
                              {currentDuration == "7days" && (
                                <span className="text-jacarta-700 dark:text-white">Last 7 Days</span>
                              )}
                              {currentDuration == "30days" && (
                                <span className="text-jacarta-700 dark:text-white">Last 30 Days</span>
                              )}
                              {currentDuration == "6months" && (
                                <span className="text-jacarta-700 dark:text-white">Last 6 Months</span>
                              )}
                              {currentDuration == "1year" && (
                                <span className="text-jacarta-700 dark:text-white">Last 1 Year</span>
                              )}
                              {currentDuration == "alltime" && (
                                <span className="text-jacarta-700 dark:text-white">All Time Data</span>
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
                                onClick={e => e.stopPropagation()}
                                className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800"
                              >
                                <button
                                  onClick={() => (setCurrentDuration("1day"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                >
                                  Last 1 Day
                                  {currentDuration == "1day" && (
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
                                  onClick={() => (setCurrentDuration("7days"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Last 7 Days
                                  {currentDuration == "7days" && (
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
                                  onClick={() => (setCurrentDuration("30days"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Last 30 Days
                                  {currentDuration == "30days" && (
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
                                  onClick={() => (setCurrentDuration("6months"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Last 6 Months
                                  {currentDuration == "6months" && (
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
                                  onClick={() => (setCurrentDuration("1year"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  Last 1 Year
                                  {currentDuration == "1year" && (
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
                                  onClick={() => (setCurrentDuration("alltime"), showListedFilter(false))}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  All Time Data
                                  {currentDuration == "alltime" && (
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

                  <div>
                    <div className="flex flex-wrap justify-center align-middle h-[100%] w-[100%]">
                      <div className="chartCont">
                        <div className="titleChartLabel absolute top-0 flex justify-between w-[100%] px-8 py-4">
                          <p className="flex flex-col font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            Sales history
                          </p>
                          <p className=" font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            {currentDuration == "1day" && "Last 1 Day"}
                            {currentDuration == "7days" && "Last 7 Days"}
                            {currentDuration == "30days" && "Last 30 Days"}
                            {currentDuration == "6months" && "Last 6 Months"}
                            {currentDuration == "1year" && "Last 1 Year"}
                            {currentDuration == "alltime" && "All Time Data"}
                          </p>
                        </div>
                        {chartLoading ? (
                          <div
                            className="flex justify-center w-full h-[400px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                            style={{ alignItems: "center" }}
                          >
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </div>
                        ) : analytics.length != 0 || analytics == undefined ? (
                          <LineChart data={salesData} />
                        ) : (
                          <p className="flex flex-col font-display text-[25px] font-medium text-jacarta-500 dark:text-jacarta-200 py-[150px]">
                            No Data Available !
                          </p>
                        )}
                      </div>
                      <div className="chartCont">
                        <div className="titleChartLabel absolute top-0 flex justify-between w-[100%] px-8 py-4">
                          <p className="flex flex-col font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            Volume history
                          </p>
                          <p className=" font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            {currentDuration == "1day" && "Last 1 Day"}
                            {currentDuration == "7days" && "Last 7 Days"}
                            {currentDuration == "30days" && "Last 30 Days"}
                            {currentDuration == "6months" && "Last 6 Months"}
                            {currentDuration == "1year" && "Last 1 Year"}
                            {currentDuration == "alltime" && "All Time Data"}
                          </p>
                        </div>
                        {chartLoading ? (
                          <div
                            className="flex justify-center w-full h-[400px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                            style={{ alignItems: "center" }}
                          >
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </div>
                        ) : analytics.length != 0 || analytics == undefined ? (
                          <BarChart data={volumeData} />
                        ) : (
                          <p className="flex flex-col font-display text-[25px] font-medium text-jacarta-500 dark:text-jacarta-200 py-[150px]">
                            No Data Available !
                          </p>
                        )}
                      </div>
                      <div className="chartCont">
                        <div className="titleChartLabel absolute top-0 flex justify-between w-[100%] px-8 py-4">
                          <p className="flex flex-col font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            Listings History
                          </p>
                          <p className=" font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            {currentDuration == "1day" && "Last 1 Day"}
                            {currentDuration == "7days" && "Last 7 Days"}
                            {currentDuration == "30days" && "Last 30 Days"}
                            {currentDuration == "6months" && "Last 6 Months"}
                            {currentDuration == "1year" && "Last 1 Year"}
                            {currentDuration == "alltime" && "All Time Data"}
                          </p>
                        </div>
                        {chartLoading ? (
                          <div
                            className="flex justify-center w-full h-[400px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                            style={{ alignItems: "center" }}
                          >
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </div>
                        ) : analytics.length != 0 || analytics == undefined ? (
                          <LineChart data={listingData} />
                        ) : (
                          <p className="flex flex-col font-display text-[25px] font-medium text-jacarta-500 dark:text-jacarta-200 py-[150px]">
                            No Data Available !
                          </p>
                        )}
                      </div>

                      <div className="chartCont">
                        <div className="titleChartLabel absolute top-0 flex justify-between w-[100%] px-8 py-4">
                          <p className="flex flex-col font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            Floor Price
                          </p>
                          <p className=" font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            {currentDuration == "1day" && "Last 1 Day"}
                            {currentDuration == "7days" && "Last 7 Days"}
                            {currentDuration == "30days" && "Last 30 Days"}
                            {currentDuration == "6months" && "Last 6 Months"}
                            {currentDuration == "1year" && "Last 1 Year"}
                            {currentDuration == "alltime" && "All Time Data"}
                          </p>
                        </div>
                        {chartLoading ? (
                          <div
                            className="flex justify-center w-full h-[400px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                            style={{ alignItems: "center" }}
                          >
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </div>
                        ) : analytics.length != 0 || analytics == undefined ? (
                          <LineChart data={floorData} />
                        ) : (
                          <p className="flex flex-col font-display text-[25px] font-medium text-jacarta-500 dark:text-jacarta-200 py-[150px]">
                            No Data Available !
                          </p>
                        )}
                      </div>

                      <div className="chartCont">
                        <div className="titleChartLabel absolute top-0 flex justify-between w-[100%] px-8 py-4">
                          <p className="flex flex-col font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            Market Cap
                          </p>
                          <p className=" font-display text-base font-medium text-jacarta-500 dark:text-jacarta-200">
                            {currentDuration == "1day" && "Last 1 Day"}
                            {currentDuration == "7days" && "Last 7 Days"}
                            {currentDuration == "30days" && "Last 30 Days"}
                            {currentDuration == "6months" && "Last 6 Months"}
                            {currentDuration == "1year" && "Last 1 Year"}
                            {currentDuration == "alltime" && "All Time Data"}
                          </p>
                        </div>
                        {chartLoading ? (
                          <div
                            className="flex justify-center w-full h-[400px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                            style={{ alignItems: "center" }}
                          >
                            <div className="flex space-x-2">
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          </div>
                        ) : analytics.length != 0 || analytics == undefined ? (
                          <LineChart data={marketData} />
                        ) : (
                          <p className="flex flex-col font-display text-[25px] font-medium text-jacarta-500 dark:text-jacarta-200 py-[150px]">
                            No Data Available !
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* activity  */}
            {activityTab && (
              <div className="container">
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
                    )}
                    {mobileFilter && isBreakpoint && (
                      <button onClick={() => openMobileFilter(false)} className="absolute top-2 right-6 z-20">
                        <AiFillCloseCircle className="text-[30px] fill-jacarta-700 transition-colors group-hover:fill-white dark:fill-jacarta-100" />
                      </button>
                    )}
                    {mobileFilter && (
                      <div className="flex flex-wrap">
                        <button
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType(""))}
                          className={`${activityType == ""
                            ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                            : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                            }`}
                        >
                          <span className={`text-2xs font-medium  ${activityType == "" && "text-white"}`}>All</span>
                        </button>

                        <button
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType("list"))}
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
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType("cancel"))}
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
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType("sale"))}
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
                          <span className={`text-2xs font-medium ${activityType == "sale" && "text-white"}`}>Sale</span>
                        </button>

                        <button
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType("offer"))}
                          className={`${activityType == "offer"
                            ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                            : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                            }`}
                        >
                          <IoHandLeftOutline
                            className={`mr-2 h-4 w-4 ${activityType == "offer"
                              ? "text-white"
                              : "group-hover:text-white text-jacarta-700 text-jacarta-700 dark:text-white"
                              }`} />
                          <span className={`text-2xs font-medium ${activityType == "offer" && "text-white"}`}>Offer</span>
                        </button>

                        <button
                          onClick={() => (setSkipActivity(0), setHasMoreActivity(true), setActivityType("canceloffer"))}
                          className={`${activityType == "canceloffer"
                            ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                            : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                            }`}
                        >
                          <IoHandLeftOutline
                            className={`mr-2 h-4 w-4 ${activityType == "canceloffer"
                              ? "text-white"
                              : "group-hover:text-white text-jacarta-700 text-jacarta-700 dark:text-white"
                              }`} />
                          <span className={`text-2xs font-medium ${activityType == "canceloffer" && "text-white"}`}>Cancel Offer</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10">
                    {activity?.length >= 1 && (
                      <div className="flex justify-center align-middle flex-wrap">
                        <InfiniteScroll
                          dataLength={activity ? activity?.length : 0}
                          next={handleActivityScroll}
                          hasMore={hasMoreActivity}
                          className="flex flex-wrap justify-center align-middle"
                          loader={
                            <div className="flex items-center justify-center space-x-2">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          }
                        >
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
                              FromUser={e?.fromUser}
                              ToUser={e?.toUser}
                              signerAddress={signer_address}
                            />
                          ))}
                        </InfiniteScroll>
                      </div>
                    )}
                    ;
                    <div className="flex items-center justify-center space-x-2">
                      {activity?.length <= 0 && (
                        <h2 className="text-xl font-display font-thin text-jacarta-100 dark:text-jacarta-200">
                          No activity found!
                        </h2>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-center">
                  {activity === undefined && (
                    <h2 className="text-xl font-display font-thin text-jacarta-100 dark:text-jacarta-200">
                      No activities yet!
                    </h2>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* edit collection setting modal  */}
          {editModal &&
            <div className="editDisplayDiv">
              <form
                onSubmit={handle_submit}
                className="pb-8 dark:bg-jacarta-900 bg-white editDisplayForm"
              >
                <div className="editDisplayDivClose">
                  <button
                    onClick={() => (setAnyModalOpen(false), setEditModal(false))}
                    type="button"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      className="h-10 w-10 fill-jacarta-700 dark:fill-white mt-6 mr-6"
                    >
                      <path fill="none" d="M0 0h24v24H0z" />
                      <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z" />
                    </svg>
                  </button>
                </div>

                {collectionSettingUpdated &&
                  <div className="px-8 py-6 bg-green-400 text-white flex justify-between rounded">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-6" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"
                        />
                      </svg>
                      <p>Successfully updated the settings!</p>
                    </div>
                  </div>
                }

                <div className="container">
                  <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                    Collection settings ⚙️
                  </h1>
                  <div className="mx-auto max-w-[48.125rem]">
                    {/* <!-- Logo Upload --> */}
                    <div className="mb-6">
                      <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                        Logo (400x400)
                        <span className="text-red">*</span>
                      </label>
                      <p className="mb-3 text-2xs dark:text-jacarta-300">
                        Drag or choose your file to upload
                      </p>

                      {/* new input  */}
                      <div className="group relative flex max-w-sm max-h-[10px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                        {preview?.logo ? (
                          <img src={preview?.logo?.replace("ipfs://", "https://ipfs.io/ipfs/")} className="h-24 rounded-lg" />
                        ) : (
                          <div className="relative z-10 cursor-pointer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mb-4 inline-block fill-jacarta-500 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                            </svg>
                            <p className="mx-auto max-w-xs text-xs dark:text-jacarta-300">
                              JPG, PNG. Max size: 15 MB
                            </p>
                          </div>
                        )}
                        {!preview?.logo && (
                          <div className="absolute inset-4 cursor-pointer rounded bg-jacarta-50 opacity-0 group-hover:opacity-100 dark:bg-jacarta-600"></div>
                        )}

                        <input
                          onChange={(e) => {
                            if (!e.target.files[0]) return;
                            set_preview({
                              ...preview,
                              logo: URL.createObjectURL(e.target.files[0]),
                            });
                            set_data({ ...data, logo: e.target.files[0] });
                          }}
                          type="file"
                          name="logo"
                          accept="image/*,video/*"
                          id="file-upload"
                          className="absolute inset-0 z-20 cursor-pointer opacity-0"
                        />
                      </div>
                    </div>

                    {/* <!-- Cover Upload --> */}
                    <div className="mb-6">
                      <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                        Cover Image (1375x300)
                        <span className="text-red">*</span>
                      </label>
                      <p className="mb-3 text-2xs dark:text-jacarta-300">
                        Drag or choose your file to upload
                      </p>

                      <div className="group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                        {preview?.coverImage ? (
                          <img src={preview?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/")} className="h-44 rounded-lg " />
                        ) : (
                          <div className="relative z-10 cursor-pointer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 24 24"
                              width="24"
                              height="24"
                              className="mb-4 inline-block fill-jacarta-500 dark:fill-white"
                            >
                              <path fill="none" d="M0 0h24v24H0z" />
                              <path d="M16 13l6.964 4.062-2.973.85 2.125 3.681-1.732 1-2.125-3.68-2.223 2.15L16 13zm-2-7h2v2h5a1 1 0 0 1 1 1v4h-2v-3H10v10h4v2H9a1 1 0 0 1-1-1v-5H6v-2h2V9a1 1 0 0 1 1-1h5V6zM4 14v2H2v-2h2zm0-4v2H2v-2h2zm0-4v2H2V6h2zm0-4v2H2V2h2zm4 0v2H6V2h2zm4 0v2h-2V2h2zm4 0v2h-2V2h2z" />
                            </svg>
                            <p className="mx-auto max-w-xs text-xs dark:text-jacarta-300">
                              JPG, PNG, GIF, SVG. Max size: 40 MB
                            </p>
                          </div>
                        )}
                        {!preview?.coverImage && (
                          <div className="absolute inset-4 cursor-pointer rounded bg-jacarta-50 opacity-0 group-hover:opacity-100 dark:bg-jacarta-600"></div>
                        )}

                        <input
                          onChange={(e) => {
                            if (!e.target.files[0]) return;
                            set_preview({
                              ...preview,
                              coverImage: URL.createObjectURL(e.target.files[0]),
                            });
                            set_data({ ...data, coverImage: e.target.files[0] });
                          }}
                          type="file"
                          name="coverImage"
                          accept="image/*,video/*"
                          id="file-upload"
                          className="absolute inset-0 z-20 cursor-pointer opacity-0"
                        />
                      </div>
                    </div>

                    {/* <!-- Name --> */}
                    <div className="mb-6">
                      <label
                        htmlFor="item-name"
                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                      >
                        Collection Name<span className="text-red">*</span>
                      </label>
                      {adminAccount.includes(signer_address) ?
                        <input
                          onChange={handleChange}
                          type="text"
                          name="name"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          value={data?.name}
                        />
                        :
                        <input
                          type="text"
                          name="name"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          value={data?.name}
                          readOnly
                          disabled
                        />
                      }
                    </div>

                    {/* <!-- Description --> */}
                    <div className="mb-6">
                      <label
                        htmlFor="item-description"
                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                      >
                        Description
                        <span className="text-red">*</span>
                      </label>
                      <p className="mb-3 text-2xs dark:text-jacarta-300">
                        The description will be the collection description.
                      </p>
                      <textarea
                        onChange={handleChange}
                        name="description"
                        id="item-description"
                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                          ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                          : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                          } `}
                        rows="4"
                        required
                        placeholder="Provide a detailed description of your collection."
                        value={data?.description}
                      ></textarea>
                    </div>

                    {/* <!-- Category --> */}
                    <div className="mb-6">
                      <label
                        htmlFor="item-description"
                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                      >
                        Category
                      </label>
                      <p className="mb-3 text-2xs dark:text-jacarta-300">
                        select a suitable category for your collection
                      </p>
                      <select
                        name="Category"
                        onChange={handleChange}
                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                          ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                          : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                          } `}
                        defaultValue={data?.Category}
                      >
                        <option value={data?.Category}>
                          {data?.Category}
                        </option>
                        <option value={"Collectibles"}>
                          Collectibles
                        </option>
                        <option value={"Art"}>
                          Art
                        </option>
                        <option value={"Games"}>
                          Games
                        </option>
                        <option value={"Memes"}>
                          Memes
                        </option>
                        <option value={"Utility"}>
                          Utility
                        </option>
                      </select>
                    </div>

                    {/* royalty address  */}
                    <div className="mb-6">
                      <label
                        htmlFor="item-name"
                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                      >
                        Royalty Address<span className="text-red">*</span>
                      </label>
                      <p className="mb-3 text-2xs dark:text-jacarta-300">
                        Creator will get his royalty commissions on royalty address
                      </p>
                      <input
                        onChange={handleChange}
                        name="royaltyAddress"
                        type="text"
                        id="item-name"
                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                          ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                          : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                          } `}
                        placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580"
                        required
                        value={data?.royaltyAddress}
                      />
                    </div>

                    {/* website & twitter  */}
                    <div className="mb-6 flex justify-start flex-wrap">
                      <div className="w-[350px] m-3 mr-6">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Official Website
                        </label>
                        <input
                          onChange={handleChange}
                          name="website"
                          type="text"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          placeholder="Enter website URL"
                          value={data?.website}
                        />
                      </div>
                      <div className="w-[350px] m-3">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Official Twitter
                        </label>
                        <input
                          onChange={handleChange}
                          name="twitter"
                          type="text"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          placeholder="Enter twitter URL"
                          value={data?.twitter}
                        />
                      </div>
                    </div>

                    {/* discord & telegram */}
                    <div className="mb-6 flex justify-start flex-wrap">
                      <div className="w-[350px] m-3 mr-6">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Official Discord
                        </label>
                        <input
                          onChange={handleChange}
                          name="discord"
                          type="text"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          placeholder="Enter discord URL"
                          value={data?.discord}
                          required
                        />
                      </div>
                      <div className="w-[350px] m-3">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Official Telegram
                        </label>
                        <input
                          onChange={handleChange}
                          name="telegram"
                          type="text"
                          id="item-name"
                          className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                            } `}
                          placeholder="Enter telegram URL"
                          value={data?.telegram}
                        />
                      </div>
                    </div>

                    {/* trading and feature  */}
                    <div className="mb-6 flex justify-start flex-wrap">
                      <div className=" m-3 mr-12">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Enable Trading
                        </label>
                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                          If checked trading will be enabled instantly
                        </p>
                        <input type="checkbox" name="isTrading" value={data?.isTrading} checked={data?.isTrading} onChange={handleCheckChange} />
                      </div>
                      <div className=" m-3">
                        <label
                          htmlFor="item-name"
                          className="mb-2 block font-display text-jacarta-700 dark:text-white"
                        >
                          Enable Properties Filter
                        </label>
                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                          If checked properties filter will be displayed
                        </p>
                        <input type="checkbox" name="isPropsEnabled" value={data?.isPropsEnabled} checked={data?.isPropsEnabled} onChange={handleCheckChange} />
                      </div>
                    </div>

                    {/* status and props  */}
                    {adminAccount.includes(signer_address) &&
                      (<div className="mb-6 flex justify-start flex-wrap">
                        <div className=" m-3 mr-12">
                          <label
                            htmlFor="item-name"
                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                          >
                            Verify collection
                          </label>
                          <input type="checkbox" name="isVerified" value={data?.isVerified} checked={data?.isVerified} onChange={handleCheckChange} />
                        </div>
                        <div className=" m-3">
                          <label
                            htmlFor="item-name"
                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                          >
                            Feature collection ?
                          </label>
                          <input type="checkbox" name="isFeatured" value={data?.isFeatured} checked={data?.isFeatured} onChange={handleCheckChange} />
                        </div>
                        <div className=" m-3">
                          <label
                            htmlFor="item-name"
                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                          >
                            is NSFW ?
                          </label>
                          <input type="checkbox" name="isNSFW" value={data?.isNSFW} checked={data?.isNSFW} onChange={handleCheckChange} />
                        </div>
                      </div>)
                    }

                    {/* <!-- Submit nft form --> */}
                    <button
                      type="submit"
                      className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white transition-all cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>
                </div>
              </form>
            </div>
          }

          {/* propertyModal  */}
          {
            propertyModal && (
              <div className="propertyDisplayDiv">
                <div className="modal-dialog max-w-md">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h5 className="modal-title" id="propertiesModalLabel">
                        Properties
                      </h5>
                      <button
                        onClick={() => (setAnyModalOpen(false), setPropertyModal(false))}
                        type="button"
                        className="btn-close"
                        data-bs-dismiss="modal"
                        aria-label="Close"
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

                    <div className="modal-body">
                      {propLoading ? (
                        <div
                          className="flex justify-center w-full h-[200px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                          style={{ alignItems: "center" }}
                        >
                          <div className="flex space-x-2">
                            <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                            <div className="w-3 h-3 rounded-full animate-pulse dark:bg-violet-400"></div>
                          </div>
                        </div>
                      ) : (
                        <div className="accordion" id="accordionProps">
                          {property_traits == "" ? (
                            <div
                              className="flex justify-center w-full h-[200px] rounded-xl px-5 py-2 text-left font-display text-sm transition-colors dark:text-white"
                              style={{ alignItems: "center" }}
                            >
                              <h5 className="modal-title" id="propertiesModalLabel">
                                No Traits Found!
                              </h5>
                            </div>
                          ) : (
                            <PropertyModal
                              property_traits={property_traits}
                              propsFilter={propsFilter}
                              setPropsFilter={setPropsFilter}
                              setDefaultFilterFetch={setDefaultFilterFetch}
                            />
                          )}
                        </div>
                      )}
                    </div>

                    <div className="modal-footer">
                      {property_traits == "" ? (
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => (setAnyModalOpen(false), setPropertyModal(false))}
                            className="w-36 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            Close
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center space-x-4">
                          <button
                            onClick={() => (
                              setPropsFilter([]), setSkip(0), setAnyModalOpen(false), setPropertyModal(false)
                            )}
                            className="w-36 rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                          >
                            Clear All
                          </button>
                          <button
                            onClick={() => (
                              setDefaultFilterFetch(true), setSkip(0), setAnyModalOpen(false), setPropertyModal(false)
                            )}
                            className="w-36 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          }

          {/* buy modal  */}
          {
            buyModal && (
              <BuyModal
                formSubmit={buy_NFT_}
                setBuyModal={setBuyModal}
                setAnyModalOpen={setAnyModalOpen}
                NFTImage={selectedNFT?.nft_image}
                NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
                NFTCollectionName={selectedNFT?.NFTCollection?.name}
                CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
                collectionTrading={selectedNFT?.NFTCollection?.isTrading}
                NFTName={selectedNFT?.name}
                NFTListingPrice={selectedNFT?.listingPrice}
                actionLoad={actionLoad}
              />
            )
          }

          {/* cancel modal  */}
          {
            cancelModal && (
              <CancelModal
                formSubmit={cancelNFT}
                setCancelModal={setCancelModal}
                setAnyModalOpen={setAnyModalOpen}
                NFTImage={selectedNFT?.nft_image}
                NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
                NFTCollectionName={selectedNFT?.NFTCollection?.name}
                CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
                collectionTrading={selectedNFT?.NFTCollection?.isTrading}
                NFTName={selectedNFT?.name}
                actionLoad={actionLoad}
              />
            )
          }

          {/* success modal  */}
          {
            successModal && (
              <SuccessModal
                setSuccessModal={setSuccessModal}
                setAnyModalOpen={setAnyModalOpen}
                onCloseFunctionCall={fetch_nfts_success}
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
            )
          }
        </div >
      )
      }
    </div >
  );
};

export default Collection;
