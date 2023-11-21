import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import {
    BsBrowserChrome,
    BsDiscord,
    BsFillShareFill,
    BsInstagram,
    BsTelegram,
    BsTwitter,
} from "react-icons/bs";
import { RiEarthFill } from "react-icons/ri";
import { GoArrowUpRight, GoDotFill } from "react-icons/go";
import {
    AiFillCheckCircle,
    AiFillCloseCircle,
    AiFillLock,
} from "react-icons/ai";
import Head from "next/head";
import Loader from "../../../components/Loader";
import { create_launchpad_nft } from "../../../utils/user_nft";
import collectionAbi from "../../../../abi/CollectionDrop.abi.json";
import { has_minted } from "../../../utils/user_nft";
import Image from "next/image";
import customLaunchpad from '../customLaunchpad.json';

const venomraffles = ({
    blockURL,
    theme,
    webURL,
    copyURL,
    venomProvider,
    signer_address,
    connectWallet,
    setAnyModalOpen
}) => {
    // change from here
    const launchSlug = customLaunchpad.find(item => item.id === 18);
    // change till here

    const router = useRouter();
    const venomartTwitter = "venomart23";
    const venomartDiscord = "https://discord.gg/wQbBr6Xean";
    const intendTweetId = launchSlug.tweetID;
    const projectTwitter = launchSlug.twitterUserName;
    const projectDiscord = launchSlug.discord;
    const CoverIMG = launchSlug.Cover;
    const NFTIMG = launchSlug.Logo;
    const ProjectName = launchSlug.Name;
    const pageName = launchSlug.pageName;
    const shortDesc = launchSlug.Description;
    const contractAddress = launchSlug.CollectionAddress;
    const mintPrice = launchSlug.mintPrice;
    const supply = launchSlug.supply;
    const [status, setStatus] = useState(launchSlug.status);
    const verified = launchSlug.verified;

    const twitterURL = launchSlug.twitter;
    const discordURL = launchSlug.discord;
    const instagramURL = launchSlug.instagram;
    const telegramURL = launchSlug.telegram;
    const websiteURL = launchSlug.website;

    const [loading, setLoading] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState(0);
    const [comLoading, setCompLoading] = useState(false);
    const [afterMint, setAfterMint] = useState(false);
    const [mintLock, setMintLock] = useState(false);

    const [checkMint, setCheckMint] = useState();

    const [actionVerify, setActionVerify] = useState(false);
    const [share, setShare] = useState(false);

    const [data, set_data] = useState();

    const getRandomTokenId = () => {
        let obj = {
            image: NFTIMG,
            collectionName: ProjectName,
            name: ProjectName,
            description: shortDesc,
            collectionAddress: contractAddress,
            mintPrice: parseFloat(mintPrice),
            properties: [
                { trait_type: "Benifit", value: "Fee Discount" },
                { trait_type: "Version", value: "Testnet" },
            ],
        }
        set_data(obj);
    }

    const [startdays, setStartDays] = useState(0);
    const [starthours, setStartHours] = useState(0);
    const [startminutes, setStartMinutes] = useState(0);
    const [startseconds, setStartSeconds] = useState(0);

    const [enddays, setEndDays] = useState(0);
    const [endhours, setEndHours] = useState(0);
    const [endminutes, setEndMinutes] = useState(0);
    const [endseconds, setEndSeconds] = useState(0);

    const getMintedCount = async () => {
        if (!venomProvider) return;
        setLoading(true);
        try {
            const contract = new venomProvider.Contract(
                collectionAbi,
                contractAddress
            );
            const totalSupply = await contract.methods
                .totalSupply({ answerId: 0 })
                .call();
            setMintedNFTs(totalSupply.count);
        } catch (error) {
            setMintedNFTs(0);
            console.log(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (status == "Upcoming") {
            setLoading(true);
            const target = new Date(
                `${launchSlug.startDate ? launchSlug.startDate : ""}`
            );

            const interval = setInterval(() => {
                const now = new Date();
                const difference = target.getTime() - now.getTime();

                const d = Math.floor(difference / (1000 * 60 * 60 * 24));
                setStartDays(d);

                const h = Math.floor(
                    (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                );
                setStartHours(h);

                const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                setStartMinutes(m);

                const s = Math.floor((difference % (1000 * 60)) / 1000);
                setStartSeconds(s);

                if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
                    setStatus("Live");
                    const target = new Date(
                        `${launchSlug.endDate ? launchSlug.endDate : ""}`
                    );

                    const interval = setInterval(() => {
                        const now = new Date();
                        const difference = target.getTime() - now.getTime();

                        const d = Math.floor(difference / (1000 * 60 * 60 * 24));
                        setEndDays(d);

                        const h = Math.floor(
                            (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
                        );
                        setEndHours(h);

                        const m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                        setEndMinutes(m);

                        const s = Math.floor((difference % (1000 * 60)) / 1000);
                        setEndSeconds(s);

                        if (d <= 0 && h <= 0 && m <= 0 && s <= 0) {
                            setStatus("Ended");
                        }
                    }, 1000);
                    return () => clearInterval(interval);
                }
            }, 1000);
            setLoading(false);
            return () => clearInterval(interval);
        }
    }, []);

    const connect_wallet = async () => {
        const connect = await connectWallet();
    };

    const mintLaunchNFT = async () => {
        if (!signer_address) {
            connect_wallet();
            return;
        }
        setLoading(true);
        const launchMint = await create_launchpad_nft(
            data,
            signer_address,
            venomProvider
        );
        if (launchMint) {
            setAfterMint(true);
            setAnyModalOpen(true);
            setMintLock(true);
        }
        setLoading(false);
    };

    const verifyAction = () => {
        setCompLoading(true);
        setTimeout(() => {
            setActionVerify(true);
            setCompLoading(false);
        }, 2000);
    };

    const get_user_Data = async () => {
        if (!launchSlug?.CollectionAddress) return;
        setLoading(true);
        const data = await has_minted(
            contractAddress,
            signer_address,
            venomProvider
        );
        setCheckMint(data);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
        }, 3000);

        if (!venomProvider) return;
        getMintedCount();
        getRandomTokenId();

        if (!signer_address || !contractAddress) return;
        get_user_Data();
    }, [venomProvider, signer_address]);

    return (
        <div className={`${theme}`}>
            <Head>
                <title>{`${ProjectName ? ProjectName : "Project"} NFT Launchpad - Venomart Marketplace`}</title>
                <meta
                    name="description"
                    content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            {afterMint && (
                <div className="backgroundModelBlur backdrop-blur-lg"></div>
            )}

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <div className="dark:bg-jacarta-900">
                    {/* <!-- Intro Section--> */}
                    <div className="relative pt-24 h-[100%] w-[100%]">
                        <div
                            className="container h-full w-full"
                            style={{ overflow: "hidden" }}
                        >
                            <div className="launchHeroSectionStyle h-full">
                                {/* left section  */}
                                <div className="launchHeroLeftSection h-full py-10">
                                    {/* title  */}
                                    <h1
                                        className="flex mb-6 text-center font-display text-[12px] text-jacarta-700 dark:text-white md:text-left lg:text-6xl xl:text-7xl"
                                        style={{ fontSize: "35px" }}
                                    >
                                        <span> {ProjectName} </span>{" "}
                                        {verified && (
                                            <MdVerified
                                                style={{
                                                    color: "#4f87ff",
                                                    cursor: "pointer",
                                                    marginTop: "5px",
                                                    marginLeft: "7px",
                                                }}
                                                size={30}
                                            />
                                        )}
                                    </h1>
                                    {/* social icons  */}
                                    <div className="flex space-x-4 mb-6 mt-[-8px] ml-[7px]">
                                        {/* website  */}
                                        {websiteURL && (
                                            <a href={websiteURL} target="_blank" className="group">
                                                <BsBrowserChrome className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                            </a>
                                        )}
                                        {/* twitter  */}
                                        {twitterURL && (
                                            <a href={twitterURL} target="_blank" className="group">
                                                <BsTwitter className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                            </a>
                                        )}
                                        {/* discord  */}
                                        {discordURL && (
                                            <a href={discordURL} target="_blank" className="group">
                                                <BsDiscord className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                            </a>
                                        )}
                                        {/* instagram */}
                                        {instagramURL && (
                                            <a href={instagramURL} target="_blank" className="group">
                                                <BsInstagram className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                            </a>
                                        )}
                                        {/* telegram */}
                                        {telegramURL && (
                                            <a href={telegramURL} target="_blank" className="group">
                                                <BsTelegram className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                            </a>
                                        )}
                                    </div>
                                    {/* short desc  */}
                                    <p className="mb-8 text-center text-lg dark:text-jacarta-200 md:text-left sm:w-[90%]">
                                        {shortDesc}
                                    </p>
                                    {/* action  */}
                                    <div className="flex justify-center align-middle space-x-2 lg:space-x-4">
                                        {contractAddress != "" ? (
                                            <>
                                                <a
                                                    href={`${blockURL}accounts/${contractAddress}`}
                                                    target="_blank"
                                                    className="flex w-38 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                                >
                                                    Venomscan
                                                    <RiEarthFill className="ml-[5px] mt-[3px] h-[20px]" />
                                                </a>
                                                <Link
                                                    href={`/collection/${contractAddress}`}
                                                    className="flex w-38 rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                                >
                                                    Collection
                                                    <GoArrowUpRight />
                                                </Link>
                                            </>
                                        ) : (
                                            <>
                                                <a
                                                    href={"#"}
                                                    onClick={() => alert("Minting not started yet!")}
                                                    className="flex w-38 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                                >
                                                    Venomscan
                                                    <RiEarthFill className="ml-[5px] mt-[3px] h-[20px]" />
                                                </a>
                                                <a
                                                    href={"#"}
                                                    onClick={() => alert("Minting not started yet!")}
                                                    className="flex w-38 rounded-full bg-white py-3 px-8 text-center font-semibold text-accent shadow-white-volume transition-all hover:bg-accent-dark hover:text-white hover:shadow-accent-volume"
                                                >
                                                    Collection
                                                    <GoArrowUpRight />
                                                </a>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* right section   */}
                                <div className="launchHeroRightSection">
                                    <div
                                        className="relative"
                                        style={{ overflow: "hidden" }}
                                    >
                                        <Image
                                            src={CoverIMG}
                                            height={100}
                                            width={100}
                                            alt="coverIMG"
                                            style={{ borderRadius: "25px", width: "100%" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* <!-- Mint Section --> */}
                    <section className="relative bg-light-base pb-12 pt-12 dark:bg-jacarta-800">
                        <section className="text-gray-600 body-font overflow-hidden">
                            {/* timer div  */}
                            <div className="flex flex-wrap justify-around align-middle container px-5 pt-6">
                                <div className="px-4 py-4">
                                    <h2 className="text-sm title-font text-gray-500 tracking-widest">
                                        EXCLUSIVE MINT
                                    </h2>
                                    <h1 className="text-[4px] text-jacarta-700 dark:text-white text-2xl title-font font-medium mb-1">
                                        {supply && (supply <= 0 ? "∞" : supply)} NFTs
                                    </h1>
                                    {mintedNFTs > 0 && (
                                        <p className="text-jacarta-700 dark:text-white text-sm mb-1">
                                            {mintedNFTs} / {supply && (supply <= 0 ? "∞" : supply)} Minted
                                        </p>
                                    )}
                                </div>

                                {/* if live  */}
                                {status == "Live" && (
                                    <div className="px-4 py-4">
                                        <h2 className="text-sm title-font text-gray-400 tracking-widest text-center">
                                            MINT ENDS IN
                                        </h2>
                                        <div className="text-[4px] text-jacarta-700 dark:text-white text-2xl title-font font-medium mb-1">
                                            <div className="show-counter">
                                                <div className="countdown-link text-jacarta-400 dark:text-jacarta-200">
                                                    <div className="countdown">
                                                        <p>{enddays}</p>
                                                        <span>Days</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{endhours}</p>
                                                        <span>Hours</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{endminutes}</p>
                                                        <span>Mins</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{endseconds}</p>
                                                        <span>Seconds</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* sold out */}
                                {status == "Sold Out" && (
                                    <div className="px-4 py-4">
                                        <h2 className="text-sm title-font text-gray-400 tracking-widest text-center">
                                            SOLD OUT IN
                                        </h2>
                                        <h1 className="text-[4px] text-jacarta-700 dark:text-white text-xl title-font font-medium mb-1">
                                            FEW HOURS{" "}
                                        </h1>
                                    </div>
                                )}

                                {/* ended */}
                                {status == "Ended" && (
                                    <div className="px-4 py-4">
                                        <h2 className="text-sm title-font text-gray-400 tracking-widest text-center">
                                            SOLD OUT IN
                                        </h2>
                                        <h1 className="text-[4px] text-jacarta-700 dark:text-white text-xl title-font font-medium mb-1">
                                            FEW HOURS{" "}
                                        </h1>
                                    </div>
                                )}

                                {/* upcoming  */}
                                {status == "Upcoming" && (
                                    <div className="px-4 py-4">
                                        <h2 className="text-sm title-font text-gray-400 tracking-wides text-center">
                                            MINT STARTS IN
                                        </h2>
                                        <div className="text-[4px] text-jacarta-700 dark:text-white text-2xl title-font font-medium mb-1">
                                            <div className="show-counter">
                                                <div className="countdown-link text-jacarta-400 dark:text-jacarta-200">
                                                    <div className="countdown">
                                                        <p>{startdays}</p>
                                                        <span>Days</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{starthours}</p>
                                                        <span>Hours</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{startminutes}</p>
                                                        <span>Mins</span>
                                                    </div>
                                                    <p>:</p>
                                                    <div className="countdown">
                                                        <p>{startseconds}</p>
                                                        <span>Seconds</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* mint status  */}
                                <div className="px-4 py-4">
                                    <h2 className="text-sm title-font text-gray-400 tracking-widest text-center">
                                        MINTING STATUS
                                    </h2>
                                    {(status == "Live" || status == "Upcoming") && (
                                        <h1 className="flex text-[17px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[25px] w-[25px] text-green" />
                                            <span
                                                className="text-jacarta-500 dark:text-jacarta-200 text-center"
                                                style={{ textTransform: "uppercase" }}
                                            >
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                    {(status == "Sold Out" || status == "Ended") && (
                                        <h1 className="flex text-[17px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[25px] w-[25px] text-jacarta-500 dark:text-jacarta-200" />
                                            <span
                                                className="text-jacarta-500 dark:text-jacarta-200 text-center"
                                                style={{ textTransform: "uppercase" }}
                                            >
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                </div>
                            </div>

                            {/* main div  */}
                            <div className="container px-5 py-24 mx-auto">
                                <div className="lg:w-4/5 mx-auto flex flex-wrap justify-between w[100%]">
                                    {/* nftIMG  */}
                                    <div className="lg:w-1/2 w-full lg:h-[100%] h-64 mb-2 sm:mb-[400px] lg:mt-0">
                                        {NFTIMG?.includes(".mp4") ?
                                            <video
                                                autoPlay="autoplay"
                                                loop="true"
                                            >
                                                <source src={NFTIMG} type="video/mp4"></source>
                                            </video>
                                            :
                                            <Image
                                                alt="nftImg"
                                                height={100}
                                                width={100}
                                                className="launchImage h-[100%] w-[100%] object-cover rounded"
                                                src={NFTIMG}
                                            />
                                        }
                                    </div>

                                    <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                                        <h2 className="text-sm title-font text-gray-500 tracking-widest">
                                            PUBLIC MINTING
                                        </h2>
                                        <h1 className="text-[4px] text-jacarta-700 dark:text-white text-2xl title-font font-medium mb-1">
                                            Tasks :
                                        </h1>

                                        {/* follow twitter  */}
                                        {projectTwitter &&
                                            <div className="flex mt-6 items-center pb-5 border-gray-100 ">
                                                <p className="text-left text-lg dark:text-jacarta-200 md:text-left mr-[7px]">
                                                    1] Follow {ProjectName} on twitter
                                                </p>
                                                <Link
                                                    href={`https://twitter.com/intent/follow?screen_name=${projectTwitter}`}
                                                    target="_blank"
                                                    className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Follow{" "}
                                                    <BsTwitter className="h-5 w-5 fill-white ml-2 mt-[2px]" />
                                                </Link>
                                            </div>
                                        }

                                        {/* follow twitter  */}
                                        <div className="flex mt-2 items-center pb-5 border-gray-100 mb-5 dark:border-gray-100">
                                            <p className="text-left text-lg dark:text-jacarta-200 md:text-left mr-[7px]">
                                                2] Follow venomart on twitter
                                            </p>
                                            <Link
                                                href={`https://twitter.com/intent/follow?screen_name=${venomartTwitter}`}
                                                target="_blank"
                                                className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                            >
                                                Follow{" "}
                                                <BsTwitter className="h-5 w-5 fill-white ml-2 mt-[2px]" />
                                            </Link>
                                        </div>

                                        {/* join discord  */}
                                        <div className="flex mt-2 items-center pb-5 mb-5">
                                            <p className="text-left text-[20px] dark:text-jacarta-200 md:text-left mr-[7px]">
                                                3] Join venomart discord server
                                            </p>
                                            <Link
                                                href={venomartDiscord}
                                                target="_blank"
                                                className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                            >
                                                Join{" "}
                                                <BsDiscord className="h-5 w-5 fill-white ml-2 mt-[2px]" />
                                            </Link>
                                        </div>

                                        {/* join discord  */}
                                        {projectDiscord &&
                                            <div className="flex items-center pb-5 mb-5">
                                                <p className="text-left text-[20px] dark:text-jacarta-200 md:text-left mr-[7px]">
                                                    4] Join {ProjectName} discord server
                                                </p>
                                                <Link
                                                    href={projectDiscord}
                                                    target="_blank"
                                                    className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Join{" "}
                                                    <BsDiscord className="h-5 w-5 fill-white ml-2 mt-[2px]" />
                                                </Link>
                                            </div>
                                        }

                                        {/* retweet tweet  */}
                                        {intendTweetId &&
                                            <div className="flex items-center pb-5 border-b-2 dark:border-gray-100 mb-5">
                                                <p className="text-left text-[20px] dark:text-jacarta-200 md:text-left mr-[7px]">
                                                    5] Retweet and like this tweet
                                                </p>
                                                <Link
                                                    href={`https://twitter.com/intent/retweet?tweet_id=${intendTweetId}`}
                                                    target="_blank"
                                                    className="flex ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Retweet{" "}
                                                    <BsTwitter className="h-5 w-5 fill-white ml-2 mt-[2px]" />
                                                </Link>
                                            </div>
                                        }

                                        {status == "Live" && !checkMint && (
                                            <div className="flex items-center pb-5 border-b-2 border-gray-100 mb-5">
                                                {actionVerify ? (
                                                    <p className="text-center text-[17px] dark:text-jacarta-200 md:text-left">
                                                        If you verify without completing tasks then you
                                                        might miss the rewards❌
                                                    </p>
                                                ) : (
                                                    <p className="text-center text-[17px] dark:text-jacarta-200 md:text-left">
                                                        After completing tasks please verify to start
                                                        minting..
                                                    </p>
                                                )}

                                                {actionVerify ? (
                                                    <button className="w-[60%] flex justify-center ml-auto text-white bg-green-800 border-0 py-2 px-6 focus:outline-none rounded">
                                                        Verified
                                                        <AiFillCheckCircle className="ml-[4px] mt-[5px]" />
                                                    </button>
                                                ) : (
                                                    <div className="w-[100%]">
                                                        {comLoading ? (
                                                            <button className="cursor-wait flex w-[60%] justify-center ml-auto text-white bg-red border-0 py-2 px-6 focus:outline-none rounded">
                                                                Verifying{" "}
                                                                <svg
                                                                    aria-hidden="true"
                                                                    className="inline w-6 h-6 ml-3 text-gray-400 animate-spin fill-blue-200"
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
                                                                onClick={verifyAction}
                                                                className="flex w-[60%] justify-center ml-auto text-white bg-red border-0 py-2 px-6 focus:outline-none rounded"
                                                            >
                                                                Verify Tasks
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex">
                                            {/* price  */}
                                            <div>
                                                <span className="title-font font-medium text-[23px] text-jacarta-700 dark:text-white">
                                                    price :{" "}
                                                </span>
                                                <span className="title-font font-medium text-[19px] text-gray-400 text-center mt-[6px] ml-[3px]">
                                                    {" "}
                                                    {mintPrice} VENOM
                                                </span>
                                            </div>

                                            {/* mint  */}
                                            {checkMint ? (
                                                <button
                                                    onClick={() =>
                                                        alert("Only 1 NFT minting is allowed for 1 user!")
                                                    }
                                                    className="flex justify-center w-auto ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Already Minted{" "}
                                                    <AiFillLock className="mt-[4px] ml-[5px]" />
                                                </button>
                                            ) : !actionVerify ? (
                                                status == "Ended" || status == "Sold Out" ? (
                                                    <button
                                                        onClick={() =>
                                                            alert("The mint has ended! All passes sold out")
                                                        }
                                                        className="flex justify-center w-42 ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                    >
                                                        Mint Ended
                                                        <AiFillLock className="mt-[4px] ml-[5px]" />
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() =>
                                                            alert(
                                                                "Minting is locked or tasks are not completed!!"
                                                            )
                                                        }
                                                        className="flex justify-center w-42 ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                    >
                                                        Mint <AiFillLock className="mt-[4px] ml-[5px]" />
                                                    </button>
                                                )
                                            ) : mintLock ? (
                                                <button
                                                    onClick={() =>
                                                        alert("You have already minted the NFT!")
                                                    }
                                                    className="flex justify-center w-36 ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Mint NFT <AiFillLock className="mt-[4px] ml-[5px]" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => mintLaunchNFT()}
                                                    className="flex justify-center w-36 ml-auto text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded"
                                                >
                                                    Mint NFT
                                                </button>
                                            )}

                                            {/* share btn  */}
                                            <button
                                                className="rounded-full w-10 h-10 bg-gray-200 p-0 border-0 inline-flex items-center justify-center text-gray-500 ml-4"
                                                style={{ zIndex: "20" }}
                                            >
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
                                                        {share ? (
                                                            <AiFillCloseCircle className="h-6 w-6 fill-jacarta-500 dark:fill-jacarta-200" />
                                                        ) : (
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
                                                        )}
                                                    </a>

                                                    {share && (
                                                        <div className="dropdown-menu dropdown-menu-end z-10 min-w-[200px] whitespace-nowrap rounded-xl bg-white py-4 px-2 text-left shadow-xl dark:bg-jacarta-800">
                                                            <a
                                                                href={`https://twitter.com/intent/tweet?text=This%20collection%20is%20currently%20minting%20live%20on%20venomart.io%20,%20mint%20your%20NFT%20now-%20${webURL}launchpad/custom/${pageName}%20`}
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
                                                                <span className="mt-1 inline-block  text-jacarta-700 dark:text-jacarta-200">
                                                                    Copy
                                                                </span>
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </button>
                                        </div>
                                        {/* message checks  */}
                                        {!actionVerify &&
                                            !checkMint &&
                                            status != "Ended" &&
                                            status != "Sold Out" && (
                                                <div
                                                    className="flex justify-end mt-[10px] text-center"
                                                    style={{ zIndex: "10" }}
                                                >
                                                    <span className="text-[15px] text-gray-400 text-center">
                                                        Please complete tasks to start minting
                                                    </span>
                                                </div>
                                            )}
                                        {checkMint && (
                                            <div
                                                className="flex justify-end mt-[10px] text-center"
                                                style={{ zIndex: "10" }}
                                            >
                                                <span className="text-[15px] text-gray-400 text-center">
                                                    You already have this NFT in your wallet
                                                </span>
                                            </div>
                                        )}
                                        {status == "Upcoming" && (
                                            <div
                                                className="flex justify-end mt-[10px] text-center"
                                                style={{ zIndex: "10" }}
                                            >
                                                <span className="text-[15px] text-gray-400 text-center">
                                                    You can start minting the NFTs once it gets live
                                                </span>
                                            </div>
                                        )}
                                        {status == "Ended" && (
                                            <div
                                                className="flex justify-end mt-[10px] text-center"
                                                style={{ zIndex: "10" }}
                                            >
                                                <span className="text-[15px] text-gray-400 text-center">
                                                    {/* The NFT minting has ended! */}
                                                    All {ProjectName} got sold out in few hours
                                                </span>
                                            </div>
                                        )}
                                        {status == "Sold Out" && (
                                            <div
                                                className="flex justify-end mt-[10px] text-center"
                                                style={{ zIndex: "10" }}
                                            >
                                                <span className="text-[15px] text-gray-400 text-center">
                                                    All {ProjectName} got sold out in few hours
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    {actionVerify && (
                                        <div
                                            className="flex justify-center mt-[16px] text-center"
                                            style={{ zIndex: "10" }}
                                        >
                                            <span className="text-[15px] text-gray-400 text-center">
                                                IMP: Before minting the NFT make sure you have completed
                                                the tasks, we are assigning the action values to your
                                                nft address and based on this winners will get selected!
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </section>

                    {afterMint && (
                        // <div className="afterMintDiv absolute top-[30%] right-[40%] w-[500px] z-20">
                        <div className="afterMintDiv">
                            <form className="modal-dialog max-w-2xl">
                                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="placeBidLabel">
                                            Success!
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                            onClick={() => (setAnyModalOpen(false), setAfterMint(false))}
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
                                        <div className="mb-2 flex items-center justify-between">
                                            <span className="font-display text-[18px] font-semibold text-jacarta-700 dark:text-white">
                                                You have successfully minted the {ProjectName} NFT for{" "}
                                                {mintPrice} VENOM. <br /> View your profile to see the
                                                minted NFT 🤗
                                            </span>
                                        </div>
                                    </div>

                                    <div className="modal-footer" style={{ flexWrap: "nowrap" }}>
                                        <div className="flex items-center justify-center space-x-4 m-2">
                                            <Link
                                                href={`/profile/${signer_address}`}
                                                className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                            >
                                                View
                                                <GoArrowUpRight className="ml-[5px] mt-[2px] text-[20px]" />
                                            </Link>
                                        </div>
                                        <div className="flex items-center justify-center space-x-4 m-2">
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=Just%20minted%20${ProjectName}%20NFT%20via%20venomart%20NFT%20launchpad%20%F0%9F%94%A5%0AVery%20smooth%20minting,%20great%20experience%20%F0%9F%98%84%0AHere%20you%20go%20-%20${webURL}launchpad/launch/${pageName}%0A%23NFT%20%23venomartNFTs%20%23venomart%20%23Venom%20%23VenomBlockchain`}
                                                target="_blank"
                                                className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                            >
                                                Share
                                                <BsFillShareFill className="ml-[8px] mt-[6px] text-[14px]" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default venomraffles;
