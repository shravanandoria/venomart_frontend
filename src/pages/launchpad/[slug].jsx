import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { RiEarthFill } from "react-icons/ri";
import { GoArrowUpRight, GoDotFill } from "react-icons/go";
import { BsBrowserChrome, BsDiscord, BsFillShareFill, BsInstagram, BsTelegram, BsTwitter } from "react-icons/bs";
import { AiFillCheckCircle, AiFillCloseCircle, AiFillLock } from "react-icons/ai";
import { RiSwordLine } from "react-icons/ri";
import Head from "next/head";
import Loader from "../../components/Loader";
import { get_launchpad_by_name, get_user_mints, updateLaunchpadStatus } from "../../utils/mongo_api/launchpad/launchpad";
import { useRouter } from "next/router";
import moment from "moment";
import Image from "next/image";
import { get_address_mint_count, get_phases_name, get_total_minted, launchpad_mint } from "../../utils/launchpad_nft";
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
    const [mintedNFTsArray, setMintedNFTsArray] = useState("");
    const [loading, setLoading] = useState(false);
    const [mintLoading, setMintLoading] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState(0);
    const [mintedPercent, setMintedPercent] = useState(0);
    const [afterMint, setAfterMint] = useState(false);
    const [userMints, setUserMints] = useState(false);
    const [status, setStatus] = useState("");
    const [mintCount, setMintCount] = useState(1);
    const [phaseMintedCount, setPhaseMintedCount] = useState(0);

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
        if (mintCount >= (selected_phase?.maxMint - phaseMintedCount)) return alert(`You only have ${selected_phase?.maxMint - phaseMintedCount} mints left in this phase!`);
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
        setLoading(true);
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
        setLoading(false);
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

    // get phase wise minted NFTs count 
    const getPhaseWiseMinted = async () => {
        if (!venomProvider || !collectionData) return;
        const walletMintCount = await get_address_mint_count(venomProvider, collectionData?.contractAddress, selected_phase?.id, signer_address);
        setPhaseMintedCount(walletMintCount);
    }

    // get user wallet mints
    const getUserWalletMints = async () => {
        if (!collectionData) return;
        const walletMints = await get_user_mints(collectionData?.contractAddress, signer_address);
        if (walletMints != "") {
            setMintedNFTsArray(walletMints);
            setUserMints(true);
        }
    }

    // get minted supply
    const getMintedSupply = async () => {
        if (!venomProvider || !collectionData) return;
        const mintedSupply = await get_total_minted(venomProvider, collectionData?.contractAddress);
        const mint_percent = Math.floor((mintedSupply / collectionData?.maxSupply) * 100);
        setMintedPercent(mint_percent);
        setMintedNFTs(mintedSupply);
    };

    // main mint function
    const mintLaunchNFT = async () => {
        if (!venomProvider) return;
        setMintLoading(true);
        // conditions 
        if (phaseMintedCount >= selected_phase?.maxMint) return (alert("You have max minted in this phase!!"));
        if (!signer_address) {
            connectWallet();
        }
        if (new Date(selected_phase?.EndDate) < new Date()) {
            alert(`Minting for ${selected_phase?.phaseName} has ended!!`);
            return;
        }
        // minting here 
        try {
            const launchMint = await launchpad_mint(venomProvider, collectionData?.contractAddress, signer_address, mintCount, selected_phase?.id);
            if (launchMint) {
                setAfterMint(true);
            }
        } catch (error) {
            console.log(error);
        }
        setMintLoading(false);
    };

    useEffect(() => {
        if (!slug) return;
        getLaunchpadData();
        getUserWalletMints();
    }, [slug, signer_address]);

    useEffect(() => {
        getMintedSupply();
        updateMintStatus();
        getUserWalletMints();
    }, [venomProvider, collectionData]);

    useEffect(() => {
        selectPhaseFunction();
    }, [signer_address]);

    useEffect(() => {
        setMintCount(1);
        getPhaseWiseMinted();
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
                                                                ? `bg-[#0d102b] border-[#767676]`
                                                                : "bg-[#ffffff] border-[#ababab]"
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
                                                {!(
                                                    new Date(
                                                        collectionData && collectionData?.phases[collectionData?.phases?.length - 1]?.EndDate,
                                                    ) < new Date()
                                                ) && (
                                                        <div className="flex justify-between w-[100%]">
                                                            <div>
                                                                <h2 className={`font-bold ${theme == "dark" ? "text-[#f1f1f1]" : "text-[#363232]"}`}>
                                                                    <span className={`${theme == "dark" ? "text-[#efefef]" : "text-[#292929]"} font-light`}>
                                                                        Price:
                                                                    </span>{" "}
                                                                    {selected_phase?.mintPrice} VENOM
                                                                </h2>
                                                            </div>

                                                            <div className="relative items-center">
                                                                <div className={`whitespace-nowrap absolute right-[4px] top-[-26px] text-[15px] font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"
                                                                    }`}>({phaseMintedCount}/{selected_phase?.maxMint}) Minted</div>
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
                                                                    {phaseMintedCount == selected_phase?.maxMint ?
                                                                        <button
                                                                            className="bg-white rounded-r border text-gray-600 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 inline-flex items-center px-2 py-1 border-r border-gray-200"
                                                                            onClick={() => alert("You have max minted in the selected phase!")}
                                                                        >
                                                                            <svg
                                                                                xmlns="http://www.w3.org/2000/svg"
                                                                                className="h-6 w-4"
                                                                                fill="none"
                                                                                viewBox="0 0 24 24"
                                                                                stroke="currentColor"
                                                                            >
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M12 4v16m8-8H4"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                        :
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
                                                                                <path
                                                                                    strokeLinecap="round"
                                                                                    strokeLinejoin="round"
                                                                                    strokeWidth="2"
                                                                                    d="M12 4v16m8-8H4"
                                                                                />
                                                                            </svg>
                                                                        </button>
                                                                    }
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}

                                                {/* mint btn  */}
                                                {new Date(
                                                    collectionData && collectionData?.phases[collectionData?.phases?.length - 1]?.EndDate,
                                                ) < new Date() ? (
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
                                                ) : (
                                                    <div className="flex w-[100%] mt-4">
                                                        {new Date(selected_phase?.startDate) > new Date() ? (
                                                            <button
                                                                onClick={() => alert("Minting in this phase has not started yet!")}
                                                                className={`${(theme = "dark"
                                                                    ? "bg-indigo-500"
                                                                    : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                            >
                                                                <span className="text-white font-mono">Not Started 🔒</span>
                                                            </button>
                                                        ) : selected_phase?.mintEligibility == true || selected_phase?.EligibleWallets == "" ? (
                                                            mintLoading ?
                                                                <button
                                                                    className={`${(theme = "dark"
                                                                        ? "bg-indigo-500"
                                                                        : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                                >
                                                                    <span className="text-white font-mono">
                                                                        Minting {" "}
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
                                                                    </span>
                                                                </button>
                                                                :
                                                                <button
                                                                    onClick={mintLaunchNFT}
                                                                    className={`${(theme = "dark"
                                                                        ? "bg-indigo-500"
                                                                        : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                                >
                                                                    <span className="text-white font-mono">Mint {phaseMintedCount >= selected_phase?.maxMint && "🔒"}</span>
                                                                </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => alert("You are not eligible to mint in this phase!!")}
                                                                className={`${(theme = "dark"
                                                                    ? "bg-indigo-500"
                                                                    : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                            >
                                                                <span className="text-white font-mono">Not Eligible ❌</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* user mints  */}
                                {userMints == true &&
                                    <div className={`flex flex-col w-[100%] my-2 p-4 justify-between border-2 border-[#7e7e7e] rounded-[13px]`}>
                                        <h2 className="text-lg text-jacarta-700 dark:text-white tracking-widest font-bold font-mono">Your Mints 🎉</h2>
                                        <p className="text-sm text-jacarta-700 dark:text-white tracking-widest font-normal mb-2">It might take few minutes to update your latest minted NFTs here!</p>
                                        <div className="flex flex-wrap justify-start align-middle">
                                            {mintedNFTsArray?.map((nft) => (
                                                <Link href={`/nft/${nft?.NFTAddress}`} key={nft?._id}>
                                                    <Image
                                                        src={nft?.nft_image}
                                                        height={100}
                                                        width={100}
                                                        alt={nft?.name}
                                                        className="m-[10px] rounded-lg"
                                                    />
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                }
                            </div>
                        </section>
                    </section>

                    {afterMint && (
                        <div className="afterMintDiv">
                            <form className="modal-dialog max-w-2xl">
                                <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                                    <div className="modal-header">
                                        <h5 className="modal-title" id="placeBidLabel">
                                            Success 🥳
                                        </h5>
                                        <button
                                            type="button"
                                            className="btn-close"
                                            data-bs-dismiss="modal"
                                            aria-label="Close"
                                            onClick={() => (setAnyModalOpen(false), setAfterMint(false), getUserWalletMints())}
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
                                                You have successfully minted {mintCount} {collectionData?.name} NFT for {selected_phase?.mintPrice}{" "}
                                                VENOM <br /> <span className="font-mono text-[16px] font-light text-jacarta-700 dark:text-white">(You can view the minted NFTs on this page and your profile in few mins ⌛)</span>
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
                                                onClick={() => (setAnyModalOpen(false), setAfterMint(false), getUserWalletMints())}
                                                className="cursor-pointer flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                            >
                                                Mint More
                                                <RiSwordLine className="ml-[5px] mt-[2px] text-[20px]" />
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
