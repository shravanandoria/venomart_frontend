import React, { useEffect, useState } from "react";
import Loader from "../../components/Loader";
import { useRouter } from "next/router";
import Head from "next/head";
import { useStorage } from "@thirdweb-dev/react";
import { create_launchpad_collection } from "../../utils/mongo_api/launchpad/launchpad";
import moment from "moment";

const CreateLaunch = ({ theme, adminAccount, signer_address }) => {
    const storage = useStorage();

    const router = useRouter();
    const [isVerified, setIsVerified] = useState(true);
    const [isPropsEnabled, setIsPropsEnabled] = useState(true);
    const [isFeatured, setIsFeatured] = useState(false);
    const [isTrading, setIsTrading] = useState(true);
    const [isActive, setIsActive] = useState(true);
    const [phasesModal, setPhasesModal] = useState(false);

    const [loading, set_loading] = useState(false);
    const [preview, set_preview] = useState({ logo: "", cover: "" });
    const [data, set_data] = useState({
        logo: "",
        coverImage: "",
        name: "",
        pageName: "",
        description: "",
        contractAddress: "",
        creatorAddress: "",
        royaltyAddress: "",
        royalty: "",
        website: "",
        twitter: "",
        discord: "",
        telegram: "",
        isVerified,
        isPropsEnabled,
        isFeatured,
        isTrading,
        isActive,
        maxSupply: "",
        Category: "Collectibles",
        phases: [
            {
                phaseName: "",
                maxMint: "",
                mintPrice: "",
                startDate: "",
                startDateUNIX: "",
                EndDate: "",
                EndDateUNIX: "",
                EligibleWallets: [""]
            }
        ]
    });

    // converting time here 
    function convertDBTimeToLocal(dbTime) {
        const date = new Date(dbTime);
        const localMoment = moment(date).local();
        const formattedLocalTime = localMoment.format('MM/DD/YYYY HH:mm:ss [GMT]Z');
        return formattedLocalTime;
    }

    // converting convertDBTimeToDateTimeLocalFormat
    function convertDBTimeToDateTimeLocalFormat(dateTimeString) {
        if (!dateTimeString.includes('T')) {
            return dateTimeString;
        }
        const [datePart, timePart] = dateTimeString.split(' ');
        const [month, day, year] = datePart.split('/').map(part => parseInt(part, 10));
        const [hour, minute] = timePart.split(':').map(part => parseInt(part, 10));
        const datetimeLocalString = `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}T${hour < 10 ? '0' + hour : hour}:${minute < 10 ? '0' + minute : minute}`;
        return datetimeLocalString;
    }

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

    // handling phases addition 
    const handle_change_phases = (index, e) => {
        const values = [...data.phases];
        values[index][e.target.name] = e.target.value;
        if (e.target.name == "startDate") {
            const unixTimestamp = Date.parse(e.target.value) / 1000;
            values[index]["startDateUNIX"] = unixTimestamp;

            const newDate = convertDBTimeToLocal(e.target.value);
            values[index]["startDate"] = newDate;
        }
        if (e.target.name == "EndDate") {
            const unixTimestamp = Date.parse(e.target.value) / 1000;
            values[index]["EndDateUNIX"] = unixTimestamp;

            const newDate = convertDBTimeToLocal(e.target.value);
            values[index]["EndDate"] = newDate;
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
        router.push("/explore/Launchpad");
    };

    return (
        <div className={`${theme}`}>
            <Head>
                <title>Create a launch event - Venomart Marketplace</title>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/fav.webp" />
            </Head>

            {loading ? (
                <Loader theme={theme} />
            ) : (
                <form
                    onSubmit={handle_submit}
                    className="relative py-24  dark:bg-jacarta-900"
                >
                    {adminAccount.includes(signer_address) ? (
                        <div className="container">
                            <h1 className="py-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                Create Launchpad Event
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
                                                <img src={preview.logo} className="h-24 rounded-lg" alt="Image" />
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
                                            {preview.cover ? (
                                                <img src={preview.cover} className="h-44 rounded-lg" alt="Image" />
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
                                            required
                                        />
                                    </div>
                                    <div className="w-[350px] m-3">
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
                                </div>

                                {/* <!-- PageName and Description --> */}
                                <div className="mb-6 flex flex-wrap justify-start">
                                    <div className="w-[350px] m-3 mr-6">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            page Name
                                            <span className="text-red">*</span>
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            Enter a good looking page name
                                        </p>
                                        <input
                                            onChange={handleChange}
                                            name="pageName"
                                            type="text"
                                            id="item-name"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            placeholder="Eg: sentinel_souls"
                                            required
                                        />
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
                                            required
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
                                            placeholder="Eg: 0:481b34e4d5c41ebdbf9b0d75f22f69b822af276c47996c9e37a89e1e2cb05580"
                                        />
                                    </div>
                                </div>

                                {/* royalty address & percent  */}
                                <div className="mb-6 flex flex-wrap justify-start">
                                    <div className="w-[350px] m-3 mr-6">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Royalty Address
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
                                        />
                                    </div>
                                    <div className="w-[350px] m-3">
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
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            placeholder="Eg: 5%"
                                        />
                                    </div>
                                </div>

                                {/* max supply  */}
                                <div className="mb-6 flex flex-wrap justify-start">
                                    <div className="w-[350px] m-3 mr-6">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Max supply<span className="text-red">*</span>
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            Enter the max supply
                                        </p>
                                        <input
                                            onChange={handleChange}
                                            name="maxSupply"
                                            type="text"
                                            id="item-name"
                                            className={`w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent ${theme == "dark"
                                                ? "border-jacarta-600 bg-jacarta-700 text-white placeholder:text-jacarta-300"
                                                : "w-full rounded-lg border-jacarta-100 py-3 hover:ring-2 hover:ring-accent/10 focus:ring-accent border-jacarta-900 bg-white text-black placeholder:text-jacarta-900"
                                                } `}
                                            placeholder="1111"
                                            required
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
                                                                            value={convertDBTimeToDateTimeLocalFormat(data.phases[index].startDate)}
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
                                                                            value={convertDBTimeToDateTimeLocalFormat(data.phases[index].EndDate)}
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
                                                                        <p className="block font-display text-jacarta-700 dark:text-white">Eligible wallets (Accepts only array)</p>
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

                                {/* status and props  */}
                                <div className="mb-6 flex justify-start flex-wrap">
                                    <div className=" m-3 mr-12">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Verification status
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            If checked then the collection will be verified
                                        </p>
                                        <input type="checkbox" name="isVerified" value={true} checked={isVerified} onClick={() => setIsVerified(!isVerified)} onChange={handleCheckChange} />
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
                                        <input type="checkbox" name="isPropsEnabled" value={true} checked={isPropsEnabled} onClick={() => setIsPropsEnabled(!isPropsEnabled)} onChange={handleCheckChange} />
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
                                        <input type="checkbox" name="isTrading" value={true} checked={isTrading} onClick={() => setIsTrading(!isTrading)} onChange={handleCheckChange} />
                                    </div>
                                    <div className=" m-3">
                                        <label
                                            htmlFor="item-name"
                                            className="mb-2 block font-display text-jacarta-700 dark:text-white"
                                        >
                                            Launch Status
                                        </label>
                                        <p className="mb-3 text-2xs dark:text-jacarta-300">
                                            If checked the launch will be immediately made live
                                        </p>
                                        <input type="checkbox" name="isActive" value={true} checked={isActive} onClick={() => setIsActive(!isActive)} onChange={handleCheckChange} />
                                    </div>
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
                    ) : (
                        <div className="container">
                            <h1 className="pt-16 text-center font-display text-4xl font-medium text-jacarta-700 dark:text-white">
                                You dont have permission to view this page
                            </h1>
                            <p className=" pt-2 pb-16 text-center text-[18px] text-jacarta-700 dark:text-white">
                                We are sorry for the inconvenience, if it is a mistake contact
                                us!
                            </p>
                        </div>
                    )}
                </form>
            )}
        </div>
    );
};

export default CreateLaunch;
