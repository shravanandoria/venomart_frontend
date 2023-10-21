import React, { useState } from "react";
import Loader from "../../components/Loader";
import Head from "next/head";
import { useStorage } from "@thirdweb-dev/react";
import { create_collection } from "../../utils/user_nft";

const CreateNFTCollection = ({ theme, MintCollectionStatus, signer_address, venomProvider }) => {
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
        external_url: "https://venomart.io/"
    });

    const handleChange = (e) => {
        set_data({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        if (!signer_address) {
            connectWallet();
            return;
        }
        set_loading(true);

        const cover = await storage.upload(data.cover);
        const logo = await storage.upload(data.logo);

        let obj = { ...data, cover: cover, logo: logo };

        const createCollection = await create_collection(venomProvider, signer_address, obj);
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

                                {/* <!-- External URL --> */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-description"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        External URL
                                        <span className="text-red">*</span>
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        An external URL can be your any of your social media url which includes twitter or website, etc
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="external_url"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: https://venomart.io/"
                                    />
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
        </div>
    );
};

export default CreateNFTCollection;
