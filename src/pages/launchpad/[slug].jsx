import React, { useContext, useEffect, useState } from "react";
import Link from "next/link";
import { MdVerified } from "react-icons/md";
import { RiEarthFill } from "react-icons/ri";
import { GoArrowUpRight, GoDotFill } from "react-icons/go";
import { BsBrowserChrome, BsDiscord, BsFillShareFill, BsInstagram, BsTelegram, BsTwitter } from "react-icons/bs";
import { AiFillCheckCircle, AiFillCloseCircle, AiFillLock } from "react-icons/ai";
import { RiSwordLine } from "react-icons/ri";
import Head from "next/head";
import Loader from "../../components/Loader";
import { create_launchpad_collection, get_launchpad_by_name, get_user_mints, updateLaunchpadStatus, update_launchpad_collection } from "../../utils/mongo_api/launchpad/launchpad";
import { useRouter } from "next/router";
import moment from "moment";
import Image from "next/image";
import { get_address_mint_count, get_phases_name, get_total_minted, launchpad_mint } from "../../utils/launchpad_nft";
import { Timer } from "../../components/Timer";
import { TonClientContext } from "../../context/tonclient";
import { loadNFTs_user } from "../../utils/user_nft";
import { addNFTViaOnchainLaunchpad, addNFTViaOnchainRoll } from "../../utils/mongo_api/nfts/nfts";
import axios from "axios";
import { useStorage } from "@thirdweb-dev/react";

