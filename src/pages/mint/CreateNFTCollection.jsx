import React, { useState } from "react";
import Loader from "../../components/Loader";
import Head from "next/head";
import { useStorage } from "@thirdweb-dev/react";
import { collection_minting_fees, create_main_collection } from "../../utils/user_nft";
import venomLogo from "../../../public/venomBG.webp";
import Image from "next/image";
import Link from "next/link";
import { GoArrowUpRight } from "react-icons/go";

const CreateNFTCollection = ({ theme, MintCollectionStatus, signer_address, venomProvider, setAnyModalOpen }) => {
    const storage = useStorage();

    const [loading, set_loading] = useState(false);
    const [preview, set_preview] = useState({ logo: "", cover: "" });
    const [mintModal, setMintModal] = useState(false);
    const [mintSuccessModal, setMintSuccessModal] = useState(false);

    const [data, set_data] = useState({
        name: "",
        symbol: "",
        logo: "",
        cover: "",
        royalty: "",
        royaltyAddress: "",
        description: "",
        max_supply: "",
        category: "",
        telegram: "",
        twitter: "",
        discord: "",
        website: ""
    });

    const handleChange = (e) => {
        set_data({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        setMintModal(true);
        setAnyModalOpen(true);
    };

    const handle_create_collection = async (e) => {
        e.preventDefault();
        if (!signer_address) {
            connectWallet();
            return;
        }
        set_loading(true);

        const cover = await storage.upload(data.cover);
        const logo = await storage.upload(data.logo);

        let obj = { ...data, cover: cover, logo: logo };

        const createCollection = await create_main_collection(venomProvider, signer_address, obj);
        if (createCollection) {
            setMintModal(false);
            setMintSuccessModal(true);
        }
        set_loading(false);
    };

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Create NFT Collection - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Create your own NFT collection on venom blockchain via venomart marketplace"
                />
                <meta
                    name="keywords"
                    content="venomart, venom blockchain, nft marketplace on venom, venomart nft marketplace, buy and sell nfts, best nft marketplaces, trusted nft marketplace on venom, venom blockchain nft, nft trading on venom, gaming nfts project on venom, defi on venom, nfts on venom, create a collection on venom"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            {mintModal && (
                <div className="backgroundModelBlur backdrop-blur-lg"></div>
            )}
            {mintSuccessModal && (
                <div className="backgroundModelBlur backdrop-blur-lg"></div>
            )}

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <form onSubmit={handle_submit} className="relative py-24  dark:bg-jacarta-900">
                    {MintCollectionStatus ?
                        <div className="container">
                            <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                Create NFT Collection
                            </h1>
                            <div className="mx-auto max-w-[48.125rem]">
                                {/* <!-- Logo Upload --> */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                        Logo
                                        <span className="text-red">*</span>
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Drag or choose your file to upload
                                    </p>

                                    {/* new input  */}
                                    <div className="group relative flex max-w-sm max-h-[10px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                                        {preview.logo ? (
                                            <img src={preview.logo} className="h-24 rounded-lg" />
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
                                            required
                                        />
                                    </div>
                                </div>

                                {/* <!-- Cover Upload --> */}
                                <div className="mb-6">
                                    <label className="mb-2 block font-display text-jacarta-700 dark:text-white">
                                        Cover Image
                                        <span className="text-red">*</span>
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Drag or choose your file to upload
                                    </p>

                                    <div className="group relative flex max-w-md flex-col items-center justify-center rounded-lg border-2 border-dashed border-jacarta-100 bg-white py-20 px-5 text-center dark:border-jacarta-600 dark:bg-jacarta-700">
                                        {preview.cover ? (
                                            <img src={preview.cover} className="h-44 rounded-lg " />
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
                                        {!preview.cover && (
                                            <div className="absolute inset-4 cursor-pointer rounded bg-jacarta-50 opacity-0 group-hover:opacity-100 dark:bg-jacarta-600"></div>
                                        )}

                                        <input
                                            onChange={(e) => {
                                                if (!e.target.files[0]) return;
                                                set_preview({
                                                    ...preview,
                                                    cover: URL.createObjectURL(e.target.files[0]),
                                                });
                                                set_data({ ...data, cover: e.target.files[0] });
                                            }}
                                            type="file"
                                            name="cover"
                                            accept="image/*,video/*"
                                            id="file-upload"
                                            className="absolute inset-0 z-20 cursor-pointer opacity-0"
                                            required
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
                                    <input
                                        onChange={handleChange}
                                        name="name"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: Wild Hunters"
                                        required
                                    />
                                </div>

                                {/* symbol  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Symbol<span className="text-red">*</span>
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="symbol"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: WILDH"
                                        required
                                    />
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
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        rows="4"
                                        required
                                        placeholder="Provide a detailed description of your collection."
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
                                        name="category"
                                        onChange={handleChange}
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                            } `}
                                        required
                                    >
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

                                {/* creator royalty  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Creator Royalty (%)
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        If you set a royalty here, you will get X percent of sales
                                        price each time an NFT is sold on our platform.
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="royalty"
                                        type="number"
                                        id="item-name"
                                        max={10}
                                        step="any"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 5%"
                                    />
                                </div>

                                {/* <!-- Royalty Address --> */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Royalty Address
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        You will get your royalty income on your mentioned royalty address
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="royaltyAddress"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 0:f9a0684d6...4990db5cfeab"
                                    />
                                </div>

                                {/* max supply  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Max Supply
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        If you set a max supply that will be the max NFTs that can be minted ever from your collection
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="max_supply"
                                        type="number"
                                        id="item-name"
                                        step="any"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 5555"
                                    />
                                </div>

                                {/* socials  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Website
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="website"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Website URL"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Twitter
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="twitter"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Twitter URL"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Discord
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="discord"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Discord URL"
                                    />
                                </div>
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Telegram
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="telegram"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Telegram URL"
                                    />
                                </div>

                                {/* <!-- Submit nft form --> */}
                                <button
                                    type="submit"
                                    className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white transition-all cursor-pointer"
                                >
                                    Create Collection
                                </button>
                            </div>
                        </div>
                        :
                        <div className="container">
                            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                Creating NFT Collection is disabled
                            </h1>
                            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                                We will notify once this page goes live again, stay tuned!!
                            </p>
                        </div>
                    }
                </form>
            )}

            {mintModal && (
                <div className="afterMintDiv">
                    <form onSubmit={handle_create_collection} className="modal-dialog max-w-2xl">
                        <div className="modal-content shadow-2xl dark:bg-jacarta-800">
                            <div className="modal-header">
                                <h5 className="modal-title" id="placeBidLabel">
                                    Confirm Create Collection
                                </h5>
                                {!loading && (
                                    <button
                                        type="button"
                                        className="btn-close"
                                        data-bs-dismiss="modal"
                                        aria-label="Close"
                                        onClick={() => (
                                            setMintModal(false), setAnyModalOpen(false)
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
                                )}
                            </div>

                            {/* fees and display section  */}
                            <div className="modal-body p-6">
                                <div className="mb-2 flex items-center justify-between">
                                    <span className="font-display text-jacarta-700 text-sm font-semibold dark:text-white">
                                        You are about to create
                                    </span>
                                </div>
                                <div className="dark:border-jacarta-600 border-jacarta-100 relative flex items-center py-4">
                                    <div className="mr-5 self-start">
                                        <Image
                                            src={preview?.logo?.replace(
                                                "ipfs://",
                                                "https://ipfs.io/ipfs/"
                                            )}
                                            alt="nftPreview"
                                            width="80"
                                            height="80"
                                            className="rounded-2lg"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-display text-jacarta-700 mb-1 text-base font-semibold dark:text-white">
                                            {data?.name} {" "} <span className="text-jacarta-200 dark:text-gray-200">({data?.symbol})</span>
                                        </h3>
                                        <h3 className="text-jacarta-700 mb-1 text-base dark:text-white">
                                            {data?.description}
                                        </h3>
                                    </div>
                                </div>
                                <div className="dark:border-jacarta-600 border-jacarta-100 mb-2 flex items-center justify-between border-b py-2.5">
                                    <span className="font-display text-jacarta-700 hover:text-accent font-semibold dark:text-white">
                                        Minting Fees
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
                                                {collection_minting_fees / 1000000000}
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
                                        I am sure, i want to create this NFT Collection on venom blockchain{" "}
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
                                            Creating{" "}
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
                                            Confirm Create
                                        </button>
                                    )}
                                </div>
                            </div>
                            {loading && (
                                <h3 className="px-12 mb-6 text-[14px] dark:text-white text-jacarta-700 text-center">
                                    Please do not refresh or leave this page, you will get
                                    a popup after your collection is created successfully, hold
                                    tight!
                                </h3>
                            )}
                        </div>
                    </form>
                </div>
            )}

            {mintSuccessModal && (
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
                                    onClick={() => (setMintSuccessModal(false), setAnyModalOpen(false))}
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
                                        You have successfully created the {data.name} collection 🎉🎉🎉 <br /> View your profile to see the
                                        created collection 🤗
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
                                {/* <div className="flex items-center justify-center space-x-4 m-2">
                                    <a
                                        href={`https://twitter.com/intent/tweet?text=Just%20minted%20a%20brand%20new%20NFT%20onchain%20via%20venomart.io%20and%20completed%20the%20venom.network%20latest%20task%20%F0%9F%94%A5%0AHere%20you%20go%20-%20https://venomart.io/mint/CreateNFT%0A%23Venom%20%23venomart%20%23VenomTestnet%20%23VenomNetwork%20%23VenomFoundation`}
                                        target="_blank"
                                        className="flex justify-center rounded-full bg-accent py-3 px-8 text-center font-semibold text-white shadow-accent-volume transition-all hover:bg-accent-dark"
                                    >
                                        Share
                                        <BsFillShareFill className="ml-[8px] mt-[6px] text-[14px]" />
                                    </a>
                                </div> */}
                            </div>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CreateNFTCollection;
