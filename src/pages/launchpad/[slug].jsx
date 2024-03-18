import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { RiEarthFill } from "react-icons/ri";
import { GoArrowUpRight, GoDotFill } from "react-icons/go";
import { BsBrowserChrome, BsDiscord, BsFillShareFill, BsInstagram, BsTelegram, BsTwitter } from "react-icons/bs";
import { AiFillCheckCircle, AiFillCloseCircle, AiFillLock } from "react-icons/ai";
import Head from "next/head";
import Loader from "../../components/Loader";
import collectionAbi from "../../../abi/CollectionDrop.abi.json";
import { get_launchpad_by_name, updateLaunchpadStatus } from "../../utils/mongo_api/launchpad/launchpad";
import { useRouter } from "next/router";
import moment from "moment";
import Image from "next/image";
import { get_phases_name, get_total_minted, launchpad_mint } from "../../utils/launchpad_nft";
import { Timer } from "../../components/Timer";

const launchpad = ({
    blockURL,
    theme,
    webURL,
    venomProvider,
    signer_address,
    connectWallet,
    setAnyModalOpen,
    LaunchData,
}) => {
    const router = useRouter();
    const { slug } = router.query;

    const [collectionData, setCollectionData] = useState("");
    const [loading, setLoading] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState(0);
    const [mintedPercent, setMintedPercent] = useState(0);
    const [afterMint, setAfterMint] = useState(false);
    const [checkMint, setCheckMint] = useState();
    const [status, setStatus] = useState("");
    const [mintCount, setMintCount] = useState(1);

    const [selected_phase, set_selected_phase] = useState({
        id: "",
        phaseName: "",
        maxMint: "",
        mintPrice: "",
        startDate: "",
        EndDate: "",
        EligibleWallets: [""],
        mintEligibility: false,
    });

    // handling mint count
    const handlemintCountInc = () => {
        if (mintCount < selected_phase?.maxMint) {
            setMintCount(mintCount + 1);
        } else {
            alert(`you cannot mint more than ${selected_phase?.maxMint} NFTs in this phase`);
        }
    };
    const handlemintCountDec = () => {
        if (mintCount > 1) {
            setMintCount(mintCount - 1);
        }
    };

    // getting launchpad data
    const getLaunchpadData = async () => {
        const launchpaddata = await get_launchpad_by_name(slug);
        setStatus(launchpaddata?.status);

        const updatedPhases = launchpaddata?.phases.map((phase, index) => {
            let eligibleWallets = [];
            if (phase.EligibleWallets != "") {
                eligibleWallets = JSON.parse(phase.EligibleWallets);
            }
            const isUserWalletEligible = eligibleWallets.includes(signer_address);
            return {
                id: index,
                phaseName: phase.phaseName,
                maxMint: phase.maxMint,
                mintPrice: phase.mintPrice,
                startDate: phase.startDate,
                EndDate: phase.EndDate,
                EligibleWallets: eligibleWallets,
                mintEligibility: isUserWalletEligible,
            };
        });

        const updatedLaunchpadData = {
            ...launchpaddata,
            phases: updatedPhases,
        };

        setCollectionData(updatedLaunchpadData);

        // setting default phase info
        const defaultPhaseData = launchpaddata?.phases[0];
        const defaultEligibleWallets = JSON.parse(launchpaddata?.phases[0]?.EligibleWallets);

        const isUserWalletEligible = defaultEligibleWallets.includes(signer_address);

        const def_data = {
            id: 0,
            phaseName: launchpaddata?.phases[0]?.phaseName,
            maxMint: launchpaddata?.phases[0]?.maxMint,
            mintPrice: launchpaddata?.phases[0]?.mintPrice,
            startDate: launchpaddata?.phases[0]?.startDate,
            EndDate: launchpaddata?.phases[0]?.EndDate,
            EligibleWallets: defaultEligibleWallets,
            mintEligibility: isUserWalletEligible,
        };
        set_selected_phase(def_data);
        updateMintStatus();
    };

    // update mint status
    const updateMintStatus = async () => {
        if (!collectionData || collectionData.pageName === "" || !collectionData.phases) return;
        const endLength = collectionData?.phases?.length - 1;

        const startDate = new Date(collectionData.phases[0].startDate);
        const endDate = new Date(collectionData.phases[endLength].EndDate);
        const today = new Date();

        if (startDate > today && collectionData.status != "upcoming") {
            const updateStatus = await updateLaunchpadStatus(collectionData?.pageName, "upcoming");
        }

        if (startDate < today && endDate > today && collectionData.status != "live") {
            const updateStatus = await updateLaunchpadStatus(collectionData?.pageName, "live");
        }

        if (endDate < today && collectionData.status != "ended") {
            const updateStatus = await updateLaunchpadStatus(collectionData?.pageName, "ended");
        }
        if (mintedNFTs >= collectionData.maxSupply && collectionData.status != "sold out") {
            const updateStatus = await updateLaunchpadStatus(collectionData?.pageName, "sold out");
        }
    };

    // selecting phase
    const selectPhaseFunction = (phase, index) => {
        set_selected_phase({
            id: index,
            phaseName: phase?.phaseName,
            maxMint: phase?.maxMint,
            mintPrice: phase?.mintPrice,
            startDate: phase?.startDate,
            EndDate: phase?.EndDate,
            mintEligibility: phase?.mintEligibility,
            EligibleWallets: phase?.EligibleWallets,
        });
    };

    // get minted supply
    const getMintedSupply = async () => {
        if (!venomProvider) return console.log("Provider is undefined");

        const mintedSupply = await get_total_minted(venomProvider, collectionData?.contractAddress);
        const mint_percent = Math.floor((mintedSupply / collectionData?.maxSupply) * 100);
        setMintedPercent(mint_percent);
        setMintedNFTs(mintedSupply);
    };

    // mint function
    const mintLaunchNFT = async () => {
        if (!venomProvider) return;
        if (!signer_address) { connectWallet() }
        if (new Date(selected_phase?.EndDate) < new Date()) {
            alert(`Minting for ${selected_phase?.phaseName} has ended!!`);
            return;
        }
        const payable_amount = selected_phase.mintPrice * mintCount;
        launchpad_mint(venomProvider, "", signer_address, mintCount, selected_phase.id, payable_amount);
    };

    useEffect(() => {
        if (!slug) return;
        getLaunchpadData();
    }, [slug, signer_address]);

    useEffect(() => {
        getMintedSupply();
        updateMintStatus();
    }, [venomProvider, collectionData]);

    useEffect(() => {
        selectPhaseFunction();
    }, [signer_address]);

    useEffect(() => {
        setMintCount(1);
    }, [selected_phase]);

    return (
        <div className={`${theme}`}>
            <Head>
                <title>{`${LaunchData?.name ? LaunchData?.name : "Project"} NFT Launchpad - Venomart Marketplace`}</title>
                <meta
                    name="description"
                    content="Explore, Create and Experience exculsive NFTs on Venomart | Powered by Venomart"
                />
                <meta
                    name="keywords"
                    content={`venomart, venom blockchain nft,nfts on venom, NFT launchpad, nft launchpad venom, best nft launchpads, ${LaunchData?.name ? LaunchData?.name : ""
                        } nft launchpad,  ${LaunchData?.name ? LaunchData?.name : ""} nft launch`}
                />

                <meta
                    property="og:title"
                    content={`${LaunchData?.name ? LaunchData?.name : "NFT Launchpad"} - Venomart Marketplace`}
                />
                <meta
                    property="og:description"
                    content={`${LaunchData?.description
                        ? LaunchData?.description
                        : "Explore, Create and Experience exclusive NFTs on Venomart"
                        } | Powered by Venomart`}
                />
                <meta
                    property="og:image"
                    content={`${LaunchData?.logo
                        ? LaunchData?.logo?.replace("ipfs://", "https://ipfs.io/ipfs/")
                        : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"
                        }`}
                />
                <meta property="og:url" content={"https://venomart.io/"} />

                <meta name="twitter:card" content="summary_large_image" />
                <meta
                    name="twitter:title"
                    content={`${LaunchData?.name ? LaunchData?.name : "NFT Launchpad"} - Venomart Marketplace`}
                />
                <meta
                    name="twitter:description"
                    content={`${LaunchData?.description
                        ? LaunchData?.description
                        : "Explore, Create and Experience exclusive NFTs on Venomart"
                        } | Powered by Venomart`}
                />
                <meta
                    name="twitter:image"
                    content={`${LaunchData?.logo
                        ? LaunchData?.logo?.replace("ipfs://", "https://ipfs.io/ipfs/")
                        : "https://ipfs.io/ipfs/QmRu7vbYVqRu88pwUzYYWTPCfpDEbzSWETYWDtzeZ4sLHd/dislogo.jpg"
                        }`}
                />
                <meta name="twitter:site" content="@venomart23" />
                <meta name="twitter:creator" content="@venomart23" />

                <meta name="robots" content="INDEX,FOLLOW" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            {afterMint && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <div className="dark:bg-jacarta-900">
                    {/* <!-- Intro Section--> */}
                    <div className="relative pt-24 h-[100%] w-[100%]">
                        <div className="container h-full w-full" style={{ overflow: "hidden" }}>
                            <div className="launchHeroSectionStyle h-full">
                                {/* left section  */}
                                <div className="launchHeroLeftSection h-full py-10">
                                    <h1
                                        className="flex mb-6 text-center font-display text-[12px] text-jacarta-700 dark:text-white md:text-left lg:text-6xl xl:text-7xl"
                                        style={{ fontSize: "35px" }}
                                    >
                                        <span> {collectionData?.name} </span>{" "}
                                        {collectionData?.isVerified && (
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
                                        {collectionData?.socials && (
                                            <>
                                                {collectionData?.socials[0] && (
                                                    <a href={collectionData?.socials[0]} target="_blank" className="group">
                                                        <BsBrowserChrome className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                                    </a>
                                                )}
                                                {collectionData?.socials[1] && (
                                                    <a href={collectionData?.socials[1]} target="_blank" className="group">
                                                        <BsTwitter className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                                    </a>
                                                )}
                                                {collectionData?.socials[2] && (
                                                    <a href={collectionData?.socials[2]} target="_blank" className="group">
                                                        <BsDiscord className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                                    </a>
                                                )}
                                                {collectionData?.socials[3] && (
                                                    <a href={collectionData?.socials[3]} target="_blank" className="group">
                                                        <BsTelegram className="h-6 w-6 fill-jacarta-300 group-hover:fill-accent dark:group-hover:fill-white" />
                                                    </a>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    {/* short desc  */}
                                    <p className="mb-8 text-center text-lg dark:text-jacarta-200 md:text-left sm:w-[90%]">
                                        {collectionData?.description}
                                    </p>
                                    {/* action  */}
                                    <div className="flex justify-center align-middle space-x-2 lg:space-x-4">
                                        {collectionData?.contractAddress != "" ? (
                                            <>
                                                <a
                                                    href={`${blockURL}accounts/${collectionData?.contractAddress}`}
                                                    target="_blank"
                                                    className="flex w-38 rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                                >
                                                    Venomscan
                                                    <RiEarthFill className="ml-[5px] mt-[3px] h-[20px]" />
                                                </a>
                                                <Link
                                                    href={`/collection/${collectionData?.contractAddress}`}
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
                                    <div className="relative" style={{ overflow: "hidden" }}>
                                        <Image
                                            height={100}
                                            width={100}
                                            src={collectionData?.coverImage?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                                            alt="coverIMG"
                                            style={{ borderRadius: "25px", width: "100%", marginBottom: "20px" }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* main content div  */}
                    <section className="relative bg-light-base pb-12 pt-12 dark:bg-jacarta-800">
                        <section className="text-gray-600 body-font overflow-hidden">
                            {/* sandwitch area  */}
                            <div className="flex flex-wrap justify-around align-middle container px-5 pt-6">
                                <div className="px-4 py-4">
                                    <h2 className="text-sm title-font text-gray-500 tracking-widest">EXCLUSIVE MINT</h2>
                                    <h1 className="text-[4px] text-jacarta-700 dark:text-white text-2xl title-font font-medium mb-1">
                                        {collectionData?.maxSupply} NFTs
                                    </h1>
                                </div>

                                {/* mint status  */}
                                <div className="px-4 py-4">
                                    <h2 className="text-sm title-font text-gray-400 tracking-widest text-center">MINTING STATUS</h2>
                                    {status == "live" && (
                                        <h1 className="flex text-[22px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[28px] w-[28px] text-green mt-1" />
                                            <span className="text-green text-center" style={{ textTransform: "uppercase" }}>
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                    {status == "ended" && (
                                        <h1 className="flex text-[22px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[28px] w-[28px] text-red-400 mt-1" />
                                            <span className="text-red-400 text-center" style={{ textTransform: "uppercase" }}>
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                    {status == "upcoming" && (
                                        <h1 className="flex text-[22px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[28px] w-[28px] text-[#2fa8b5] mt-1" />
                                            <span className="text-[#2fa8b5] text-center" style={{ textTransform: "uppercase" }}>
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                    {status == "sold out" && (
                                        <h1 className="flex text-[22px] text-jacarta-700 dark:text-white title-font font-medium mb-1 justify-center">
                                            <GoDotFill className="h-[28px] w-[28px] text-jacarta-300 mt-1" />
                                            <span className="text-jacarta-300 text-center" style={{ textTransform: "uppercase" }}>
                                                {status}
                                            </span>
                                        </h1>
                                    )}
                                </div>
                            </div>

                            {/* mint zone  */}
                            <div className="container px-5 pt-6 pb-24 mx-auto">
                                <div className="lg:w-4/5 mx-auto flex flex-wrap justify-between w[100%]">
                                    {/* left  */}
                                    <div className="lg:w-1/2 w-full lg:h-[100%] h-64 mb-2 sm:mb-[400px] lg:mt-0">
                                        <Image
                                            height={100}
                                            width={100}
                                            alt="nftImg"
                                            className="launchImage h-[100%] w-[100%] object-cover object-center rounded-[20px]"
                                            src={collectionData?.logo?.replace("ipfs://", "https://ipfs.io/ipfs/")}
                                        />
                                    </div>

                                    {/* right main */}
                                    <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                                        <div className="mt-4 mb-12">
                                            {/* mint percent  */}
                                            <div className="flex justify-between">
                                                <h2 className="text-sm text-jacarta-700 dark:text-white tracking-widest">TOTAL MINTED</h2>
                                                {mintedNFTs >= 0 && (
                                                    <p className="text-jacarta-700 dark:text-white text-sm mb-1">
                                                        {mintedPercent}% ({mintedNFTs}/{collectionData?.maxSupply})
                                                    </p>
                                                )}
                                            </div>
                                            <div className={`w-[100%] ${theme == "dark" ? "bg-neutral-600" : "bg-neutral-200"} rounded-lg`}>
                                                <div
                                                    className={`bg-indigo-500 p-0.5 h-[12px] text-center text-xs font-medium text-white rounded-lg`}
                                                    style={{ width: mintedPercent + "%" }}
                                                ></div>
                                            </div>

                                            {/* phases  */}
                                            <div className="flex flex-col w-[100%] mt-6">
                                                {collectionData?.phases?.map((phase, index) => (
                                                    <div
                                                        className={`${selected_phase?.id == index && "border-2"
                                                            } flex w-[100%] my-2 p-4 justify-between
                                                        ${theme == "dark"
                                                                ? `bg-[#0d102b] focus-border-[#ffffff]`
                                                                : "bg-[#ffffff] focus-border-[#ababab]"
                                                            } rounded-[13px] cursor-pointer`}
                                                        key={index}
                                                        onClick={() => selectPhaseFunction(phase, index)}
                                                    >
                                                        <div className="flex flex-col  w-[70%] text-white">
                                                            <h2 className={`font-display mb-1 ${theme == "dark" ? "text-white" : "text-[#0f0f0f]"}`}>
                                                                {phase?.phaseName}
                                                            </h2>
                                                            <p
                                                                className={`text-[14px] font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"
                                                                    }`}
                                                            >
                                                                {phase?.maxMint} Per Wallet ● {phase?.mintPrice} VENOM
                                                            </p>
                                                            {phase?.mintEligibility == true || phase?.EligibleWallets == "" ? (
                                                                <p className={`text-[14px] font-mono text-green-400`}>Eligible</p>
                                                            ) : (
                                                                <p className={`text-[14px] font-mono text-red-400`}>Not Eligible</p>
                                                            )}
                                                        </div>
                                                        {new Date(phase?.startDate) < new Date() && new Date(phase?.EndDate) > new Date() && (
                                                            <div className="flex flex-col w-[30%] align-middle justify-end mr-2">
                                                                <div className={`font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"}`}>
                                                                    Ends In
                                                                </div>
                                                                <span
                                                                    className={`font-mono font-bold whitespace-nowrap ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"
                                                                        }`}
                                                                >
                                                                    <Timer date={phase?.EndDate} />
                                                                </span>
                                                            </div>
                                                        )}
                                                        {new Date(phase?.startDate) > new Date() && (
                                                            <div className="flex flex-col w-[30%] align-middle justify-end mr-2">
                                                                <div className={`font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"}`}>
                                                                    Starts In
                                                                </div>
                                                                <span
                                                                    className={`font-mono font-bold whitespace-nowrap ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"
                                                                        }`}
                                                                >
                                                                    <Timer date={phase?.startDate} />
                                                                </span>
                                                            </div>
                                                        )}
                                                        {new Date(phase?.EndDate) < new Date() && (
                                                            <div className="flex flex-col w-[30%] align-middle justify-end mr-2">
                                                                <div className={`font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"}`}>
                                                                    Phase Ended
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* final mint section  */}
                                            <div className="flex flex-col w-[100%] mt-12">
                                                {/* price  */}
                                                {!(new Date(collectionData && collectionData?.phases[collectionData?.phases?.length - 1]?.EndDate) < new Date()) &&
                                                    <div className="flex justify-between w-[100%]">
                                                        <div>
                                                            <h2 className={`font-bold ${theme == "dark" ? "text-[#f1f1f1]" : "text-[#363232]"}`}>
                                                                <span className={`${theme == "dark" ? "text-[#efefef]" : "text-[#292929]"} font-light`}>
                                                                    Price:
                                                                </span>{" "}
                                                                {selected_phase?.mintPrice} VENOM
                                                            </h2>
                                                        </div>
                                                        <div className="inline-flex items-center">
                                                            <button
                                                                className="bg-white rounded-l border text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 inline-flex items-center px-2 py-1 border-r border-gray-200"
                                                                onClick={() => handlemintCountDec()}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-6 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                                                                </svg>
                                                            </button>
                                                            <div className="bg-white border-t border-b border-gray-100 text-gray-600 hover:bg-gray-100 inline-flex items-center px-4 py-1 select-none">
                                                                {mintCount}
                                                            </div>
                                                            <button
                                                                className="bg-white rounded-r border text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 inline-flex items-center px-2 py-1 border-r border-gray-200"
                                                                onClick={() => handlemintCountInc()}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    className="h-6 w-4"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    stroke="currentColor"
                                                                >
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </div>
                                                }

                                                {/* mint btn  */}
                                                {(new Date(collectionData && collectionData?.phases[collectionData?.phases?.length - 1]?.EndDate) < new Date()) ?
                                                    <div className="flex w-[100%] mt-4">
                                                        <button
                                                            onClick={() => alert("Oops! The launchpad minting for this collection has ended!!")}
                                                            className={`${(theme = "dark"
                                                                ? "bg-indigo-500"
                                                                : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                        >
                                                            <span className="text-white font-mono">Minting Ended!</span>
                                                        </button>
                                                    </div>
                                                    :
                                                    <div className="flex w-[100%] mt-4">
                                                        {new Date(selected_phase?.startDate) > new Date() ?
                                                            <button
                                                                onClick={() => alert("Minting in this phase has not started yet!")}
                                                                className={`${(theme = "dark"
                                                                    ? "bg-indigo-500"
                                                                    : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                            >
                                                                <span className="text-white font-mono">Not Started 🔒</span>
                                                            </button>
                                                            :
                                                            (selected_phase?.mintEligibility == true || selected_phase?.EligibleWallets == "" ?
                                                                <button
                                                                    onClick={mintLaunchNFT}
                                                                    className={`${(theme = "dark"
                                                                        ? "bg-indigo-500"
                                                                        : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                                >
                                                                    <span className="text-white font-mono">Mint</span>
                                                                </button>
                                                                :
                                                                <button
                                                                    onClick={() => alert("You are not eligible to mint in this phase!!")}
                                                                    className={`${(theme = "dark"
                                                                        ? "bg-indigo-500"
                                                                        : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                                >
                                                                    <span className="text-white font-mono">Not Eligible ❌</span>
                                                                </button>
                                                            )
                                                        }
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </section>

                    {afterMint && (
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
                                                You have successfully minted the {collectionData?.name} NFT for {collectionData?.mintPrice}{" "}
                                                VENOM. <br /> View your profile to see the minted NFT 🤗
                                            </span>
                                        </div>
                                    </div>

                                    <div className="modal-footer" style={{ flexWrap: "nowrap" }}>
                                        <div className="flex items-center justify-center space-x-4 m-2">
                                            <Link
                                                // href={`/profile/${signer_address}`}
                                                href={""}
                                                className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                            >
                                                View
                                                <GoArrowUpRight className="ml-[5px] mt-[2px] text-[20px]" />
                                            </Link>
                                        </div>
                                        <div className="flex items-center justify-center space-x-4 m-2">
                                            <a
                                                href={`https://twitter.com/intent/tweet?text=Just%20minted%20${collectionData?.name}%20NFT%20via%20venomart%20NFT%20launchpad%20%F0%9F%94%A5%0AVery%20smooth%20minting,%20great%20experience%20%F0%9F%98%84%0AHere%20you%20go%20-%20${webURL}launchpad/${slug}%0A%23NFT%20%23venomartNFTs%20%23venomart%20%23Venom%20%23VenomBlockchain`}
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

export async function getServerSideProps(context) {
    const slug = context.query.slug;
    let LaunchData;
    if (context.req.headers.host.includes("localhost")) {
        const collectionDataProps = await (
            await fetch(`http://localhost:3000/api/launchpad/slug_launchpad?name=${slug}`)
        ).json();
        LaunchData = collectionDataProps.data;
    } else {
        const collectionDataProps = await (
            await fetch(`https://venomart.io/api/launchpad/slug_launchpad?name=${slug}`)
        ).json();
        LaunchData = collectionDataProps.data;
    }
    return {
        props: {
            LaunchData,
        },
    };
}

export default launchpad;