const launchpad = ({
    blockURL,
    theme,
    webURL,
    venomProvider,
    signer_address,
    connectWallet,
    setAnyModalOpen,
    LaunchData,
    OtherImagesBaseURI,
    adminAccount
}) => {
    const router = useRouter();
    const { slug } = router.query;
    const storage = useStorage();


    const [collectionData, setCollectionData] = useState("");
    const [mintedNFTsArray, setMintedNFTsArray] = useState("");
    const [loading, setLoading] = useState(false);
    const [mintLoading, setMintLoading] = useState(false);
    const [mintedNFTs, setMintedNFTs] = useState(0);
    const [mintedPercent, setMintedPercent] = useState(0);
    const [fetchAfterMint, setFetchAfterMint] = useState(false);
    const [afterMint, setAfterMint] = useState(false);
    const [userMints, setUserMints] = useState(false);
    const [status, setStatus] = useState("");
    const [mintCount, setMintCount] = useState(1);
    const [phaseMintedCount, setPhaseMintedCount] = useState(0);
    const [offChainMintedNFTsLength, setOffChainMintedNFTsLength] = useState(0);
    const [editModal, setEditModal] = useState(false);
    const [collectionSettingUpdated, setCollectionSettingUpdated] = useState(false);

    const [phasesModal, setPhasesModal] = useState(false);

    const [preview, set_preview] = useState({ logo: "", coverImage: "" });

    // edit launchpad data
    const [data, set_data] = useState({
        logo: "",
        coverImage: "",
        name: "",
        pageName: "",
        description: "",
        contractAddress: "",
        creatorAddress: "",
        website: "",
        twitter: "",
        discord: "",
        telegram: "",
        maxSupply: "",
        jsonURL: "",
        phases: []
    });

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

    const handleChange = (e) => {
        set_data({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    // handling phases addition 
    const handle_change_phases = (index, e) => {
        const values = [...data.phases];
        values[index][e.target.name] = e.target.value;
        if (e.target.name == "startDate") {
            const unixTimestamp = Date.parse(e.target.value) / 1000;
            values[index]["startDateUNIX"] = [unixTimestamp];
        }
        if (e.target.name == "EndDate") {
            const unixTimestamp = Date.parse(e.target.value) / 1000;
            values[index]["EndDateUNIX"] = [unixTimestamp];
        }
        if (e.target.name == "EligibleWallets") {
            values[index][e.target.name] = [e.target.value];
        }
        set_data({ ...data, phases: values });
    };

    const handle_add_phase = () => {
        set_data({
            ...data,
            phases: [...data.phases, {
                phaseName: "",
                maxMint: "",
                mintPrice: "",
                startDate: "",
                startDateUNIX: "",
                EndDate: "",
                EndDateUNIX: "",
                EligibleWallets: [""]
            }],
        });
    };

    const handle_remove_phase = (index) => {
        const values = [...data.phases];
        values.splice(index, 1);
        set_data({ ...data, phases: values });
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

        await update_launchpad_collection(obj);
        setLoading(false);
        router.reload();
    };

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

        set_preview({
            ...preview,
            logo: launchpaddata?.logo,
            coverImage: launchpaddata?.coverImage,
        });

        set_data({
            logo: launchpaddata?.logo,
            coverImage: launchpaddata?.coverImage,
            name: launchpaddata?.name,
            pageName: launchpaddata?.pageName,
            description: launchpaddata?.description,
            contractAddress: launchpaddata?.contractAddress,
            creatorAddress: launchpaddata?.creatorAddress,
            website: launchpaddata?.socials?.[0],
            twitter: launchpaddata?.socials?.[1],
            discord: launchpaddata?.socials?.[2],
            telegram: launchpaddata?.socials?.[3],
            maxSupply: launchpaddata?.maxSupply,
            jsonURL: launchpaddata?.jsonURL,
            phases: launchpaddata?.phases
        });

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
        setTimeout(() => {
            setLoading(false);
        }, 2000);
    };

    // update mint status
    const updateMintStatus = async () => {
        if (!collectionData || collectionData != "" || collectionData.pageName === "" || !collectionData.phases || !signer_address) return;
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

    // refreshing latest mints here 
    const refreshLatestMints = async () => {
        setLoading(true);
        // fetching nfts onchain 
        const res = await loadNFTs_user(
            venomProvider,
            signer_address,
            undefined,
            client,
            "newestFirst"
        );
        let new_nfts = [];
        res?.nfts
            ?.sort((a, b) => b.last_paid - a.last_paid)
            .filter((e) => e.collection?._address == collectionData?.contractAddress)
            .map((e, index) => {
                try {
                    new_nfts.push({ ...JSON.parse(e.json), ...e });
                } catch (error) {
                    new_nfts.push({ ...e });
                }
            });

        if (offChainMintedNFTsLength >= new_nfts?.length) {
            setLoading(false);
            alert("Your latest mints are already up to date!");
            return;
        }

        // adding the fetched and filtered collection NFTs to DB 
        try {
            const mappingNFTs = await Promise.all(new_nfts.map(async (nft) => {
                let jsonURL = nft?.files[0].source;
                try {
                    const JSONReq = await axios.get(jsonURL);
                    let attributes = JSONReq.data.attributes;
                    const createdNFT = await addNFTViaOnchainLaunchpad(nft, attributes, signer_address, collectionData?.contractAddress);
                    setTimeout(() => {
                        setLoading(false);
                        alert("Your latest mints have been updated!");
                        router.reload();
                    }, 2000);
                } catch (error) {
                    console.log(error);
                    setLoading(false);
                }
            }));
        } catch (error) {
            console.error('Error adding NFTs to the database:', error);
            throw error;
        }
    }

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
        setOffChainMintedNFTsLength(walletMints?.length);
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
        // conditions 
        if (phaseMintedCount >= selected_phase?.maxMint) return (alert("You have max minted in this phase!!"));
        if (!signer_address) {
            connectWallet();
        }
        if (new Date(selected_phase?.EndDate) < new Date()) {
            alert(`Minting for ${selected_phase?.phaseName} has ended!!`);
            return;
        }
        setMintLoading(true);
        // minting here 
        try {
            const launchMint = await launchpad_mint(venomProvider, collectionData?.contractAddress, signer_address, mintCount, selected_phase?.id);
            if (launchMint) {
                setTimeout(async () => {
                    setFetchAfterMint(true);
                    setMintLoading(false);
                }, 2000);
            }
        } catch (error) {
            console.log(error);
            setMintLoading(false);
        }
    };

    // fetching on chain profile NFTs using GQL
    const { client } = useContext(TonClientContext);

    const fetch_user_nfts = async () => {
        if (fetchAfterMint == false) return;
        setMintLoading(true);
        // fetching nfts onchain 
        const res = await loadNFTs_user(
            venomProvider,
            signer_address,
            undefined,
            client,
            "newestFirst"
        );
        let new_nfts = [];
        res?.nfts
            ?.sort((a, b) => b.last_paid - a.last_paid)
            .filter((e) => e.collection?._address == collectionData?.contractAddress)
            .map((e, index) => {
                try {
                    new_nfts.push({ ...JSON.parse(e.json), ...e });
                } catch (error) {
                    new_nfts.push({ ...e });
                }
            });

        // adding the fetched and filtered collection NFTs to DB 
        if (new_nfts != "") {
            try {
                const mappingNFTs = await Promise.all(new_nfts.map(async (nft) => {
                    let jsonURL = nft?.files[0].source;
                    try {
                        const JSONReq = await axios.get(jsonURL);
                        let attributes = JSONReq.data.attributes;
                        const createdNFT = await addNFTViaOnchainLaunchpad(nft, attributes, signer_address, collectionData?.contractAddress);
                        setAfterMint(true);
                        getPhaseWiseMinted();
                        setMintLoading(false);
                    } catch (error) {
                        console.log(error);
                        setMintLoading(false);
                    }
                }));
            } catch (error) {
                console.error('Error adding NFTs to the database:', error);
                throw error;
            }
        }
    };



    useEffect(() => {
        fetch_user_nfts();
    }, [fetchAfterMint]);

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
    }, [selected_phase, signer_address]);

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
                        ? LaunchData?.logo?.replace("ipfs://", OtherImagesBaseURI)
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
                        ? LaunchData?.logo?.replace("ipfs://", OtherImagesBaseURI)
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
            {!loading && editModal && <div className="backgroundModelBlur backdrop-blur-lg"></div>}

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
                                            src={collectionData?.coverImage?.replace("ipfs://", OtherImagesBaseURI)}
                                            alt="coverIMG"
                                            style={{ borderRadius: "25px", width: "100%", marginBottom: "20px" }}
                                        />
                                        {(adminAccount.includes(signer_address)) && (
                                            <div className="container relative -translate-y-4 cursor-pointer" onClick={() => setEditModal(true)}>
                                                <div className="group absolute right-0 bottom-2 flex items-center rounded-lg bg-white py-2 px-4 font-display text-sm hover:bg-accent">
                                                    <span className="mt-0.5 block group-hover:text-white">Launchpad Settings ⚙️</span>
                                                </div>
                                            </div>
                                        )}
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
                                            src={collectionData?.logo?.replace("ipfs://", OtherImagesBaseURI)}
                                        />
                                    </div>

                                    {/* right main */}
                                    <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
                                        <div className="mt-4 mb-12">
                                            {/* mint percent  */}
                                            <div className="flex justify-between">
                                                <h2 className="text-sm text-jacarta-700 dark:text-white tracking-widest">TOTAL MINTED</h2>
                                                <p className="text-jacarta-700 dark:text-white text-sm mb-1">
                                                    {mintedPercent ? mintedPercent : 0}% ({mintedNFTs ? mintedNFTs : 0}/{collectionData?.maxSupply})
                                                </p>
                                            </div>
                                            <div className={`w-[100%] ${theme == "dark" ? "bg-neutral-600" : "bg-neutral-200"} rounded-lg`}>
                                                <div
                                                    className={`bg-indigo-500 p-0.5 h-[12px] text-center text-xs font-medium text-white rounded-lg`}
                                                    style={{ width: mintedPercent ? mintedPercent : 0 + "%" }}
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
                                                                className={`text-[14px] font-mono ${theme == "dark" ? "text-[#efefef]" : "text-[#191919]"}`}
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
                                            {signer_address ?
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
                                                :
                                                <div className="flex w-[100%] mt-4">
                                                    <button
                                                        onClick={() => connectWallet()}
                                                        className={`${(theme = "dark"
                                                            ? "bg-indigo-500"
                                                            : "bg-indigo-500")} hover:bg-indigo-600 text-gray-800 font-bold py-[10px] px-4 rounded inline-flex items-center w-[100%] justify-center`}
                                                    >
                                                        <span className="text-white font-mono">Connect Wallet</span>
                                                    </button>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                </div>

                                {/* user mints  */}
                                {userMints == true &&
                                    <div className={`dark:bg-jacarta-900 lg:w-4/5 mx-auto flex flex-col w-[100%] my-2 mt-12 p-4 justify-between shadow-md shadow-[#dcdcdc] dark:shadow-[#0D102D] rounded-[13px] `}>
                                        <h2 className="text-lg text-jacarta-700 dark:text-white tracking-widest font-bold font-mono">Your Mints 🎉</h2>
                                        <p className="text-[16px] text-jacarta-700 dark:text-white tracking-widest font-mono mb-2"><span className="text-blue cursor-pointer" onClick={() => refreshLatestMints()}>Click here</span> to refresh your latest mints!</p>
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
                                                VENOM <br /> <span className="font-mono text-[16px] font-light text-jacarta-700 dark:text-white">(You can view the minted NFTs on this page and in your profile as well :)</span>
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

            {/* edit collection setting modal  */}
            {editModal && (
                <div className="editDisplayDiv">
                    <form onSubmit={handle_submit} className="pb-8 dark:bg-jacarta-900 bg-white editDisplayForm">
                        <div className="editDisplayDivClose">
                            <button onClick={() => (setAnyModalOpen(false), setEditModal(false))} type="button">
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

                        {collectionSettingUpdated && (
                            <div className="px-8 py-6 bg-green-600 text-white flex justify-between rounded">
                                <div className="flex items-center">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-7 w-7 mr-6"
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                    </svg>
                                    <p>Successfully updated the settings!</p>
                                </div>
                            </div>
                        )}

                        <div className="container">
                            <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                Launchpad settings ⚙️
                            </h1>
                            <div className="mx-auto max-w-[48.125rem]">
                                <div className="flex mb-6 flex-wrap justify-around">
                                    {/* logo  */}
                                    <div className="mt-4">
                                        <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                            Logo (130x130)
                                            <span className="text-red">*</span>
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            Drag or choose your file to upload
                                        </p>
                                        <div className="group relative flex max-w-sm max-h-[10px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                                            {preview.logo ? (
                                                <img src={preview?.logo?.replace("ipfs://", OtherImagesBaseURI)} className="h-24 rounded-lg" alt="Image" />
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
                                            {!preview.logo && (
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

                                    {/* cover  */}
                                    <div className="mt-4">
                                        <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                            Cover Image (1375x300)
                                            <span className="text-red">*</span>
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            Drag or choose your file to upload
                                        </p>

                                        <div className="group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                                            {preview.coverImage ? (
                                                <img src={preview?.coverImage?.replace("ipfs://", OtherImagesBaseURI)} className="h-44 rounded-lg" alt="Image" />
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
                                            {!preview.coverImage && (
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
                                </div>

                                {/* <!-- Name --> */}
                                <div className="mb-6 flex flex-wrap justify-start">
                                    <div className="w-[350px] m-3 mr-6">
                                        <div>
                                            <label
                                                htmlFor="item-name"
                                                className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                            >
                                                Collection Name<span className="text-red">*</span>
                                            </label>
                                            <p className="mb-3 text-2xs dark:text-jacarta-300">
                                                The official name of the collection
                                            </p>
                                        </div>
                                        <input
                                            onChange={handleChange}
                                            name="name"
                                            type="text"
                                            id="item-name"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            placeholder="Eg: Wild Hunters"
                                            value={data?.name}
                                        />
                                        <div className="w-[350px] mt-6">
                                            <label
                                                htmlFor="item-name"
                                                className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                            >
                                                JSON URL (featured external link)
                                            </label>
                                            <input
                                                onChange={handleChange}
                                                name="jsonURL"
                                                type="text"
                                                id="item-name"
                                                className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                    ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                    : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                    } `}
                                                value={data?.jsonURL}
                                                placeholder="Eg: https://venomart.io/"
                                            />
                                        </div>
                                    </div>
                                    <div className="w-[350px] m-3">
                                        <div>
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
                                        </div>
                                        <textarea
                                            onChange={handleChange}
                                            name="description"
                                            id="item-description"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            rows="4"
                                            value={data?.description}
                                            placeholder="Provide a detailed description of your collection."
                                        ></textarea>
                                    </div>
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
                                            value={data?.website}
                                            placeholder="Enter website URL"
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
                                            value={data?.twitter}
                                            placeholder="Enter twitter URL"
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
                                            value={data?.discord}
                                            placeholder="Enter discord URL"
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
                                            value={data?.telegram}
                                            placeholder="Enter telegram URL"
                                        />
                                    </div>
                                </div>

                                {/* contract address & creator address  */}
                                <div className="mb-6 flex flex-wrap justify-start">
                                    <div className="w-[350px] m-3 mr-6">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Collection Contract Address
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="contractAddress"
                                            type="text"
                                            id="item-name"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            value={data?.contractAddress}
                                            placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580"
                                        />
                                    </div>
                                    <div className="w-[350px] m-3">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Creator Address
                                        </label>
                                        <input
                                            onChange={handleChange}
                                            name="creatorAddress"
                                            type="text"
                                            id="item-name"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            value={data?.creatorAddress}
                                            placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580"
                                        />
                                    </div>
                                </div>

                                {/* phases  */}
                                <div className="relative border-b border-jacarta-100 py-6 dark:border-jacarta-600 mb-6 mt-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 24 24"
                                                width="24"
                                                height="24"
                                                className="mr-2 mt-px h-4 w-4 shrink-0 fill-jacarta-700 dark:fill-white"
                                            >
                                                <path fill="none" d="M0 0h24v24H0z" />
                                                <path d="M8 4h13v2H8V4zM5 3v3h1v1H3V6h1V4H3V3h2zM3 14v-2.5h2V11H3v-1h3v2.5H4v.5h2v1H3zm2 5.5H3v-1h2V18H3v-1h3v4H3v-1h2v-.5zM8 11h13v2H8v-2zm0 7h13v2H8v-2z" />
                                            </svg>

                                            <div>
                                                <label className="block font-display text-jacarta-700 dark:text-white">
                                                    Mint Phases <span className="text-red">*</span>
                                                </label>
                                                <p className="dark:text-jacarta-300">
                                                    Add all the available mintable phases properly
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-accent bg-white hover:border-transparent hover:bg-accent dark:bg-jacarta-700"
                                            type="button"
                                            id="item-properties"
                                            data-bs-toggle="modal"
                                            data-bs-target="#propertiesModal"
                                            onClick={() => setPhasesModal(!phasesModal)}
                                        >
                                            {!phasesModal ? (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="24"
                                                    height="24"
                                                    className="fill-accent group-hover:fill-white"
                                                >
                                                    <path fill="none" d="M0 0h24v24H0z" />
                                                    <path d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2z" />
                                                </svg>
                                            ) : (
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="24"
                                                    height="24"
                                                    className="h-6 w-6 fill-jacarta-500 group-hover:fill-white"
                                                >
                                                    <path fill="none" d="M0 0h24v24H0z"></path>
                                                    <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* <!-- Phases  Modal --> */}
                                {phasesModal && (
                                    <div>
                                        <div className="max-w-2xl mb-4">
                                            <div className="modal-content">
                                                <div className="modal-body p-6">
                                                    {data.phases.map((e, index) => (
                                                        <div
                                                            key={index}
                                                            className="relative my-3 flex flex-col items-center mt-12"
                                                        >
                                                            <div>
                                                                <h2 className="block font-display text-jacarta-700 dark:text-white">Phase {index + 1}</h2>
                                                            </div>
                                                            <div className="relative my-3 flex flex-col items-center">
                                                                <div className="relative my-3 flex items-center">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handle_remove_phase(index)}
                                                                        className="flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-l-lg border border-r-0 border-jacarta-100 bg-jacarta-50 hover:bg-jacarta-100 dark:border-jacarta-600 dark:bg-jacarta-700"
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            viewBox="0 0 24 24"
                                                                            width="24"
                                                                            height="24"
                                                                            className="h-6 w-6 fill-jacarta-500 dark:fill-jacarta-300"
                                                                        >
                                                                            <path fill="none" d="M0 0h24v24H0z"></path>
                                                                            <path d="M12 10.586l4.95-4.95 1.414 1.414-4.95 4.95 4.95 4.95-1.414 1.414-4.95-4.95-4.95 4.95-1.414-1.414 4.95-4.95-4.95-4.95L7.05 5.636z"></path>
                                                                        </svg>
                                                                    </button>

                                                                    <div className="flex-1">
                                                                        <input
                                                                            onChange={(e) =>
                                                                                handle_change_phases(index, e)
                                                                            }
                                                                            value={data.phases[index].phaseName}
                                                                            name="phaseName"
                                                                            type="text"
                                                                            className={`h-12 w-full border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                                }`}
                                                                            placeholder="Phase Name"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <input
                                                                            onChange={(e) =>
                                                                                handle_change_phases(index, e)
                                                                            }
                                                                            value={data.phases[index].mintPrice}
                                                                            name="mintPrice"
                                                                            type="number"
                                                                            className={`h-12 w-full border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                                }`}
                                                                            placeholder="Mint Price"
                                                                        />
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <input
                                                                            onChange={(e) =>
                                                                                handle_change_phases(index, e)
                                                                            }
                                                                            value={data.phases[index].maxMint}
                                                                            name="maxMint"
                                                                            type="number"
                                                                            className={`h-12 w-full rounded-r-lg border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                                }`}
                                                                            placeholder="Max Mint Per Wallet"
                                                                        />
                                                                    </div>
                                                                </div>
                                                                <div className="relative my-3 flex items-center">
                                                                    <div className="flex-1">
                                                                        <p className="block font-display text-jacarta-700 dark:text-white">Start Time</p>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                handle_change_phases(index, e)
                                                                            }
                                                                            value={data.phases[index].startDate}
                                                                            name="startDate"
                                                                            type="datetime-local"
                                                                            className={`h-12 w-full border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                                }`}
                                                                        />
                                                                        {data.phases[index].startDateUNIX &&
                                                                            <p className="absolute top-[78px] block text-[16px] text-jacarta-700 dark:text-white">Start Unix - <span className="font-display">{data.phases[index].startDateUNIX}</span></p>
                                                                        }
                                                                    </div>

                                                                    <div className="flex-1">
                                                                        <p className="block font-display text-jacarta-700 dark:text-white">End Time</p>
                                                                        <input
                                                                            onChange={(e) =>
                                                                                handle_change_phases(index, e)
                                                                            }
                                                                            value={data.phases[index].EndDate}
                                                                            name="EndDate"
                                                                            type="datetime-local"
                                                                            className={`h-12 w-full rounded-r-lg border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                                }`}
                                                                        />
                                                                        {data.phases[index].EndDateUNIX &&
                                                                            <p className="absolute top-[78px] block text-[16px] text-jacarta-700 dark:text-white">End Unix - <span className="font-display">{data.phases[index].EndDateUNIX}</span></p>
                                                                        }
                                                                    </div>
                                                                </div>

                                                                <div className="relative my-3 flex items-center w-[100%] mt-8">
                                                                    <div className="flex-1 w-[100%]">
                                                                        <p className="block font-display text-jacarta-700 dark:text-white">Eligible wallets</p>
                                                                        <textarea name="EligibleWallets" className={`h-24 w-[100%] border border-jacarta-100 focus:ring-inset focus:ring-accent ${theme == "dark"
                                                                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                                            : "rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                                            }`} onChange={(e) => handle_change_phases(index, e)} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button
                                                        type="button"
                                                        onClick={handle_add_phase}
                                                        className="mt-2 rounded-full border-2 border-accent py-2 px-8 text-center text-sm font-semibold text-accent transition-all hover:bg-accent hover:text-white"
                                                    >
                                                        Add More
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* <!-- Submit nft form --> */}
                                <button
                                    type="submit"
                                    className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white transition-all cursor-pointer"
                                >
                                    Update Launchpad
                                </button>
                            </div>
                        </div>
                    </form>
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
