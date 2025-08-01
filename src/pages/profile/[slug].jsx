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
import { buy_nft, cancel_listing, directSell_nft_info, get_nft_by_address, loadNFTs_user, loadNFTs_user_RPC } from "../../utils/user_nft";
import { BsArrowUpRight, BsChevronDown, BsDiscord, BsFillExclamationCircleFill, BsTwitter } from "react-icons/bs";
import { TfiWorld } from "react-icons/tfi";
import { check_user } from "../../utils/mongo_api/user/user";
import ActivityRecord from "../../components/cards/ActivityRecord";
import InfiniteScroll from "react-infinite-scroll-component";
import { getActivity } from "../../utils/mongo_api/activity/activity";
import { addNFTViaOnchainLaunchpad, fetch_user_listed_nfts, no_limit_fetch_nfts, refreshNFTsViaOnchainRollProfile, refreshUserNFTs } from "../../utils/mongo_api/nfts/nfts";
import CancelModal from "../../components/modals/CancelModal";
import { AiFillCloseCircle, AiFillFilter } from "react-icons/ai";
import moment from "moment";
import SuccessModal from "../../components/modals/SuccessModal";
import BuyModal from "../../components/modals/BuyModal";

import { TonClientContext } from "../../context/tonclient";
import { search_collections, search_user_nfts } from "../../utils/mongo_api/search";
import { get_collections, get_user_collections } from "../../utils/mongo_api/collection/collection";
import { IoHandLeftOutline } from "react-icons/io5";
import axios from "axios";
import { RxCrossCircled } from "react-icons/rx";
import { MdVerified } from "react-icons/md";

