import React, { useState } from "react";
import Loader from "../../components/Loader";
import { useRouter } from "next/router";
import Head from "next/head";
import { useStorage } from "@thirdweb-dev/react";
import { create_launchpad_collection } from "../../utils/mongo_api/launchpad/launchpad";

const CreateLaunch = ({ theme, adminAccount, signer_address }) => {
    const storage = useStorage();

    const router = useRouter();
    const [loading, set_loading] = useState(false);
    const [preview, set_preview] = useState({ logo: "", cover: "" });
    const [data, set_data] = useState({
        logo: "",
        coverImage: "",
        name: "",
        description: "",
        contractAddress: "",
        creatorAddress: "",
        royaltyAddress: "",
        royalty: "",
        website: "",
        twitter: "",
        discord: "",
        maxSupply: "",
        jsonUrl: "",
        mintPrice: "",
        status: "Upcoming",
        startDate: "",
        endDate: "",
        isVerified: false,
        isPropsEnabled: false,
        isActive: true,
        comments: "",
    });

    const handleChange = (e) => {
        set_data({
            ...data,
            [e.target.name]: e.target.value,
        });
    };

    const handle_submit = async (e) => {
        e.preventDefault();
        set_loading(true);

        const ipfs_logo = await storage.upload(data.logo);
        const ipfs_coverImage = await storage.upload(data.coverImage);

        let obj = {
            ...data,
            coverImage: ipfs_coverImage,
            logo: ipfs_logo,
        };

        await create_launchpad_collection(obj);
        set_loading(false);
        // router.push("/explore/Collections");
    };

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Create A Launch - Venomart Marketplace</title>
                <meta
                    name="description"
                    content="Explore, Create and Experience exculsive gaming NFTs on Venomart | Powered by Venom Blockchain"
                />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.png" />
            </Head>

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <form onSubmit={handle_submit} className="relative py-24  dark:bg-jacarta-900">
                    {adminAccount.includes(signer_address) ?
                        <div className="container">
                            <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                Create A Launch
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
                                        {preview.coverImage ? (
                                            <img src={preview.coverImage} className="h-44 rounded-lg " />
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

                                {/* <!-- Description --> */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-description"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Collection Description
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

                                {/* contract address  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Collection Contract Address<span className="text-red">*</span>
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Enter official collection address of this collection
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="contractAddress"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f....."
                                        required
                                    />
                                </div>

                                {/* creator address  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Creator Address<span className="text-red">*</span>
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Make sure to enter the address of owner of this collection
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="creatorAddress"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f..."
                                        required
                                    />
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
                                    />
                                </div>

                                {/* creator royalty  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Creator Royalty (%)<span className="text-red">*</span>
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
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                            } `}
                                        placeholder="Eg: 5%"
                                        required
                                    />
                                </div>

                                {/* status  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Verification status
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        If true then then collection will be verified
                                    </p>
                                    <select
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                            } `}
                                        name="isVerified"
                                        onChange={handleChange}
                                    >
                                        <option value={false}>False</option>
                                        <option value={true}>True</option>
                                    </select>
                                </div>

                                {/* props  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Enable Properties Filter
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        If enabled properties filter will be displayed
                                    </p>
                                    <select
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                            ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                            : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                            } `}
                                        name="isPropsEnabled"
                                        onChange={handleChange}
                                    >
                                        <option value={false}>False</option>
                                        <option value={true}>True</option>
                                    </select>
                                </div>

                                {/* Max Supply */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Max Supply<span className="text-red">*</span>
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="maxSupply"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 5555"
                                        required
                                    />
                                </div>

                                {/* JSON URI  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        JSON URL
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Please enter your JSON url (metadata for NFTs)
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="jsonURL"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg - ipfs.io/ipfs/QmNf1UsmdGaMbpatQ6toXSkzDpizaGmC9zfunCyoz1enD5/wilds/{id}.json"
                                    />
                                </div>

                                {/* mint price */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Mint Price (In Venom)<span className="text-red">*</span>
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        name="mintPrice"
                                        type="number"
                                        id="item-name"
                                        max={10}
                                        step="any"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: 2"
                                        required
                                    />
                                </div>

                                {/* status  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Default live status
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        If true then the launch will be immediately created
                                    </p>
                                    <select
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        name="isActive"
                                        onChange={handleChange}
                                    >
                                        <option value={true}>True</option>
                                        <option value={false}>False</option>
                                    </select>
                                </div>

                                {/* start date  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Start Date
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        NFT minting will be live at the selected date (timer will be started on frontend)
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="startDate"
                                        type="datetime-local"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: owner is legit and here are asset url, discord id, etc"
                                    />
                                </div>

                                {/* start date  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        End Date
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        NFT minting will end at the selected date (timer will be ended on frontend)
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="endDate"
                                        type="datetime-local"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: owner is legit and here are asset url, discord id, etc"
                                    />
                                </div>

                                {/* other Comments  */}
                                <div className="mb-6">
                                    <label
                                        htmlFor="item-name"
                                        className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                    >
                                        Add Comments
                                    </label>
                                    <p className="mb-3 text-2xs dark:text-jacarta-300">
                                        Mention any original asset URL or owner info or anything just for future dispute reference
                                    </p>
                                    <input
                                        onChange={handleChange}
                                        name="comments"
                                        type="text"
                                        id="item-name"
                                        className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark" ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300" : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"} `}
                                        placeholder="Eg: owner is legit and here are asset url, discord id, etc"
                                    />
                                </div>

                                {/* website  */}
                                <div className="mb-6">
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
                                    />
                                </div>

                                {/* twitter  */}
                                <div className="mb-6">
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
                                    />
                                </div>

                                {/* discord  */}
                                <div className="mb-6">
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
                                    />
                                </div>

                                {/* telegram  */}
                                <div className="mb-6">
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
                                    />
                                </div>


                                {/* <!-- Submit nft form --> */}
                                <button
                                    type="submit"
                                    className="rounded-full bg-accent py-3 px-8 text-center font-semibold text-white transition-all cursor-pointer"
                                >
                                    Add Launch
                                </button>
                            </div>
                        </div>
                        :
                        <div className="container">
                            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                You dont have permission to view this page
                            </h1>
                            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                                We are sorry for the inconvenience, if it is a mistake contact us!
                            </p>
                        </div>
                    }
                </form>
            )}
        </div>
    );
};

export default CreateLaunch;