const Profile = ({
  theme,
  signer_address,
  blockURL,
  webURL,
  copyURL,
  setAnyModalOpen,
  venomProvider,
  cartNFTs,
  setCartNFTs,
  vnmBalance,
  EnableNFTCancel,
  EnableNFTSale,
  profileDataProps,
  OtherImagesBaseURI,
  NFTImagesBaseURI,
  NFTImageToReplaceURIs,
  adminAccount,
  EnableMakeOffer
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
  const [fetchedUserCollections, setFetchedUserCollections] = useState(false);
  const [fetchedOnSaleNFTs, setFetchedOnSaleNFTs] = useState(false);
  const [fetchedOwnedNFTs, setFetchedOwnedNFTs] = useState(false);
  const [moreLoading, setMoreLoading] = useState(false);
  const [userPurchases, setUserPurchases] = useState(true);
  const [mobileFilter, openMobileFilter] = useState(true);
  const [defaultFilterFetch, setDefaultFilterFetch] = useState(false);

  const [priceRangeFilter, showPriceRangeFilter] = useState(false);
  const [saleTypeFilter, showSaleTypeFilter] = useState(false);
  const [listedFilter, showListedFilter] = useState(false);
  const [filterCollection, setFilterCollection] = useState("");
  const [onChainFilterNFT, setOnChainFilterNFT] = useState("newestFirst");
  const [currentFilter, setCurrentFilter] = useState("recentlyListed");
  const [saleType, setSaleType] = useState("All");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(0);

  const [lastNFT, setLastNFT] = useState(undefined);
  const [collections_inp, set_collections] = useState([]);
  const [collectionSearchINP, setCollectionSearchINP] = useState("");

  const [activitySkip, setActivitySkip] = useState(0);
  const [collectionSkip, setCollectionSkip] = useState(0);
  const [skip, setSkip] = useState(0);
  const [hasMoreActivity, setHasMoreActivity] = useState(true);
  const [hasMoreCollections, setHasMoreCollections] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  const [activityType, setActivityType] = useState("");
  const [onSaleNFTs, setOnSaleNFTs] = useState([]);
  const [nfts, set_nfts] = useState([]);
  const [fetchedOnchainNFTs, setFetchedOnchainNFTs] = useState([]);
  const [NFTCollections, setNFTCollections] = useState([]);
  const [activityRecords, setActivityRecords] = useState([]);

  const [searchLoading, setSearchLoading] = useState(false);
  const [query_search, set_query_search] = useState("");
  const [query_search_collection, set_query_search_collection] = useState("");
  const [isTyping, set_isTyping] = useState(true);
  const [isTypingCollection, set_isTypingCollection] = useState(true);
  const [def_query, set_def_query] = useState(undefined);
  const [def_query_collection, set_def_query_collection] = useState(undefined);

  const [actionLoad, setActionLoad] = useState(false);
  const [selectedNFT, setSelectedNFT] = useState("");
  const [cancelModal, setCancelModal] = useState(false);
  const [buyModal, setBuyModal] = useState(false);
  const [successModal, setSuccessModal] = useState(false);
  const [transactionType, setTransactionType] = useState("");

  const [BlukAdditionLastNFT, setBlukAdditionLastNFT] = useState(undefined);
  const [LandLoadLastNFT, setLandLoadLastNFT] = useState(undefined);
  const [adminPermittedAction, setAdminPermittedAction] = useState(false);

  const [collectionLoading, setCollectionLoading] = useState(false);
  const [searchedCollectionBefore, setSearchedCollectionBefore] = useState(false);
  const [collectionFilter, openCollectionFilter] = useState(false);

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

  // fetching user data
  const getProfileData = async () => {
    set_loading(true);
    if (!slug) return;
    const data = await check_user(slug);
    // const nftFetch = await fetch_user_nfts();
    const nftFetch = await getting_user_listed_nfts();
    if (data) {
      set_user_data(data?.data);
    }
    set_loading(false);
  };

  // fetching user activity
  const fetch_user_activity = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const res = await getActivity(user_data._id, user_data.wallet_id, "", "", activityType, activitySkip);
    if (res) {
      setActivityRecords(res);
      if (res == "" || res == undefined) {
        setHasMoreActivity(false);
      }
    }
    setFetchedProfileActivity(true);
    setMoreLoading(false);
  };

  // getting user collections
  const getting_user_collections = async () => {
    if (!slug) return;
    setMoreLoading(true);
    const res = await get_user_collections(slug, collectionSkip);
    if (res) {
      setNFTCollections(res);
      if (res == "" || res == undefined) {
        setHasMoreCollections(false);
      }
    }
    setFetchedUserCollections(true);
    setMoreLoading(false);
  };

  // scroll user collections
  const scrollCollectionFetch = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const res = await get_user_collections(slug, collectionSkip);
    if (res) {
      setNFTCollections([...NFTCollections, ...res]);
      if (res == "" || res == undefined) {
        setHasMoreCollections(false);
      }
    }
    setFetchedUserCollections(true);
    setMoreLoading(false);
  };

  const handleCollectionScroll = () => {
    setCollectionSkip(NFTCollections?.length);
  };

  // getting on sale nfts
  const getting_user_listed_nfts = async () => {
    if (!slug) return;
    setMoreLoading(true);
    const res = await fetch_user_listed_nfts(filterCollection, slug, saleType, currentFilter, minPrice, maxPrice, skip);
    if (res) {
      setOnSaleNFTs(res);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setFetchedOnSaleNFTs(true);
    setMoreLoading(false);
  };

  // clear price filter
  const clear_user_listed_nfts = async () => {
    if (!slug) return;
    setMoreLoading(true);
    const res = await fetch_user_listed_nfts(filterCollection, slug, saleType, currentFilter, 0, 0, skip);
    if (res) {
      setOnSaleNFTs(res);
      if (res == "" || res == undefined) {
        setHasMore(false);
      }
    }
    setFetchedOnSaleNFTs(true);
    setMoreLoading(false);
  };

  const { client } = useContext(TonClientContext);

  // getting owned nfts
  const fetch_user_nfts = async () => {
    if (!venomProvider) return;
    setMoreLoading(true);
    // fetch using RPC
    const res = await loadNFTs_user_RPC(venomProvider, slug, lastNFT);
    // fetch using GRAPHQL
    // const res = await loadNFTs_user(
    //   venomProvider,
    //   slug,
    //   lastNFT,
    //   client,
    //   onChainFilterNFT
    // );
    let new_nfts = [...nfts];
    res?.nfts
      .map((e, index) => {
        try {
          new_nfts.push({ ...JSON.parse(e.json), ...e });
        } catch (error) {
          new_nfts.push({ ...e });
        }
      });
    setLastNFT(res?.continuation);
    setFetchedOwnedNFTs(true);
    set_nfts(new_nfts);
    setMoreLoading(false);
  };

  // refreshing user latest nfts onchain 
  // const refresh_user_nfts = async () => {
  //   if (!venomProvider && !client) return;
  //   set_loading(true);
  //   const res = await loadNFTs_user(
  //     venomProvider,
  //     signer_address,
  //     undefined,
  //     client,
  //     "newestFirst"
  //   );
  //   let new_nfts = [];
  //   res?.nfts
  //     .map((e, index) => {
  //       try {
  //         new_nfts.push({ ...JSON.parse(e.json), ...e });
  //       } catch (error) {
  //         new_nfts.push({ ...e });
  //       }
  //     });
  //   if (new_nfts != "") {
  //     try {
  //       const mappingNFTs = await Promise.all(new_nfts.map(async (nft) => {
  //         let jsonURL = nft?.files[0].source;
  //         try {
  //           const JSONReq = await axios.get(jsonURL);
  //           let attributes = JSONReq?.data?.attributes;
  //           const createdNFT = await refreshUserNFTs(nft, attributes, signer_address);
  //           alert("your profile has been refreshed with all the latest NFTs");
  //           router.reload();
  //         } catch (error) {
  //           console.log(error);
  //         }
  //       }));
  //     } catch (error) {
  //       console.error('Error adding NFTs to the database:', error);
  //       throw error;
  //     }
  //   }
  // };

  // function which loads onchain nfts on user landing
  const onLandLoadOnchainNFTs = async () => {
    if (!venomProvider) return;
    if (filterCollection != "") return;
    setMoreLoading(true);
    try {
      // fetching using RPC
      const res = await loadNFTs_user_RPC(venomProvider, slug, LandLoadLastNFT);
      if (!res || !res.nfts.length) {
        return;
      }
      let new_nfts = [...nfts];
      res?.nfts
        .map((e, index) => {
          try {
            new_nfts.push({ ...JSON.parse(e.json), ...e });
          } catch (error) {
            new_nfts.push({ ...e });
          }
        });

      let offChainArray = onSaleNFTs;
      let onChainArray = new_nfts;

      // Filter out repeating addresses from offChainArray.NFTAddress and save them in newArray
      let newArray = onChainArray.filter(onChainItem => {
        return !offChainArray.some(offChainItem => {
          return onChainItem.nft?._address === offChainItem.NFTAddress;
        });
      });

      setFetchedOnchainNFTs([...fetchedOnchainNFTs, ...newArray]);
      setLandLoadLastNFT(res?.continuation);
      setMoreLoading(false);
    } catch (error) {
      console.error('Error fetching or adding NFTs to the database:', error);
    }
  };

  // admin function to initiate NFT addition to DB 
  const fetchAndAddNFTsToDB = async () => {
    if (adminPermittedAction === false && !venomProvider) return;
    try {
      // fetching using RPC
      const res = await loadNFTs_user_RPC(venomProvider, slug, BlukAdditionLastNFT);
      if (!res || !res.nfts.length) {
        alert("This feature currently does not works on venom wallet browser, please use another browser!");
        return;
      }
      await addNFTsToDB(res.nfts);
      setBlukAdditionLastNFT(res?.continuation);
      // setSkip(0);
      // const nftFetch = await getting_user_listed_nfts();
      const nftFetch = await fetch_user_listed_nfts(filterCollection, slug, saleType, currentFilter, minPrice, maxPrice, 0);
      if (nftFetch) {
        setOnSaleNFTs(nftFetch);
        if (nftFetch == "" || nftFetch == undefined) {
          setHasMore(false);
        }
      }
      // alert("your profile has been refreshed with all the latest NFTs, refresh the page to view the NFTs");
      set_loading(false);
    } catch (error) {
      console.error('Error fetching or adding NFTs to the database:', error);
    }
  };

  // updating nfts to DB 
  const addNFTsToDB = async (nfts) => {
    try {
      const mappingNFTs = await Promise.all(nfts.map(async (nft) => {
        try {
          // parsing json 
          const parsedJSON = JSON.parse(nft?.json);
          let nftName = parsedJSON?.name;
          let nftDesc = parsedJSON?.description;
          let nftImage = parsedJSON?.preview?.source;

          // fetching attributes 
          let attributes = [];
          let jsonURL = parsedJSON?.files[0].source;
          let jsonMimeType = parsedJSON?.files[0].mimetype;
          if (jsonMimeType == "metadata/json") {
            let JSONReq;
            let newJSONURL = jsonURL.replace("https://ipfs.io/ipfs", "https://ipfs.venomart.io/ipfs");
            try {
              JSONReq = await axios.get(newJSONURL);
            } catch (error) {
              JSONReq = await axios.get(jsonURL);
            }
            attributes = JSONReq?.data?.attributes;
          }
          const createdNFT = await refreshUserNFTs(nft, nftName, nftDesc, nftImage, jsonURL, attributes, signer_address);
          return createdNFT;
        } catch (error) {
          console.log(error);
        }
      }));
    } catch (error) {
      console.error('Error adding NFTs to the database:', error);
      throw error;
    }
  };

  // loop refresh metadata for every NFT
  const loopRefreshMetadata = async () => {
    set_loading(true);
    const profile_nfts = await no_limit_fetch_nfts(slug);
    for (const profile_nft of profile_nfts) {
      let nft_onchain = await get_nft_by_address(venomProvider, profile_nft?.NFTAddress);
      let onChainNFTData = await directSell_nft_info(venomProvider, nft_onchain?.manager?._address);
      const onChainDemandPrice = onChainNFTData?.value5 / 1000000000;

      let update_nft = await refreshNFTsViaOnchainRollProfile(profile_nft?.NFTAddress, nft_onchain?.owner?._address, nft_onchain?.manager?._address, onChainDemandPrice);
    }
    setAdminPermittedAction(true);
    set_loading(false);
  }

  // handling for sale nfts more fetch
  const scroll_get_all_nfts = async () => {
    if (user_data._id == undefined) return;
    setMoreLoading(true);
    const res = await fetch_user_listed_nfts(filterCollection, slug, saleType, currentFilter, minPrice, maxPrice, skip);
    if (res) {
      setOnSaleNFTs([...onSaleNFTs, ...res]);
      if (res == "" || res == undefined) {
        setHasMore(false);
        onLandLoadOnchainNFTs();
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
    const newArray = await getActivity(user_data._id, user_data.wallet_id, "", "", activityType, activitySkip);
    if (newArray) {
      setActivityRecords([...activityRecords, ...newArray]);
      if (newArray == "" || newArray == undefined) {
        setHasMoreActivity(false);
      }
    }
    setMoreLoading(false);
  };

  const handleActivityScroll = () => {
    setActivitySkip(activityRecords.length);
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


  const fetch_search_collections = async () => {
    if (searchedCollectionBefore == true) return;
    setCollectionLoading(true);
    const res = await get_collections("All", "topVolume", "verified", 0);
    if (res) {
      set_collections(res);
    }
    setCollectionLoading(false);
  };

  // collectionSearch 
  const handle_search_collection = async (data) => {
    setCollectionLoading(true);
    set_query_search_collection(data);
    set_isTypingCollection(true);
    set_def_query_collection("");
  };

  // handling search
  const handle_search = async data => {
    setSearchLoading(true);
    set_query_search(data);
    set_isTyping(true);
    set_def_query("");
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

  // useEffect to trigger the fetching and adding of NFTs after BlukAdditionLastNFT is updated
  useEffect(() => {
    if (adminPermittedAction) {
      set_loading(true);
      fetchAndAddNFTsToDB();
    }
  }, [adminPermittedAction]);

  useEffect(() => {
    if (BlukAdditionLastNFT == undefined) {
      return;
    }
    set_loading(true);
    const fetchData = async () => {
      await fetchAndAddNFTsToDB();
      await new Promise((resolve) => setTimeout(resolve, 1000));
    };
    fetchData();
  }, [BlukAdditionLastNFT]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTyping(false);
      if (isTyping || def_query == undefined) return;
      setSearchLoading(true);
      const res = await search_user_nfts(query_search, slug);
      if (res) {
        setOnSaleNFTs(res?.nfts);
        if (res?.nfts == "" || res?.nfts == undefined) {
          setHasMore(false);
        }
      }
      set_isTyping(false);
      setSearchLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTyping]);

  // collectionIsType 
  useEffect(() => {
    const timer = setTimeout(async () => {
      set_isTypingCollection(false);
      if (isTypingCollection || def_query_collection == undefined) return;
      setCollectionLoading(true);
      const res = await search_collections(query_search_collection);
      if (res) {
        set_collections(res.collections);
      }
      set_isTypingCollection(false);
      setCollectionLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [isTypingCollection]);

  // useEffect(() => {
  //   onLandLoadOnchainNFTs();
  // }, [hasMore, venomProvider]);

  useEffect(() => {
    if (!slug) return;
    getProfileData();
  }, [slug]);

  useEffect(() => {
    scrollActivityFetch();
  }, [activitySkip]);

  useEffect(() => {
    scrollCollectionFetch();
  }, [collectionSkip]);

  useEffect(() => {
    scroll_get_all_nfts();
  }, [skip]);

  useEffect(() => {
    if (defaultFilterFetch == false) return;
    getting_user_listed_nfts();
  }, [saleType, currentFilter, filterCollection]);

  useEffect(() => {
    fetch_user_activity();
  }, [activityType]);

  useEffect(() => {
    if (fetchedOwnedNFTs == false) return;
    fetch_user_nfts();
  }, [onChainFilterNFT]);

  useEffect(() => {
    if (collectionFilter || listedFilter || saleTypeFilter || priceRangeFilter) {
      document.body.addEventListener("click", () => {
        openCollectionFilter(false);
        showListedFilter(false);
        showSaleTypeFilter(false);
        showPriceRangeFilter(false);
      });
    }
  }, [collectionFilter, listedFilter, saleTypeFilter, priceRangeFilter]);

  return loading ? (
    <Loader theme={theme} />
  ) : (
    <div className={`${theme} w-[100%] dark:bg-jacarta-900`}>
      {cancelModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {buyModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      {successModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

      <Head>
        <title>{`${profileDataProps[0]?.user_name ? profileDataProps[0]?.user_name : "User Profile"}`} - Venomart Marketplace</title>
        <meta
          name="description"
          content="Explore users profile, their NFTs, collections and listings | Powered by Venomart"
        />
        <meta
          name="keywords"
          content={`venomart, ${profileDataProps[0]?.user_name} profile on venomart, ${profileDataProps[0]?.user_name} venomart, ${slug} `}
        />
        <meta property="og:title" content={`${profileDataProps[0]?.user_name ? profileDataProps[0]?.user_name : "Profile"} - Venomart Marketplace`} />
        <meta property="og:description" content={`${profileDataProps[0]?.bio ? profileDataProps[0]?.bio : "Explore users profile, their NFTs, collections and listings | Powered by Venomart"}`} />
        <meta property="og:image" content={`${profileDataProps[0]?.profileImage ? profileDataProps[0]?.profileImage?.replace("ipfs://", OtherImagesBaseURI) : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"}`} />
        <meta property="og:url" content={"https://venomart.io/"} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Venomart - NFT Marketplace on Venom" />
        <meta name="twitter:description" content={`${profileDataProps[0]?.bio ? profileDataProps[0]?.bio : "Explore users profile, their NFTs, collections and listings | Powered by Venomart"}`} />
        <meta name="twitter:image" content={`${profileDataProps[0]?.profileImage ? profileDataProps[0]?.profileImage?.replace("ipfs://", OtherImagesBaseURI) : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"}`} />
        <meta name="twitter:site" content="@venomart23" />
        <meta name="twitter:creator" content="@venomart23" />
        <meta name="robots" content="INDEX,FOLLOW" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/fav.webp" />
      </Head>
      {/* <!-- Banner IMG--> */}
      <div className="relative pt-24 dark:bg-jacarta-900">
        <Image
          src={user_data?.coverImage?.replace("ipfs://", OtherImagesBaseURI) || defBack}
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
            {user_data?.profileImage?.includes(".mp4") ? (
              <video
                style={{
                  objectFit: "cover",
                }}
                className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[130px] object-cover"
                autoPlay="autoplay"
                loop="true"
              >
                <source
                  src={user_data?.profileImage?.replace("ipfs://", OtherImagesBaseURI)}
                  type="video/mp4"
                ></source>
              </video>
            ) : (
              <Image
                src={user_data?.profileImage?.replace("ipfs://", OtherImagesBaseURI) || defLogo}
                alt="collection avatar"
                height={100}
                width={100}
                className="rounded-xl border-[5px] border-white dark:border-jacarta-600 h-[130px] w-[130px] object-cover"
              />
            )}
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
                onClick={() => window.open(`${blockURL}` + `accounts/` + `${slug}`, "_blank")}
              />
            </div>

            {/* bio  */}
            <p className="mx-auto max-w-xl text-lg dark:text-jacarta-300 mb-6">{user_data?.bio}</p>

            {/* join date */}
            {user_data?.createdAt && (
              <p className="mx-auto max-w-xl text-[16px] dark:text-jacarta-400 mb-6">Joined on {formattedDate}</p>
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
                    <a href={user_data?.socials[1]} target="_blank" className="group mr-4">
                      <BsDiscord className="h-5 w-5 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                    </a>
                  )}
                  {user_data?.socials[2] && (
                    <a href={user_data?.socials[2]} target="_blank" className="group">
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
            onClick={() => (!fetchedOnSaleNFTs && getting_user_listed_nfts(), switchToOnSale())}
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
              <span className="font-display text-base font-medium">Items</span>
            </button>
          </li>
          {/* owned button  */}
          {nfts != "" &&
            <li
              className="nav-item"
              role="presentation"
              onClick={() => (nfts.length == 0 && fetch_user_nfts(), switchToOwned())}
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
                <span className="font-display text-base font-medium">Owned (Onchain)</span>
              </button>
            </li>
          }

          {/* my collections button  */}
          {/* <li
            className="nav-item"
            role="presentation"
            onClick={() => (!fetchedUserCollections && getting_user_collections(), switchToCollections())}
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
              <span className="font-display text-base font-medium">Collections</span>
            </button>
          </li> */}
          <li
            className="nav-item"
            role="presentation"
            onClick={() => (!fetchedProfileActivity && fetch_user_activity(), switchToActivity())}
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
              <span className="font-display text-base font-medium">Activity</span>
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
                <div className="flex justify-center mt-[-32px] align-middle text-center">
                  <p className="text-lg dark:text-jacarta-200 pb-8 text-center">Total Portfolio Value: <span className="font-bold">{user_data?.portfolioValue && ((user_data?.portfolioValue).toFixed(2))} $VENOM</span></p>
                </div>
                {((adminAccount.includes(signer_address)) || (slug == signer_address)) && (
                  <div className="flex justify-center mt-[-42px] align-middle text-center">
                    <p className={`text-[17px] font-mono text-jacarta-700 dark:text-white m-4`}><span className="text-blue cursor-pointer" onClick={() => (loopRefreshMetadata())}>refresh profile ↻</span></p>
                  </div>
                )}
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

                          {/* collections filter  */}
                          <div className="typeModelMainDiv relative my-1 mr-2.5">
                            <button
                              className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                              onClick={(e) => (e.stopPropagation(), fetch_search_collections(), setSearchedCollectionBefore(true), showListedFilter(false), showSaleTypeFilter(false), showPriceRangeFilter(false), openCollectionFilter(!collectionFilter))}
                            >
                              <span className=" text-jacarta-700 dark:text-white">All Collections</span>
                              <BsChevronDown className="h-[15px] w-[15px] ml-4 text-jacarta-700 dark:text-white" />
                            </button>

                            {collectionFilter && (
                              <div onClick={(e) => e.stopPropagation()} className="modelTypePosition dropdown-menu z-10 min-w-[220px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-700">
                                <form
                                  action="search"
                                  className="flex justify-center align-middle relative w-[100%]"
                                  onSubmit={(e) => e.preventDefault()}
                                >
                                  <input
                                    type="search"
                                    defaultValue={collectionSearchINP}
                                    onChange={(e) => handle_search_collection(e.target.value)}
                                    className="w-[90%] h-[38px] rounded-xl border border-jacarta-100 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
                                    style={{ paddingLeft: "27px", paddingRight: "30px" }}
                                    placeholder="search"
                                  />
                                  <span className="searchCollectionSvg absolute left-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
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
                                  {collectionSearchINP != "" && (
                                    <span className="absolute right-0 top-0 flex h-full w-12 items-center justify-center rounded-2xl">
                                      <RxCrossCircled
                                        onClick={() => (
                                          handle_search_collection(""),
                                          setCollectionSearchINP(""),
                                          setFilterCollection("")
                                        )}
                                        className="h-5 w-5 text-jacarta-500 dark:text-white cursor-pointer"
                                      />
                                    </span>
                                  )}
                                </form>

                                <ul className="collectionFilterDivWebkit flex flex-col h-[300px] overflow-y-scroll mt-2">
                                  {/* loop here  */}
                                  {!collectionLoading &&
                                    (collections_inp?.map((e, index) => {
                                      return (
                                        <li key={index} onClick={() => (setSkip(0), setHasMore(true), setDefaultFilterFetch(true), setFilterCollection(e?._id), setCollectionSearchINP(e?.name))}>
                                          <Link href="#" className="dropdown-item flex w-full items-center rounded-xl px-5 py-2 text-left font-display text-sm` transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600">
                                            <span className="relative text-jacarta-700 dark:text-white">
                                              <Image
                                                src={e?.logo.replace("ipfs://", OtherImagesBaseURI)}
                                                height={100}
                                                width={100}
                                                alt={e?.name}
                                                className="h-[30px] w-[30px] rounded-[50%]"
                                              />
                                              {e?.isVerified ?
                                                <MdVerified style={{ color: "#4f87ff", position: "absolute", bottom: "-3px", right: "-4px" }}
                                                  size={14} />
                                                :
                                                <BsFillExclamationCircleFill style={{ color: "#c3c944", position: "absolute", bottom: "-3px", right: "-4px" }}
                                                  size={13} />
                                              }
                                            </span>
                                            <span className="text-[13px] ml-[6px] font-normal text-jacarta-700 dark:text-white" style={{
                                              width: "150px",
                                              whiteSpace: "nowrap",
                                              textOverflow: "ellipsis",
                                              overflow: "hidden",
                                            }}>
                                              {e?.name}
                                            </span>
                                          </Link>
                                        </li>
                                      )
                                    }))}

                                  {collectionLoading &&
                                    <div className="flex items-center justify-center space-x-2 mt-4">
                                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                      <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                                    </div>
                                  }
                                  {collections_inp.length <= 0 && !collectionLoading &&
                                    <div className="flex items-center justify-center space-x-2 mt-4">
                                      <p className=" text-jacarta-700 dark:text-white">No collections found!</p>
                                    </div>
                                  }
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* sale type  */}
                          <div className="typeModelMainDiv relative my-1 mr-2.5">
                            <button
                              onClick={e => (
                                e.stopPropagation(),
                                showListedFilter(false),
                                showPriceRangeFilter(false),
                                openCollectionFilter(false),
                                showSaleTypeFilter(!saleTypeFilter)
                              )}
                              className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            >
                              <div className="flex justify-center align-middle">
                                {saleType == "All" && (
                                  <span className="text-jacarta-700 dark:text-white">⚡️ All NFTs </span>
                                )}
                                {saleType == "listed" && (
                                  <span className="text-jacarta-700 dark:text-white">💰 Fixed Price</span>
                                )}
                                {saleType == "notlisted" && (
                                  <span className="text-jacarta-700 dark:text-white">❌ Not For Sale</span>
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
                                onClick={e => e.stopPropagation()}
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
                                      <span className="text-jacarta-700 dark:text-white">⚡️ All NFTs</span>
                                      {saleType == "All" && (
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
                                      onClick={() => (
                                        setDefaultFilterFetch(true),
                                        setSkip(0),
                                        setHasMore(true),
                                        setMinPrice(0),
                                        setMaxPrice(0),
                                        setSaleType("listed"),
                                        showSaleTypeFilter(false)
                                      )}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">💰 Fixed Price</span>
                                      {saleType == "listed" && (
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
                                      onClick={() => (
                                        setDefaultFilterFetch(true),
                                        setSkip(0),
                                        setHasMore(true),
                                        setMinPrice(0),
                                        setMaxPrice(0),
                                        setSaleType("notlisted"),
                                        showSaleTypeFilter(false)
                                      )}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">❌ Not for sale</span>
                                      {saleType == "notlisted" && (
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
                                      onClick={() => (nfts.length == 0 && fetch_user_nfts(), switchToOwned())}
                                      className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                    >
                                      <span className="text-jacarta-700 dark:text-white">🌐 Agrregate Onchain</span>
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
                                setDefaultFilterFetch(true),
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
                                      setDefaultFilterFetch(true),
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
                                      clear_user_listed_nfts(),
                                      showPriceRangeFilter(false)
                                    )}
                                    className="flex-1 rounded-full bg-white py-2 px-6 text-center text-sm font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                  >
                                    Clear
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => (
                                      setDefaultFilterFetch(true),
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

                          {/* recently listed  */}
                          <div className="typeModelMainDiv relative my-1 mr-2.5 cursor-pointer">
                            <div
                              onClick={e => (
                                e.stopPropagation(),
                                showPriceRangeFilter(false),
                                showSaleTypeFilter(false),
                                openCollectionFilter(false),
                                showListedFilter(!listedFilter)
                              )}
                              className="typeModelBtn dropdown-toggle inline-flex w-48 items-center justify-between rounded-lg border border-jacarta-100 bg-white py-2 px-3 text-sm dark:border-jacarta-600 dark:bg-jacarta-700 dark:text-white"
                            >
                              {currentFilter == "recentlyListed" && (
                                <span className="text-jacarta-700 dark:text-white">📌 Recently Listed</span>
                              )}
                              {currentFilter == "lowToHigh" && (
                                <span className="text-jacarta-700 dark:text-white">🏷️ Price: Low To High</span>
                              )}
                              {currentFilter == "highToLow" && (
                                <span className="text-jacarta-700 dark:text-white">🏷️ Price: High To Low</span>
                              )}
                              {currentFilter == "rankLowToHigh" && (
                                <span className="text-jacarta-700 dark:text-white">🥇 Rank: Low To High</span>
                              )}
                              {currentFilter == "rankHighToLow" && (
                                <span className="text-jacarta-700 dark:text-white">🥇 Rank: High To Low</span>
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
                                    setDefaultFilterFetch(true),
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("recentlyListed"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm text-jacarta-700 transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600"
                                >
                                  📌 Recently Listed
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
                                    setDefaultFilterFetch(true),
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("lowToHigh"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  🏷️ Price: Low to High
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
                                    setDefaultFilterFetch(true),
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("highToLow"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  🏷️ Price: High to Low
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

                                <button
                                  onClick={() => (
                                    setDefaultFilterFetch(true),
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("rankLowToHigh"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  🥇 Rank: Low to High
                                  {currentFilter == "rankLowToHigh" && (
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
                                    setDefaultFilterFetch(true),
                                    setSkip(0),
                                    setHasMore(true),
                                    setMinPrice(0),
                                    setMaxPrice(0),
                                    setCurrentFilter("rankHighToLow"),
                                    showListedFilter(false)
                                  )}
                                  className="dropdown-item flex w-full items-center justify-between rounded-xl px-5 py-2 text-left font-display text-sm transition-colors hover:bg-jacarta-50 dark:text-white dark:hover:bg-jacarta-600 text-jacarta-700"
                                >
                                  🥇  Rank: High to Low
                                  {currentFilter == "rankHighToLow" && (
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
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex justify-center align-middle flex-wrap">
                    {searchLoading ? (
                      <div className="flex items-center justify-center space-x-2 py-12">
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      </div>
                    ) : (
                      <>
                        <InfiniteScroll
                          dataLength={onSaleNFTs ? onSaleNFTs?.length : 0}
                          next={handleScroll}
                          hasMore={hasMore}
                          className="flex flex-wrap justify-center align-middle"
                          loader={
                            <div className="flex items-center justify-center space-x-2 py-12">
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
                                rank={e?.rank}
                                Address={e?.NFTAddress}
                                Owner={e?.ownerAddress}
                                signerAddress={signer_address}
                                listedBool={e?.isListed}
                                listingPrice={e?.listingPrice}
                                NFTCollectionAddress={e?.NFTCollection?.contractAddress}
                                NFTCollectionName={e?.NFTCollection?.name}
                                NFTCollectionStatus={e?.NFTCollection?.isVerified}
                                setAnyModalOpen={setAnyModalOpen}
                                setCancelModal={setCancelModal}
                                setBuyModal={setBuyModal}
                                NFTData={e}
                                setSelectedNFT={setSelectedNFT}
                                cartNFTs={cartNFTs}
                                setCartNFTs={setCartNFTs}
                                NFTImagesBaseURI={NFTImagesBaseURI}
                                NFTImageToReplaceURIs={NFTImageToReplaceURIs}
                              />
                            );
                          })}
                        </InfiniteScroll>

                        {/* fetching onchain  */}
                        <InfiniteScroll
                          dataLength={fetchedOnchainNFTs.length}
                          next={onLandLoadOnchainNFTs}
                          hasMore={LandLoadLastNFT}
                          className="flex flex-wrap justify-center align-middle"
                          loader={
                            <div className="flex items-center justify-center space-x-2 py-12">
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                              <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                            </div>
                          }
                        >
                          {fetchedOnchainNFTs?.map((e, index) => {
                            return (
                              <NftCard
                                key={index}
                                ImageSrc={e?.preview?.source?.replace("ipfs://", OtherImagesBaseURI)}
                                Name={e?.name}
                                rank={e?.rank}
                                Address={e?.nft._address}
                                Description={e?.description}
                                NFTCollectionName={e?.collection_name}
                                NFTCollectionAddress={e?.collection?._address}
                                cartNFTs={cartNFTs}
                                setCartNFTs={setCartNFTs}
                                NFTImagesBaseURI={NFTImagesBaseURI}
                                NFTImageToReplaceURIs={NFTImageToReplaceURIs}
                              />
                            );
                          })}
                        </InfiniteScroll>
                      </>
                    )}
                  </div>
                  <div className="flex justify-center">
                    {(onSaleNFTs.length <= 0 || !onSaleNFTs) && !moreLoading && (
                      <h2 className="text-xl font-display font-thin dark:text-jacarta-200 py-12">No NFTs found!</h2>
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
              <div className="tab-pane fade show active">
                <div className="flex justify-center mt-[-32px] align-middle text-center">
                  <p className="text-lg dark:text-jacarta-200 pb-8 text-center">All the NFTs which you have in your connected wallets will appear here, <br /> including NFTs purchased or minted from other marketplaces.</p>
                </div>

                <div>
                  {/* {((adminAccount.includes(signer_address)) || (slug == signer_address)) && (
                    <div className="container flex justify-center align-middle relative -translate-y-4 cursor-pointer" onClick={() => (setAdminPermittedAction(true))}>
                      <div className="group right-0 bottom-[-10px] flex items-center rounded-lg bg-white py-2 px-4 font-display text-sm hover:bg-accent">
                        <span className="mt-0.5 block group-hover:text-white">Save onchain NFTs ⟳</span>
                      </div>
                    </div>
                  )} */}
                </div>
                <div className="flex justify-center align-middle flex-wrap">
                  <InfiniteScroll
                    dataLength={nfts.length}
                    next={fetch_user_nfts}
                    hasMore={lastNFT}
                    className="flex flex-wrap justify-center align-middle"
                    loader={
                      <div className="flex items-center justify-center space-x-2 py-12">
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
                          ImageSrc={e?.preview?.source?.replace("ipfs://", OtherImagesBaseURI)}
                          Name={e?.name}
                          rank={e?.rank}
                          Address={e?.nft._address}
                          Description={e?.description}
                          NFTCollectionName={e?.collection_name}
                          NFTCollectionAddress={e?.collection?._address}
                          cartNFTs={cartNFTs}
                          setCartNFTs={setCartNFTs}
                          NFTImagesBaseURI={NFTImagesBaseURI}
                          NFTImageToReplaceURIs={NFTImageToReplaceURIs}
                        />
                      );
                    })}
                  </InfiniteScroll>
                </div>

                <div className="flex justify-center">
                  {nfts?.length <= 0 && !moreLoading && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">No NFTs to show!</h2>
                  )}
                  {nfts?.length <= 0 && moreLoading && (
                    <div className="flex items-center justify-center space-x-2 py-12">
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
              <div className="tab-pane fade show active" id="on-sale" role="tabpanel" aria-labelledby="on-sale-tab">
                <div className="flex justify-center align-middle flex-wrap">
                  <InfiniteScroll
                    dataLength={NFTCollections ? NFTCollections?.length : 0}
                    next={handleCollectionScroll}
                    hasMore={hasMoreCollections}
                    className="flex flex-wrap justify-center align-middle"
                    loader={
                      <div className="flex items-center justify-center space-x-2 py-12">
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                        <div className="w-4 h-4 rounded-full animate-pulse dark:bg-violet-400"></div>
                      </div>
                    }
                  >
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
                        OtherImagesBaseURI={OtherImagesBaseURI}
                      />
                    ))}
                  </InfiniteScroll>
                </div>
                <div className="flex justify-center">
                  {NFTCollections?.length <= 0 && moreLoading == false && (
                    <h2 className="text-xl font-display font-thin dark:text-jacarta-200">No Collections to show!</h2>
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
                        onClick={() => (
                          setActivitySkip(0), setActivityRecords([]), setHasMoreActivity(true), setUserPurchases(false), setActivityType("")
                        )}
                        className={`${activityType == ""
                          ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                          : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                          }`}
                      >
                        <span className={`text-2xs font-medium  ${activityType == "" && "text-white"}`}>All</span>
                      </button>
                      <button
                        onClick={() => (
                          setActivitySkip(0), setActivityRecords([]), setHasMoreActivity(true), setUserPurchases(false), setActivityType("list")
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
                        <span className={`text-2xs font-medium  ${activityType == "list" && "text-white"}`}>
                          Listing
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setActivityRecords([]),
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
                        <span className={`text-2xs font-medium ${activityType == "cancel" && "text-white"}`}>
                          Remove Listing
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0), setActivityRecords([]), setHasMoreActivity(true), setUserPurchases(true), setActivityType("sale")
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
                        <span className={`text-2xs font-medium ${activityType == "sale" && "text-white"}`}>
                          Purchase
                        </span>
                      </button>

                      <button
                        onClick={() => (
                          setActivitySkip(0),
                          setActivityRecords([]),
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
                        <span className={`text-2xs font-medium ${activityType == "user_sale" && "text-white"}`}>
                          Sale
                        </span>
                      </button>
                      {EnableMakeOffer &&
                        <>
                          <button
                            onClick={() => (
                              setActivitySkip(0),
                              setActivityRecords([]),
                              setHasMoreActivity(true),
                              setUserPurchases(false),
                              setActivityType("offer")
                            )}
                            className={`${activityType == "offer"
                              ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                              : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                              }`}
                          >
                            <IoHandLeftOutline
                              className={`mr-2 h-4 w-4 ${activityType == "offer"
                                ? "text-white"
                                : "group-hover:text-white text-jacarta-700 text-jacarta-700 dark:text-white"
                                }`}
                            />
                            <span className={`text-2xs font-medium ${activityType == "offer" && "text-white"}`}>Offer</span>
                          </button>

                          <button
                            onClick={() => (
                              setActivitySkip(0),
                              setActivityRecords([]),
                              setHasMoreActivity(true),
                              setUserPurchases(false),
                              setActivityType("canceloffer")
                            )}
                            className={`${activityType == "canceloffer"
                              ? "mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-transparent bg-accent px-4 py-3 hover:bg-accent-dark dark:hover:bg-accent-dark"
                              : "group mr-2.5 mb-2.5 inline-flex items-center rounded-xl border border-jacarta-100 bg-white px-4 py-3 hover:border-transparent hover:bg-accent hover:text-white dark:border-jacarta-600 dark:bg-jacarta-700 text-jacarta-700 dark:text-white dark:hover:border-transparent dark:hover:bg-accent"
                              }`}
                          >
                            <IoHandLeftOutline
                              className={`mr-2 h-4 w-4 ${activityType == "canceloffer"
                                ? "text-white"
                                : "group-hover:text-white text-jacarta-700 text-jacarta-700 dark:text-white"
                                }`}
                            />
                            <span className={`text-2xs font-medium ${activityType == "canceloffer" && "text-white"}`}>
                              Cancel Offer
                            </span>
                          </button>
                        </>
                      }
                    </div>
                  )}
                </div>
                <div className={`mb-10 shrink-0 basis-8/12 space-y-5 lg:mb-0 lg:pr-10`}>
                  <div className="flex justify-center align-middle flex-wrap">
                    <InfiniteScroll
                      dataLength={activityRecords ? activityRecords?.length : 0}
                      next={handleActivityScroll}
                      hasMore={hasMoreActivity}
                      className="flex flex-wrap justify-center align-middle"
                      loader={
                        <div className="flex items-center justify-center align-middle space-x-2 py-12">
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
                          signerAddress={signer_address}
                          NFTImagesBaseURI={NFTImagesBaseURI}
                          NFTImageToReplaceURIs={NFTImageToReplaceURIs}
                        />
                      ))}
                    </InfiniteScroll>
                    <div className="flex justify-center text-center">
                      {activityRecords?.length <= 0 && moreLoading == false && (
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
          collectionTrading={selectedNFT?.NFTCollection?.isTrading}
          NFTName={selectedNFT?.name}
          actionLoad={actionLoad}
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
          NFTImage={selectedNFT?.nft_image}
          NFTCollectionContract={selectedNFT?.NFTCollection?.contractAddress}
          NFTCollectionName={selectedNFT?.NFTCollection?.name}
          CollectionVerification={selectedNFT?.NFTCollection?.isVerified}
          collectionTrading={selectedNFT?.NFTCollection?.isTrading}
          NFTName={selectedNFT?.name}
          NFTRank={selectedNFT?.rank}
          NFTListingPrice={selectedNFT?.listingPrice}
          actionLoad={actionLoad}
          NFTImagesBaseURI={NFTImagesBaseURI}
          NFTImageToReplaceURIs={NFTImageToReplaceURIs}
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
          NFTImagesBaseURI={NFTImagesBaseURI}
          NFTImageToReplaceURIs={NFTImageToReplaceURIs}
        />
      )}
    </div>
  );
};

export async function getServerSideProps(context) {
  const slug = context.query.slug;
  let profileDataProps;
  if (context.req.headers.host.includes("localhost")) {
    const ProfileData = await (await fetch(`http://localhost:3000/api/user/single_user?wallet_address=${slug}`)).json();
    profileDataProps = ProfileData.data;
  }
  else {
    const ProfileData = await (await fetch(`https://venomart.io/api/user/single_user?wallet_address=${slug}`)).json();
    profileDataProps = ProfileData.data;
  }
  return {
    props: {
      profileDataProps
    },
  };
}

export default Profile;
